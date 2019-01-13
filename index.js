const config = require('./config');
const Engine = require('./src/engine');

const usage = `
Usage: node ./ [name]
* name: username to connect as
`;

const args = process.argv.slice(2);

if (! args.length) {
  console.log(usage);
  process.exit(1);
}

// allow name to contain spaces
const name = args.join(' ');

const engine = new Engine(config, name);

engine.connect();
engine.startPrompt();
