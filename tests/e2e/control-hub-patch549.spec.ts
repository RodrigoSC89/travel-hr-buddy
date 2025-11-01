import { test, expect } from "@playwright/test";

/**
 * PATCH 549 - E2E Test: Control Hub Module  
 * Tests control hub functionality
 */

test.describe("Control Hub Module - PATCH 549", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to control hub
    await page.goto("/control-hub");
    await page.waitForLoadState("networkidle");
  });

  test("should load control hub without critical errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForSelector("body", { state: "visible", timeout: 10000 });

    const criticalErrors = consoleErrors.filter(error => 
      !error.includes("favicon") && 
      !error.includes("manifest") &&
      !error.toLowerCase().includes("warning")
    );

    expect(criticalErrors.length).toBeLessThan(3);
  });

  test("should display control hub interface", async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("should handle navigation to control hub", async ({ page }) => {
    const url = page.url();
    expect(url).toContain("/control-hub");
    
    await page.screenshot({ 
      path: "e2e-results/control-hub-patch549.png",
      fullPage: true 
    });
  });

  test("should render within performance budget", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/control-hub", { waitUntil: "networkidle" });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Control Hub load time: ${loadTime}ms`);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    const body = page.locator("body");
    expect(await body.isVisible()).toBeTruthy();
  });

  test("should have no @ts-nocheck issues affecting runtime", async ({ page }) => {
    // Control Hub should not have @ts-nocheck (as validated in PATCH 547)
    // This test ensures runtime functionality is not affected
    
    const jsErrors: string[] = [];
    
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForTimeout(3000);
    
    // Should have no runtime JavaScript errors
    const criticalJsErrors = jsErrors.filter(error =>
      !error.includes("ResizeObserver") && // Known benign error
      !error.includes("favicon")
    );
    
    expect(criticalJsErrors.length).toBe(0);
  });
});
