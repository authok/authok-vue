module.exports = {
  rootDir: './',
  clearMocks: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './cypress',
    './jest.config.js',
    './__tests__'
  ],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/jest' }]
  ],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  preset: 'ts-jest',
  setupFiles: [],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  }
};
