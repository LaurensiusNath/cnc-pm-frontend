import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // jsdom's test environment defaults to resolving package.json "exports"
  // with a "browser" condition, which makes msw/node pull in
  // @mswjs/interceptors' ESM-only browser build instead of its Node/CJS
  // one. Clearing it restores normal Node resolution for node_modules.
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // testPathIgnorePatterns (next/jest's default) only filters which files
  // count as tests - Jest's haste module map still indexes .next/ for
  // module resolution regardless, and collides with the standalone
  // output's own copied package.json once a build has run locally.
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

export default createJestConfig(config);
