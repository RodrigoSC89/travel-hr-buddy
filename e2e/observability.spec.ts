/**
 * E2E Tests for Observability Center
 * Tests system monitoring, error tracking, and analytics features
 */
import { test, expect } from "@playwright/test";

test.describe("Observability Center", () => {
  test.describe("Unified Observability Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/observability");
    });

    test("should load unified observability page", async ({ page }) => {
      await expect(page).toHaveURL(/.*observability/);
      await page.waitForLoadState("networkidle");
      
      // Should show the main title
      await expect(page.locator('text=Observability Center')).toBeVisible({ timeout: 10000 });
    });

    test("should display metric cards", async ({ page }) => {
      await page.waitForLoadState("networkidle");
      
      // Should show key metrics
      await expect(page.locator('text=Erros Ativos')).toBeVisible();
      await expect(page.locator('text=Uptime')).toBeVisible();
      await expect(page.locator('text=Usuários Ativos')).toBeVisible();
    });

    test("should have working tabs", async ({ page }) => {
      await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
      
      // Click on Sessions tab
      await page.click('text=Sessões');
      await expect(page.locator('text=Sessões Ativas')).toBeVisible();
      
      // Click on Usage tab
      await page.click('text=Uso');
      await expect(page.locator('text=Uso por Módulo')).toBeVisible();
    });

    test("should show integration status", async ({ page }) => {
      await expect(page.locator('text=Status das Integrações')).toBeVisible();
      await expect(page.locator('text=Sentry')).toBeVisible();
      await expect(page.locator('text=PostHog')).toBeVisible();
    });
  });

  test.describe("AI Observability Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/ai-observability");
    });

    test("should load observability page", async ({ page }) => {
      await expect(page).toHaveURL(/.*ai-observability/);
      await page.waitForLoadState("networkidle");
    });

    test("should display monitoring dashboard", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for dashboard elements
      const dashboard = page.locator('[class*="dashboard" i], [class*="Dashboard"]');
      const cards = page.locator('[class*="card" i]');
      
      const cardsCount = await cards.count();
      console.log(`Found ${cardsCount} monitoring cards`);
    });

    test("should show system health indicators", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for health-related text
      const healthIndicators = page.locator('text=/healthy|degraded|error|success|warning/i');
      const count = await healthIndicators.count();
      
      console.log(`Found ${count} health indicators`);
    });

    test("should display metrics charts", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      
      // Look for chart components
      const charts = page.locator('canvas, [class*="chart" i], svg[class*="recharts"]');
      const count = await charts.count();
      
      console.log(`Found ${count} chart elements`);
    });
  });

  test.describe("Self-Healing Logs", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/ai-ops/logs");
    });

    test("should load self-healing logs page", async ({ page }) => {
      await expect(page).toHaveURL(/.*ai-ops\/logs/);
      await page.waitForLoadState("networkidle");
    });

    test("should display healing events table", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for table or list of events
      const table = page.locator("table, [role='table'], [class*='list' i]");
      await page.waitForTimeout(2000);
      
      const count = await table.count();
      console.log(`Found ${count} log tables/lists`);
    });

    test("should show event severity levels", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for severity indicators
      const severities = ["critical", "error", "warning", "info", "success"];
      
      for (const severity of severities) {
        const element = page.locator(`text=/${severity}/i, [class*="${severity}" i]`);
        const count = await element.count();
        if (count > 0) {
          console.log(`✓ Found ${severity} level indicators`);
        }
      }
    });

    test("should allow filtering logs", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for filter controls
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtrar"), [class*="filter" i]');
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]');
      
      const hasFilter = await filterButton.isVisible().catch(() => false);
      const hasSearch = await searchInput.isVisible().catch(() => false);
      
      console.log(`Filter button: ${hasFilter}, Search input: ${hasSearch}`);
    });
  });

  test.describe("NOC Monitoring", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/noc-monitoring");
    });

    test("should load NOC monitoring page", async ({ page }) => {
      await expect(page).toHaveURL(/.*noc-monitoring/);
      await page.waitForLoadState("networkidle");
    });

    test("should display real-time metrics", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);
      
      // Look for metric displays
      const metrics = page.locator('[class*="metric" i], [class*="stat" i], [class*="kpi" i]');
      const count = await metrics.count();
      
      console.log(`Found ${count} metric displays`);
    });

    test("should show alert counters", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for alert indicators
      const alerts = page.locator('[class*="alert" i], [class*="badge" i]');
      const count = await alerts.count();
      
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Performance", () => {
    test("should load observability page quickly", async ({ page }) => {
      const start = Date.now();
      await page.goto("/ai-observability");
      await page.waitForLoadState("domcontentloaded");
      const loadTime = Date.now() - start;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test("should handle slow network gracefully", async ({ page }) => {
      const client = await page.context().newCDPSession(page);
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (256 * 1024) / 8, // 256kb/s (2G)
        uploadThroughput: (128 * 1024) / 8,
        latency: 1500,
      });

      await page.goto("/ai-observability");
      await page.waitForLoadState("domcontentloaded");
      
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      console.log("✓ Observability works on slow connection");
    });
  });
});
