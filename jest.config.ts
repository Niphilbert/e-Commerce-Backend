import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};

export default config;


