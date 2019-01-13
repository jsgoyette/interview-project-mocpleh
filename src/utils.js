const commands = require('./commands');

const inputSplitPattern = /\s+/;
const WELCOME_MSG = `
Welcome to this interview program. You can issue the following commands:
`;

function formatInput(input) {

  // split input string by spaces; first array element is command name,
  // and subsequent elements are the additional args
  return input.split(inputSplitPattern).filter(val => val);
}

function formatResponse(resp) {
  const lines = resp.split(/\n+/).filter(l => l);

  // TODO: change to handle line breaks within json
  // - if json parse fails, join subsequent lines and re-attempt parse until a
  //   successful parse is found
  const decoded = lines.map(line => {
    try {
      const obj = JSON.parse(line);
      return obj;
    }
    catch(err) {
      return {
        type: 'text',
        data: line,
      };
    }
  });

  return decoded;
}

function printWelcome() {
  console.log(WELCOME_MSG);
  console.log(Object.keys(commands));
  console.log('');
}

module.exports = {
  formatInput,
  formatResponse,
  printWelcome,
};
