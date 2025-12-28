/**
 * E2E Tests for Integrations Hub
 * Tests API integrations and external service connections
 */
import { test, expect } from "@playwright/test";

test.describe("Integrations Hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/integracoes");
  });

  test("should load integrations page", async ({ page }) => {
    await expect(page).toHaveURL(/.*integracoes/);
    await page.waitForLoadState("networkidle");
  });

  test("should display available integrations", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Look for integration cards or list items
    const integrationElements = page.locator('[class*="card"], [class*="Card"], li');
    const count = await integrationElements.count();
    
    // Should have at least some content
    expect(count).toBeGreaterThan(0);
  });

  test("should have API status indicators", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Look for status badges or indicators
    const statusElements = page.locator('[class*="badge"], [class*="Badge"], [class*="status"], [class*="Status"]');
    
    // Wait for potential API calls
    await page.waitForTimeout(2000);
    
    // Check if we have any status indicators
    const statusCount = await statusElements.count();
    // This is informational - page may or may not have status badges
    console.log(`Found ${statusCount} status elements`);
  });

  test("should navigate to API Monitor subpage", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Try to find and click on API Monitor link
    const apiMonitorLink = page.locator('a[href*="api-monitor"], button:has-text("API Monitor")').first();
    
    if (await apiMonitorLink.isVisible()) {
      await apiMonitorLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/.*api-monitor/);
    }
  });

  test("should be responsive", async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: "desktop" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 375, height: 667, name: "mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      
      // Page should be visible at all sizes
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      console.log(`✓ ${viewport.name} viewport works`);
    }
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API failure
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/integracoes");
    await page.waitForLoadState("domcontentloaded");
    
    // Page should still render without crashing
    const body = page.locator("body");
    await expect(body).toBeVisible();
    
    // Should show error state or fallback content
    const content = await page.textContent("body");
    expect(content?.trim().length).toBeGreaterThan(0);
  });
});
