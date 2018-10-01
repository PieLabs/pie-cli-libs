const debug = require("debug");

const log = debug("test:is-int");

exports.isInt = config => {
  const intFiles = config.nonFlagArgs.filter(a => a.endsWith(".int.test.ts"));
  return config.testPathPattern === "int" || intFiles.length > 0;
};

exports.isCI = process.env.CI ? process.env.CI.toLowerCase() === "true" : false;
