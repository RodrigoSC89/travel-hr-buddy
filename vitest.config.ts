import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    exclude: ["node_modules", "dist", "e2e", "**/*.spec.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx", "src/tests/**/*.test.ts", "src/tests/**/*.test.tsx"],
    coverage: { provider: "v8", reporter: ["text", "json", "lcov"] }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
