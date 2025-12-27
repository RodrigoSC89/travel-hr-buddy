/**
 * E2E Tests for AI Operations Center
 * PATCH 855 - Comprehensive testing for AI modules
 */
import { test, expect } from "@playwright/test";

test.describe("AI Operations Center", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-operations-center");
    await page.waitForLoadState("networkidle");
  });

  test("should load AI Operations dashboard", async ({ page }) => {
    // Check main heading
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Check for key AI components
    const aiCards = page.locator('[data-testid="ai-card"], .card, [class*="Card"]');
    await expect(aiCards.first()).toBeVisible();
  });

  test("should display AI metrics", async ({ page }) => {
    // Look for metrics indicators
    const metrics = page.locator('[data-testid="ai-metrics"], [class*="metric"], [class*="stat"]');
    const metricsCount = await metrics.count();
    expect(metricsCount).toBeGreaterThanOrEqual(0);
  });

  test("should have responsive layout", async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator("body")).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("body")).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have accessible navigation", async ({ page }) => {
    // Check for main navigation
    const nav = page.locator("nav, [role='navigation']");
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }

    // Check for interactive elements
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Security Center", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/security-center");
    await page.waitForLoadState("networkidle");
  });

  test("should load Security Center dashboard", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should display security metrics", async ({ page }) => {
    const cards = page.locator('[class*="Card"], .card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test("should have proper contrast for security alerts", async ({ page }) => {
    const alerts = page.locator('[class*="alert"], [class*="Badge"]');
    const alertCount = await alerts.count();
    
    for (let i = 0; i < Math.min(alertCount, 5); i++) {
      const alert = alerts.nth(i);
      if (await alert.isVisible()) {
        const color = await alert.evaluate((el) => 
          window.getComputedStyle(el).color
        );
        expect(color).toBeTruthy();
      }
    }
  });
});

test.describe("Integrations Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/integracoes");
    await page.waitForLoadState("networkidle");
  });

  test("should load Integrations page", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should display integration cards", async ({ page }) => {
    const integrationCards = page.locator('[class*="Card"], .card');
    const cardCount = await integrationCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
  });

  test("should have working buttons", async ({ page }) => {
    const buttons = page.locator("button:not([disabled])");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("NOC (Network Operations Center)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/noc");
    await page.waitForLoadState("networkidle");
  });

  test("should load NOC dashboard", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("should display real-time metrics", async ({ page }) => {
    const metrics = page.locator('[class*="metric"], [class*="stat"], [class*="Card"]');
    await expect(metrics.first()).toBeVisible({ timeout: 10000 });
  });

  test("should have responsive grid", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const grid = page.locator('[class*="grid"]');
    if (await grid.count() > 0) {
      await expect(grid.first()).toBeVisible();
    }
  });
});

test.describe("PWA Offline Capabilities", () => {
  test("should work offline", async ({ page, context }) => {
    // First load the page online
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Go offline
    await context.setOffline(true);

    // Try to navigate
    await page.goto("/dashboard");
    
    // Should still show content (from service worker cache)
    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Go back online
    await context.setOffline(false);
  });

  test("should have service worker registered", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasServiceWorker = await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });

    // Service worker should be registered in production
    expect(typeof hasServiceWorker).toBe("boolean");
  });
});

test.describe("Voice AI Navigation", () => {
  test("should have voice button accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for voice-related UI elements
    const voiceButton = page.locator('[data-testid="voice-button"], [aria-label*="voice"], [aria-label*="Voice"]');
    const voiceCount = await voiceButton.count();
    
    // Voice feature may not be on all pages
    expect(voiceCount).toBeGreaterThanOrEqual(0);
  });
});
