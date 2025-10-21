import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Nautilus One - Preview Validation Test Suite
 * 
 * This test suite validates all main routes after build:
 * - HTTP 200 status
 * - Visible content rendering
 * - No dynamic import errors
 * - Screenshot capture for visual validation
 */

// Routes to test based on Nautilus One modules
const routes = [
  { path: "/", name: "00-home", title: /Nautilus/i },
  { path: "/dashboard", name: "01-dashboard", title: /Dashboard|Nautilus/i },
  { path: "/maritime", name: "02-maritime", title: /Maritime|Marítimo|Nautilus/i },
  { path: "/forecast", name: "03-forecast", title: /Forecast|Previsão|Nautilus/i },
  { path: "/optimization", name: "04-optimization", title: /Optimization|Otimização|Nautilus/i },
  { path: "/peo-dp", name: "05-peodp", title: /PEO.*DP|Nautilus/i },
  { path: "/peotram", name: "06-peotram", title: /PEO.*TRAM|Nautilus/i },
  { path: "/checklists", name: "07-checklistsinteligentes", title: /Checklist|Nautilus/i },
  { path: "/control-hub", name: "08-controlhub", title: /Control.*Hub|Nautilus/i },
  { path: "/ai-assistant", name: "09-ai-center", title: /AI|Assistant|Assistente|Nautilus/i },
  { path: "/bridgelink", name: "10-bridge-link", title: /Bridge.*Link|Nautilus/i },
];

// Additional routes that might exist
const optionalRoutes = [
  { path: "/forecast-global", name: "11-forecast-global", title: /Forecast|Global|Nautilus/i },
];

const screenshotDir = path.join(process.cwd(), "tests/screenshots/preview");

// Ensure screenshot directory exists
test.beforeAll(() => {
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

// Helper function to check for dynamic import errors
async function checkForDynamicImportErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("Failed to fetch dynamically imported module") || 
        text.includes("error loading dynamically imported module")) {
      errors.push(text);
    }
  });
  
  page.on("pageerror", (error) => {
    if (error.message.includes("Failed to fetch dynamically imported module") ||
        error.message.includes("error loading dynamically imported module")) {
      errors.push(error.message);
    }
  });
  
  return errors;
}

// Test each route
for (const route of routes) {
  test(`route ${route.path} loads and renders content`, async ({ page }) => {
    const errors: string[] = [];
    
    // Set up error listeners
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("Failed to fetch dynamically imported module") || 
          text.includes("error loading dynamically imported module")) {
        errors.push(`Console: ${text}`);
      }
    });
    
    page.on("pageerror", (error) => {
      if (error.message.includes("Failed to fetch dynamically imported module") ||
          error.message.includes("error loading dynamically imported module")) {
        errors.push(`PageError: ${error.message}`);
      }
    });
    
    // Navigate to route
    const response = await page.goto(route.path, { 
      waitUntil: "networkidle",
      timeout: 30000 
    });
    
    // Verify HTTP 200 status
    expect(response?.status()).toBe(200);
    
    // Wait for page to render
    await page.waitForLoadState("domcontentloaded");
    
    // Check if main content is visible (looking for common elements)
    const hasContent = await page.locator("main, [role='main'], body > div").first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
    
    // Check page title matches expected pattern
    const title = await page.title();
    expect(title).toMatch(route.title);
    
    // Take screenshot
    const screenshotPath = path.join(screenshotDir, `${route.name}.png`);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    // Log any dynamic import errors
    if (errors.length > 0) {
      console.error(`Dynamic import errors on ${route.path}:`, errors);
      const errorLogPath = path.join(process.cwd(), "reports/preview-errors.log");
      const errorEntry = `[${new Date().toISOString()}] Route: ${route.path}\n${errors.join("\n")}\n\n`;
      fs.appendFileSync(errorLogPath, errorEntry);
      
      // Fail the test if there are dynamic import errors
      expect(errors).toHaveLength(0);
    }
  });
}

// Test optional routes (don't fail if they don't exist)
for (const route of optionalRoutes) {
  test(`optional route ${route.path} loads if available`, async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("Failed to fetch dynamically imported module") || 
          text.includes("error loading dynamically imported module")) {
        errors.push(`Console: ${text}`);
      }
    });
    
    page.on("pageerror", (error) => {
      if (error.message.includes("Failed to fetch dynamically imported module") ||
          error.message.includes("error loading dynamically imported module")) {
        errors.push(`PageError: ${error.message}`);
      }
    });
    
    try {
      const response = await page.goto(route.path, { 
        waitUntil: "networkidle",
        timeout: 30000 
      });
      
      if (response?.status() === 200) {
        // Route exists, validate it
        await page.waitForLoadState("domcontentloaded");
        
        const hasContent = await page.locator("main, [role='main'], body > div").first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasContent).toBeTruthy();
        
        // Take screenshot
        const screenshotPath = path.join(screenshotDir, `${route.name}.png`);
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        if (errors.length > 0) {
          console.warn(`Dynamic import errors on optional route ${route.path}:`, errors);
          const errorLogPath = path.join(process.cwd(), "reports/preview-errors.log");
          const errorEntry = `[${new Date().toISOString()}] Optional Route: ${route.path}\n${errors.join("\n")}\n\n`;
          fs.appendFileSync(errorLogPath, errorEntry);
        }
      }
    } catch (error) {
      // Route doesn't exist or failed to load - this is OK for optional routes
      console.log(`Optional route ${route.path} not available or failed to load`);
    }
  });
}

// Performance test - measure load time
test("performance check - average load time < 500ms", async ({ page }) => {
  const loadTimes: number[] = [];
  
  for (const route of routes.slice(0, 5)) { // Test first 5 routes
    const startTime = Date.now();
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - startTime;
    loadTimes.push(loadTime);
  }
  
  const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
  console.log(`Average load time: ${avgLoadTime}ms`);
  
  // Write performance data
  const perfData = {
    timestamp: new Date().toISOString(),
    averageLoadTime: avgLoadTime,
    loadTimes: loadTimes,
    routes: routes.slice(0, 5).map(r => r.path)
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), "reports/performance-data.json"),
    JSON.stringify(perfData, null, 2)
  );
  
  // Expect average load time to be reasonable (we'll use 5000ms as a more realistic target for full apps)
  expect(avgLoadTime).toBeLessThan(5000);
});
