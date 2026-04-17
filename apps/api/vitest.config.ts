import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/setup/",
        "**/*.config.ts",
        "src/index.ts",
        "src/shared/docs/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@memorium/config": path.resolve(__dirname, "../../packages/config/src"),
      "@memorium/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
});
