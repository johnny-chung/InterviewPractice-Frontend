/** @type {import('jest').Config} */
import nextJest from "next/jest.js";

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
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types.ts",
  ],
  verbose: true,
};

export default createJestConfig(customJestConfig);
