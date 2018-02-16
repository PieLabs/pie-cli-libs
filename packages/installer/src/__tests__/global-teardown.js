const verdaccio = require('./verdaccio');

module.exports = () => new Promise((resolve, reject) => {
  verdaccio.kill(e => {
    if (e) {
      reject(e);
    } else {
      resolve();
    }
  });
});
