module.exports = {
  collectCoverageFrom: ['**/src/**/*.js'],
  testEnvironment: 'jest-environment-node',
  verbose: true,
  testURL: 'http://localhost/',
  setupFilesAfterEnv: ['<rootDir>/test/test-db-setup.js'],
  testPathIgnorePatterns: ['dist/'],
  restoreMocks: true,
}
