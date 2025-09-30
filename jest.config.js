// This file is used to configure Jest for a React Native project.
// Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverage: false, // Disable coverage for now since we have no tests
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/'
  ],
  // Pass with no tests to prevent CI failures
  passWithNoTests: true
};
  