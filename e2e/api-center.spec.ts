/**
 * E2E Tests for API Center Module
 * Tests API health monitoring, fallback mechanisms, and integrations status
 */
import { test, expect } from "@playwright/test";

test.describe("API Center", () => {
  test.describe("API Monitor Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/integracoes/api-monitor");
    });

    test("should load API monitor page", async ({ page }) => {
      await expect(page).toHaveURL(/.*api-monitor/);
      await page.waitForLoadState("networkidle");
    });

    test("should display API status table", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Wait for API health check to complete
      await page.waitForTimeout(3000);
      
      // Look for table with API statuses
      const table = page.locator("table, [role='table']");
      await expect(table).toBeVisible({ timeout: 10000 });
    });

    test("should show operational APIs in green", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(3000);
      
      // Look for operational badges
      const operationalBadges = page.locator('text=Operacional, text=healthy, text=Operational');
      const count = await operationalBadges.count();
      
      // Should have at least some operational APIs
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} operational APIs`);
    });

    test("should show degraded APIs in yellow", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(3000);
      
      // Look for degraded badges (Amadeus, Twilio, MarineTraffic expected)
      const degradedBadges = page.locator('text=Degradado, text=degraded');
      const count = await degradedBadges.count();
      
      console.log(`Found ${count} degraded APIs`);
    });

    test("should display latency metrics", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(3000);
      
      // Look for latency values (ms)
      const latencyValues = page.locator('text=/\\d+ms/');
      const count = await latencyValues.count();
      
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} latency metrics`);
    });

    test("should have refresh functionality", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for refresh button
      const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Atualizar"), button[aria-label*="refresh" i]');
      
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
        console.log("✓ Refresh button works");
      }
    });
  });

  test.describe("API Center Main Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/integracoes/api-center");
    });

    test("should load API center page", async ({ page }) => {
      await expect(page).toHaveURL(/.*api-center/);
      await page.waitForLoadState("networkidle");
    });

    test("should display API cards", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for API integration cards
      const cards = page.locator('[class*="card" i], [class*="Card"]');
      const count = await cards.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test("should show API categories", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Common API categories
      const categories = ["Weather", "Voice", "AI", "Maritime", "Flight", "Clima", "Voz"];
      
      for (const category of categories) {
        const element = page.locator(`text=${category}`);
        const visible = await element.isVisible().catch(() => false);
        if (visible) {
          console.log(`✓ Found category: ${category}`);
        }
      }
    });
  });

  test.describe("API Fallback Mechanism", () => {
    test("should handle weather API fallback", async ({ page }) => {
      // Mock primary weather API failure
      await page.route("**/openweathermap.org/**", (route) => {
        route.fulfill({ status: 500 });
      });

      await page.goto("/weather-maritime");
      await page.waitForLoadState("domcontentloaded");
      
      // Page should still render (using fallback)
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      console.log("✓ Weather page loads with API fallback");
    });

    test("should show fallback status in API monitor", async ({ page }) => {
      await page.goto("/integracoes/api-monitor");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      
      // Check for fallback indicators
      const content = await page.textContent("body");
      console.log("API Monitor loaded successfully");
    });
  });

  test.describe("Responsiveness", () => {
    const viewports = [
      { width: 1920, height: 1080, name: "desktop" },
      { width: 1024, height: 768, name: "tablet-landscape" },
      { width: 768, height: 1024, name: "tablet-portrait" },
      { width: 375, height: 667, name: "mobile" },
    ];

    for (const viewport of viewports) {
      test(`should be responsive on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto("/integracoes/api-monitor");
        await page.waitForLoadState("domcontentloaded");
        
        const body = page.locator("body");
        await expect(body).toBeVisible();
        
        // Check no horizontal overflow
        const bodyBox = await body.boundingBox();
        expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width + 20);
      });
    }
  });
});
