module.exports = {
    // other Jest configurations...
    rootDir: './',
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      testEnvironment: 'jsdom',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      transformIgnorePatterns: ['<rootDir>/node_modules/'],
      watchPathIgnorePatterns: ['<rootDir>/node_modules/'],
      // transformIgnorePatterns: [
      //   "/node_modules/(?!(module-to-transform|another-module)/)"
      // ],
  };
