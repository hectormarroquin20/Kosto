const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

// module.exports = {
//   preset: 'ts-jest',clear
//   testEnvironment: 'node',
//   rootDir: '.',
//   moduleNameMapper: {
//     '^@/(.*)$': '<rootDir>/src/$1',
//     '^@root/(.*)$': '<rootDir>/$1',
//     '^@kosto/(.*)$': '<rootDir>/src/$1'
//   },
//   testMatch: ['**/tests/unit/**/*.test.ts'],
//   transform: {
//     '^.+\\.tsx?$': ['ts-jest', {
//       // Forzamos ignorar la validación que está dando el error
//       diagnostics: {
//         ignoreCodes: [151002, 5103]
//       },
//       tsconfig: 'tsconfig.json'
//     }]
//   }
// };

const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  // Reemplazamos <rootDir> por rutas absolutas dinámicas basadas en la carpeta actual
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, 'src/$1'),
    '^@root/(.*)$': path.resolve(__dirname, '$1'),
    '^@kosto/(.*)$': path.resolve(__dirname, 'src/$1')
  },
  testMatch: ['**/tests/unit/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: {
        ignoreCodes: [151002, 5103]
      },
      // Forzamos a que encuentre el tsconfig de la subcarpeta kosto
      tsconfig: path.resolve(__dirname, 'tsconfig.json')
    }]
  }
};
