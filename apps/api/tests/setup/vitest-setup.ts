import { beforeAll, afterAll, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";

const TEST_CONFIG_PATH = path.resolve(
  process.cwd(),
  "test-memorium.config.json",
);

beforeAll(() => {
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  if (fs.existsSync(TEST_CONFIG_PATH)) {
    fs.unlinkSync(TEST_CONFIG_PATH);
  }
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

export const testConfigPath = TEST_CONFIG_PATH;
