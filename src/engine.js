const net = require('net');
const readline = require('readline');

const utils = require('./utils');
const commands = require('./commands');
const respHandlers = require('./resp-handlers');

const INVALID_CMD_ERROR = 'Error: command must be one of:';

/**
 * Engine class
 */
class Engine {

  /**
   * Create new engine instance
   * @param {object} config - the base confg object
   * @param {string} name - username for connection
   */
  constructor(config, name) {

    this.config = config;
    this.name = name;

    this.connection = null;
    this.prompt = null;
    this.timeout = null;

    this.connected = false;
    this.showWelcomeResponse = true;
  }

  /**
   * Start the command line prompt
   */
  startPrompt() {
    utils.printWelcome(Object.keys(commands));

    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    prompt.on('line', line => {
      // console.log(line);
      this.runCommand(line);
    });

    this.prompt = prompt;
  }

  /**
   * Connect to remote host
   */
  connect() {
    const client = new net.Socket();

    client.setEncoding('utf8');

    client.connect(this.config.port, this.config.host, () => {
      this.login();
    });

    client.on('connect', () => {
      console.log(`Connected as ${this.name}`);
      this.waitNextHeartbeat();
    });

    client.on('data', data => {
      this.connected = true;
      this.handleResponse(data);
    });

    client.on('close', () => {
      this.connected = false;
    });

    client.on('error', err => {
      console.log('Connection error:', err.message);
      process.exit(1);
    });

    this.connection = client;
  }

  /**
   * Disconnect from remote host
   */
  disconnect() {
    if (! this.connection) {
      return;
    }

    clearTimeout(this.timeout);

    this.connection.destroy();
    this.connection = null;
  }

  /**
   * Reconnect to remote host
   */
  reconnect() {
    console.log('Reconnecting...');
    this.disconnect();
    this.connect();
  }

  /**
   * Wait for next heartbeat, reconnect if timeout reached
   */
  waitNextHeartbeat() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.reconnect();
    }, this.config.timeoutDuration * 1000);
  }

  /**
   * Handle response from remote host
   */
  handleResponse(data) {
    const messages = utils.formatResponse(data);

    messages.forEach(msg => {
      // console.log('msg', msg);

      if (msg.type === 'heartbeat') {
        this.waitNextHeartbeat();
      }
      else if (msg.type === 'welcome') {

        // only show the welcome response for the first login
        if (this.showWelcomeResponse) {

          this.showWelcomeResponse = false;
          respHandlers.default(msg);
        }
      }
      else if (msg.type === 'error') {
        let errStr = 'ERROR:';

        if (resp.msg) {
          console.log(`${errStr} ${resp.msg}`);
        }
        else if (resp.reason) {
          console.log(`${errStr} ${resp.reason}\n${resp.result}`);
        }

        // new login required after error
        this.login();
      }
      else if (respHandlers[msg.type]) {
        respHandlers[msg.type](msg);
      }
    });
  }

  /**
   * Run command issued by prompt
   */
  runCommand(input) {
    if (! this.connected) {
      return console.log('Please wait for the client to connect');
    }

    const [cmdName, ...args] = utils.formatInput(input);

    // log invalid command if not a registered command
    if (! commands[cmdName]) {
      console.log(INVALID_CMD_ERROR, Object.keys(commands));
      return;
    }

    const request = commands[cmdName].buildRequest(args);

    this.connection.write(JSON.stringify(request));
  }

  login() {
    const msg = JSON.stringify({ name: this.name });
    this.connection.write(msg);
  }
}

module.exports = Engine;
