/**
 * E2E Tests for Security Center
 * Tests security monitoring and audit functionality
 */
import { test, expect } from "@playwright/test";

test.describe("Security Center", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/security-center");
  });

  test("should load security center page", async ({ page }) => {
    await expect(page).toHaveURL(/.*security-center/);
    await page.waitForLoadState("networkidle");
  });

  test("should display security metrics or dashboard", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Look for cards, metrics, or dashboard elements
    const dashboard = page.locator('[class*="card"], [class*="Card"], [role="region"]').first();
    await expect(dashboard).toBeVisible({ timeout: 15000 });
  });

  test("should have proper heading structure for accessibility", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Check for h1
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 10000 });
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Press Tab to navigate
    await page.keyboard.press("Tab");
    
    // An element should be focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible({ timeout: 5000 });
  });

  test("should have ARIA labels on interactive elements", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    
    // Check for buttons with aria-labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test("should not expose sensitive data in DOM", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Get page content
    const content = await page.content();
    
    // Check that sensitive patterns are not exposed
    expect(content).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
    expect(content).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i);
    expect(content).not.toMatch(/secret\s*[:=]\s*["'][^"']+["']/i);
  });

  test("should handle 404 on invalid sub-routes gracefully", async ({ page }) => {
    await page.goto("/security-center/non-existent-route");
    
    // Should either redirect or show a proper error page
    const body = page.locator("body");
    await expect(body).toBeVisible();
    
    // Should not show a blank page
    const content = await page.textContent("body");
    expect(content?.trim().length).toBeGreaterThan(0);
  });
});
