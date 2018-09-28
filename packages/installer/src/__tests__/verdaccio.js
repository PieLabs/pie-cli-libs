const { spawn, ChildProcess, spawnSync } = require("child_process");
const debug = require("debug");

let verdaccio = null;

const log = debug("test:verdaccio");

/**
 * We assume that you've published all the elements in @pie-test-elements to verdaccio.
 * We may want to add this to the boot function.
 * @param done
 */
exports.boot = function(done) {
  log(">>>>>>>>>>>>>>>>>>>>>> BOOT", verdaccio === null);

  if (verdaccio) {
    done(new Error("already booted"));
    return;
  }

  spawnSync("npm", ["set", "registry", "http://localhost:4873"]);
  verdaccio = spawn("verdaccio");

  verdaccio.on("error", e => {
    log(">> Error: ", e);
  });

  verdaccio.on("close", () => {
    log("verdaccio shut down");
  });

  setTimeout(() => done(), 500);
};

exports.kill = function(done) {
  log(">>>>>>>>>>>>>>>>>>>>>> KILL", verdaccio === null);

  if (!verdaccio) {
    done(new Error("no verdaccio instance to shut down"));
    return;
  }

  log(">>>>>>>>>>>>>>>>>>>>>> KILL - killing verdaccio");
  spawnSync("npm", ["config", "delete", "registry"]);
  verdaccio.kill();
  verdaccio = null;
  setTimeout(() => done(), 500);
};
