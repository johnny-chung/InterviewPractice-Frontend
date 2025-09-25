/** @type {import('jest').Config} */
const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.(css|scss|sass)$": "identity-obj-proxy",
    "^.+\\.(svg|png|jpg|jpeg|gif|webp|avif)$":
      "<rootDir>/test/__mocks__/fileMock.js",
  },
  // Rely on default testMatch (no roots override) so Jest traverses the whole project
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types.ts",
  ],
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);
