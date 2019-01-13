const commands = {

  count: {
    description: 'Get the worker count',

    buildRequest(args) {
      return {
        request: 'count',
      }
    },
  },

  time: {
    description: 'Get the worker time',

    buildRequest(args) {
      const request = {
        request: 'time',
      }

      if (args.length) {
        request.id = args.join(' ');
      }

      return request;
    },
  }
};

module.exports = commands;
