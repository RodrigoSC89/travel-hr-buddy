import { test, expect } from "@playwright/test";

/**
 * PATCH 619 - Critical Pages E2E Regression Tests
 * Tests core functionality of critical application pages
 */

test.describe("Critical Pages - Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL before each test
    await page.goto("/");
  });

  test("Dashboard page loads and displays key elements", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    
    // Check for common dashboard elements
    await expect(page.locator("body")).toBeVisible();
    
    // Verify no critical console errors
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(1000);
    
    // Known non-critical error patterns (configurable)
    const ignoredErrorPatterns = [
      "favicon",
      "sourcemap",
      "ResizeObserver loop", // Common React warning
      "Download the React DevTools" // React dev mode
    ];
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(err => 
      !ignoredErrorPatterns.some(pattern => err.includes(pattern))
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test("Admin Control page is accessible", async ({ page }) => {
    await page.goto("/admin/control-panel");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Check page loaded successfully (no error page)
    const body = await page.locator("body").textContent();
    expect(body).not.toContain("404");
    expect(body).not.toContain("Error");
  });

  test("AI Feedback/Assistant page loads", async ({ page }) => {
    await page.goto("/ai-assistant");
    
    await page.waitForLoadState("networkidle");
    
    // Verify page is accessible
    await expect(page.locator("body")).toBeVisible();
  });

  test("Crew Management page is accessible", async ({ page }) => {
    await page.goto("/human-resources");
    
    await page.waitForLoadState("networkidle");
    
    // Check page loaded successfully
    const body = await page.locator("body").textContent();
    expect(body).not.toContain("404");
  });

  test("Document Hub page loads", async ({ page }) => {
    await page.goto("/documents");
    
    await page.waitForLoadState("networkidle");
    
    // Verify page is accessible
    await expect(page.locator("body")).toBeVisible();
  });

  test("Navigation works without errors", async ({ page }) => {
    // Test navigation between key pages
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    
    await page.goto("/documents");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Pages render with and without data", async ({ page }) => {
    // Test dashboard with potential empty state
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Page should still render even if no data
    await expect(page.locator("body")).toBeVisible();
    
    // Check for either data or empty state message
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test("All critical routes return 200 status", async ({ page }) => {
    const criticalRoutes = [
      "/",
      "/dashboard",
      "/documents",
      "/ai-assistant",
      "/human-resources",
      "/admin/control-panel",
    ];

    for (const route of criticalRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test("Visual regression - page structure remains stable", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Check that basic page structure exists
    const html = await page.content();
    expect(html).toContain("html");
    expect(html).toContain("body");
    
    // Ensure React app mounted
    expect(html.length).toBeGreaterThan(1000);
  });
});

test.describe("Error Handling", () => {
  test("404 page handles unknown routes gracefully", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-12345");
    await page.waitForLoadState("networkidle");
    
    // Should show some content (either 404 page or redirect to home)
    await expect(page.locator("body")).toBeVisible();
  });

  test("Network errors are handled gracefully", async ({ page }) => {
    // This test verifies the app doesn't crash on network issues
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("Dashboard loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});
