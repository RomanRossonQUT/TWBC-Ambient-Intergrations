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
  