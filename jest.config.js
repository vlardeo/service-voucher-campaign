/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['./test'],
  globalSetup: '<rootDir>/tests/setup.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/setup-after-env.ts'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@env': '<rootDir>/src/env',
    '@tests/(.*)': '<rootDir>/tests/$1',
  },
};
