const base = require('./jest.config');

module.exports = Object.assign(base, {
  globalSetup: './src/__tests__/global-setup.js',
  globalTeardown: './src/__tests__/global-teardown.js',
  testMatch: [
    '**/__tests__/**/*.int.*.ts'
  ]
}); 