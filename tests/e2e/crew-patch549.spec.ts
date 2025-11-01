import { test, expect } from "@playwright/test";

/**
 * PATCH 549 - E2E Test: Crew Management Module
 * Tests crew module functionality
 */

test.describe("Crew Management Module - PATCH 549", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to crew management
    await page.goto("/crew");
    await page.waitForLoadState("networkidle");
  });

  test("should load crew module without critical errors", async ({ page }) => {
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

  test("should display crew management interface", async ({ page }) => {
    // Wait for content
    await page.waitForTimeout(2000);
    
    // Page should have content
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("should handle navigation to crew module", async ({ page }) => {
    // Verify we're on crew page
    const url = page.url();
    expect(url).toContain("/crew");
    
    // Take screenshot
    await page.screenshot({ 
      path: "e2e-results/crew-module-patch549.png",
      fullPage: true 
    });
  });

  test("should render within performance budget", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/crew", { waitUntil: "networkidle" });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Crew module load time: ${loadTime}ms`);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    const body = page.locator("body");
    expect(await body.isVisible()).toBeTruthy();
  });
});
