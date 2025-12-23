import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration - Nautilus One CI
 * https://playwright.dev/docs/test-configuration
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  
  // Enhanced reporters
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results.json" }],
    ["list"],
  ],
  
  expect: {
    timeout: 5000,
  },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Headers
    extraHTTPHeaders: {
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  },

  // Projects for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // Tablet viewport
    {
      name: "Tablet",
      use: { ...devices["iPad Pro 11"] },
    },

    // Slow network simulation (VSAT 1.5Mbps)
    {
      name: "slow-network",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-dev-shm-usage"],
        },
      },
    },
  ],

  // Development server
  webServer: {
    command: "npm run preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directories
  outputDir: "test-artifacts",
});
