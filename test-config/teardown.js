const { isInt } = require("./is-int");

const verdaccio = require("./verdaccio");

module.exports = config => {
  if (isInt(config)) {
    return new Promise((resolve, reject) => {
      verdaccio.kill(e => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  } else {
    return Promise.resolve();
  }
};
