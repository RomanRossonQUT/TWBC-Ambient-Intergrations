// This file is used to configure Jest for a JavaScript project.
// Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
module.exports = {
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
  };
  