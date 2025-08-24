import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js", "src/**/*.test.ts"],
    coverage: {
      include: ["src/**/*.js", "src/**/*.ts"],
      exclude: ["src/**/*.test.js", "src/**/*.test.ts"],
      reporter: ["text", "html", "lcov"],
    },
    globals: true,
  },
});
