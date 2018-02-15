const verdaccio = require('./verdaccio');

module.exports = () => new Promise((resolve, reject) => {
  verdaccio.boot(err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
})
