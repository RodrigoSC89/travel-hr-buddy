import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    css: true,
    testTimeout: 15000, // Increase timeout to 15 seconds for tests with external calls
    env: {
      NODE_ENV: "test", // Set NODE_ENV to test to skip delays in fallback logic
    },
    exclude: ["node_modules", "dist", "e2e", "**/*.spec.ts"], // Exclude E2E tests
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx", "src/tests/**/*.test.ts", "src/tests/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
