const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@root/(.*)$': '<rootDir>/$1',
    '^@kosto/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/tests/unit/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // Forzamos ignorar la validación que está dando el error
      diagnostics: {
        ignoreCodes: [151002, 5103]
      },
      tsconfig: 'tsconfig.json'
    }]
  }
};