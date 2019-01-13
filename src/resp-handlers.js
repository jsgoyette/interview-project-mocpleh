const handlers = {

  default(resp) {
    console.log(resp.msg);
  },

  text(resp) {
    // no-op: ignore invalid json responses
    // console.log(`TXT: ${resp.data}`);
  },

  msg(resp) {

    // only log messages from the worker
    if (resp.sender !== 'worker') return;

    console.log(`Message from ${resp.sender}, ${resp.date}:`);
    console.log(resp.msg);

    // display notice if random number is greater than 30
    if (resp.msg.random > 30) {
      console.log('Notice: random greater than 30');
    }
  },
};

module.exports = handlers;
