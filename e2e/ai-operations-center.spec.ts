/**
 * E2E Tests for AI Operations Center
 * Tests core functionality of the AI Operations module
 */
import { test, expect } from "@playwright/test";

test.describe("AI Operations Center", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI Operations Center
    await page.goto("/ai-operations-center");
  });

  test("should load the page without errors", async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveURL(/.*ai-operations-center/);
    
    // Should not have any uncaught errors
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
  });

  test("should display main heading", async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState("domcontentloaded");
    
    // Check for main heading or title
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should have navigation elements", async ({ page }) => {
    // Check that sidebar or navigation exists
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Page should still be functional
    await page.waitForLoadState("domcontentloaded");
    
    // Content should be visible
    const mainContent = page.locator("main, [role='main'], .container").first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test("should handle slow network gracefully", async ({ page }) => {
    // Simulate slow 3G network
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kb/s
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    });

    await page.goto("/ai-operations-center");
    
    // Should show loading state or content
    await page.waitForLoadState("domcontentloaded");
    
    // Page should eventually load without errors
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
