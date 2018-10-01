const { isInt } = require("./is-int");
const verdaccio = require("./verdaccio");
const fs = require("fs-extra");

const bootVerdaccio = () =>
  new Promise((resolve, reject) => {
    verdaccio.boot(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

module.exports = async config => {
  if (!config) {
    throw new Error("no global config?");
  }

  if (isInt(config)) {
    const result = await bootVerdaccio();

    console.log("VERDACCIO BOOOOOTED");
    return result;
  } else {
    return null;
  }
};
