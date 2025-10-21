import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Nautilus One Preview Scan
 * Tests route availability and captures screenshots for visual validation
 */
export default defineConfig({
  testDir: "./e2e/preview",
  fullyParallel: false, // Run tests sequentially for consistent results
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for preview scan
  workers: 1, // Single worker for consistent testing
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report-preview" }],
    ["json", { outputFile: "reports/preview-test-results.json" }]
  ],
  timeout: 60000, // 60 seconds per test
  use: {
    baseURL: "http://localhost:4173", // Vite preview server
    trace: "on-first-retry",
    screenshot: "on",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Web server configuration for preview
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
