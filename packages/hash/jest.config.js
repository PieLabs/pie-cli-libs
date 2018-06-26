module.exports = {
  verbose: true,
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "<rootDir>/preprocessor.js"
  },
  testMatch: ["**/src/__test__/**/*.ts"]
};
