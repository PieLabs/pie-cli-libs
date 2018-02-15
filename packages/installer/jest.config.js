module.exports = {
  verbose: true,
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "<rootDir>/preprocessor.js"
  },
  testMatch: [
    "**/__tests__/**/*.ts"
  ]
}
