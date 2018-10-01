const tsJest = require("ts-jest");

module.exports = Object.assign({}, tsJest.jestPreset, {
  globalSetup: "./test-config/setup.js",
  globalTeardown: "./test-config/teardown.js",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      diagnostics: false,
      tsConfig: {
        target: "es6",
        esModuleInterop: true
      }
    }
  }
});
