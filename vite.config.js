import { defineConfig } from "vitest/config";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,ts}"],
    coverage: {
      include: ["src/**/*.{js,ts}"],
      exclude: ["src/**/*.test.{js,ts}"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
