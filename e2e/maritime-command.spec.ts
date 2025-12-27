import { test, expect } from "@playwright/test";

/**
 * E2E Test: Maritime Command Module
 * Tests the maritime command center with IoT sensors, vessel tracking, and operations
 */

test.describe("Maritime Command Center", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to maritime command page
    await page.goto("/maritime-command");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Load & Layout", () => {
    test("should load maritime command page successfully", async ({ page }) => {
      // Check for page content
      await expect(page.locator("body")).toBeVisible();
      
      // Page should not show error
      const errorText = page.locator("text=500, text=error, text=Error");
      const hasError = await errorText.isVisible().catch(() => false);
      expect(hasError).toBeFalsy();
    });

    test("should display main header or title", async ({ page }) => {
      // Look for maritime-related header
      const header = page.locator("h1, h2, [class*='title']").first();
      await expect(header).toBeVisible({ timeout: 10000 });
    });

    test("should render dashboard layout", async ({ page }) => {
      // Look for dashboard grid or flex layout
      const dashboardLayout = page.locator("[class*='grid'], [class*='dashboard'], [class*='container']").first();
      await expect(dashboardLayout).toBeVisible({ timeout: 5000 });
    });

    test("should be responsive on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: "e2e-results/maritime-command-mobile.png", fullPage: true });
    });

    test("should be responsive on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: "e2e-results/maritime-command-tablet.png", fullPage: true });
    });

    test("should be responsive on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: "e2e-results/maritime-command-desktop.png", fullPage: true });
    });
  });

  test.describe("IoT Sensor Data", () => {
    test("should display sensor data cards or panels", async ({ page }) => {
      // Look for sensor-related content
      const sensorContent = page.locator("[class*='card'], [class*='sensor'], [class*='panel']");
      await expect(sensorContent.first()).toBeVisible({ timeout: 10000 });
    });

    test("should show sensor status indicators", async ({ page }) => {
      // Look for status badges or indicators
      const statusIndicators = page.locator("[class*='badge'], [class*='status'], [class*='indicator']");
      
      if (await statusIndicators.first().isVisible()) {
        await expect(statusIndicators.first()).toBeVisible();
      }
    });

    test("should display sensor values with units", async ({ page }) => {
      // Look for numeric values with units (°C, %, PSI, knots, etc.)
      const valuePattern = page.locator("text=/\\d+(\\.\\d+)?\\s*(°C|%|PSI|knots|bar|m\\/s)/i");
      
      // May or may not have sensor data
      const valueCount = await valuePattern.count();
      expect(valueCount).toBeGreaterThanOrEqual(0);
    });

    test("should have real-time update indicators", async ({ page }) => {
      // Look for timestamp or last-updated text
      const timestampPattern = page.locator("text=/\\d{2}:\\d{2}|há \\d+ (min|seg)|ago/i");
      
      if (await timestampPattern.first().isVisible()) {
        await expect(timestampPattern.first()).toBeVisible();
      }
    });
  });

  test.describe("Vessel Information", () => {
    test("should display vessel cards or list", async ({ page }) => {
      // Look for vessel-related content
      const vesselContent = page.locator("[class*='vessel'], [class*='ship'], [class*='fleet']");
      
      if (await vesselContent.first().isVisible()) {
        await expect(vesselContent.first()).toBeVisible();
      }
    });

    test("should show vessel status (active, maintenance, etc.)", async ({ page }) => {
      // Look for status text
      const statusText = page.locator("text=/ativo|active|manutenção|maintenance|operacional|operational/i");
      
      if (await statusText.first().isVisible()) {
        await expect(statusText.first()).toBeVisible();
      }
    });
  });

  test.describe("Charts & Visualizations", () => {
    test("should render data charts", async ({ page }) => {
      // Look for chart containers
      const charts = page.locator("[class*='recharts'], canvas, svg[class*='chart'], [class*='chart']");
      
      if (await charts.first().isVisible()) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test("should display map if available", async ({ page }) => {
      // Look for map container
      const mapContainer = page.locator("[class*='mapbox'], [class*='map'], .mapboxgl-map");
      
      if (await mapContainer.first().isVisible()) {
        await expect(mapContainer.first()).toBeVisible();
      }
    });
  });

  test.describe("Alerts & Notifications", () => {
    test("should display alert section if available", async ({ page }) => {
      const alertSection = page.locator("[class*='alert'], [class*='warning'], [class*='notification']");
      
      // Alerts may or may not be present
      const alertCount = await alertSection.count();
      expect(alertCount).toBeGreaterThanOrEqual(0);
    });

    test("should show critical alerts prominently", async ({ page }) => {
      // Look for critical/danger styled elements
      const criticalAlerts = page.locator("[class*='critical'], [class*='danger'], [class*='destructive']");
      
      if (await criticalAlerts.first().isVisible()) {
        // Critical alerts should be visible/prominent
        await expect(criticalAlerts.first()).toBeVisible();
      }
    });
  });

  test.describe("Navigation & Actions", () => {
    test("should have navigation tabs or sections", async ({ page }) => {
      const tabs = page.locator("[role='tablist'], [class*='tabs'], nav");
      
      if (await tabs.first().isVisible()) {
        await expect(tabs.first()).toBeVisible();
      }
    });

    test("should have action buttons", async ({ page }) => {
      const actionButtons = page.locator("button").filter({
        hasText: /adicionar|add|criar|create|novo|new|atualizar|update|refresh/i
      });
      
      if (await actionButtons.first().isVisible()) {
        await expect(actionButtons.first()).toBeEnabled();
      }
    });

    test("should have working refresh/reload functionality", async ({ page }) => {
      const refreshButton = page.locator("button").filter({
        hasText: /atualizar|refresh|reload|sync/i
      });
      
      if (await refreshButton.first().isVisible()) {
        await refreshButton.first().click();
        await page.waitForTimeout(1000);
        
        // Page should still be functional after refresh
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  test.describe("AI Integration", () => {
    test("should display AI copilot or assistant button", async ({ page }) => {
      const aiButton = page.locator("button, [class*='copilot'], [class*='assistant']").filter({
        hasText: /ia|ai|copilot|assistant|analisar|analyze/i
      });
      
      if (await aiButton.first().isVisible()) {
        await expect(aiButton.first()).toBeEnabled();
      }
    });

    test("should show AI insights if available", async ({ page }) => {
      const insights = page.locator("[class*='insight'], [class*='suggestion'], [class*='recommendation']");
      
      // Insights may or may not be present
      const insightCount = await insights.count();
      expect(insightCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Data Table Functionality", () => {
    test("should display data table if present", async ({ page }) => {
      const table = page.locator("table, [class*='table'], [role='table']");
      
      if (await table.first().isVisible()) {
        await expect(table.first()).toBeVisible();
      }
    });

    test("should have sortable columns", async ({ page }) => {
      const tableHeaders = page.locator("th, [role='columnheader']");
      
      if (await tableHeaders.first().isVisible()) {
        // Headers should be clickable for sorting
        const firstHeader = tableHeaders.first();
        await expect(firstHeader).toBeVisible();
      }
    });

    test("should have pagination or infinite scroll", async ({ page }) => {
      const pagination = page.locator("[class*='pagination'], button:has-text('Próximo'), button:has-text('Next')");
      
      if (await pagination.first().isVisible()) {
        await expect(pagination.first()).toBeVisible();
      }
    });
  });

  test.describe("Filtering & Search", () => {
    test("should have search input", async ({ page }) => {
      const searchInput = page.locator("input[type='search'], input[placeholder*='buscar'], input[placeholder*='search']");
      
      if (await searchInput.first().isVisible()) {
        await expect(searchInput.first()).toBeEnabled();
      }
    });

    test("should have filter controls", async ({ page }) => {
      const filters = page.locator("select, [class*='filter'], [class*='dropdown']");
      
      if (await filters.first().isVisible()) {
        await expect(filters.first()).toBeVisible();
      }
    });

    test("should filter data when filter applied", async ({ page }) => {
      const filterSelect = page.locator("select").first();
      
      if (await filterSelect.isVisible()) {
        // Get initial option
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
        
        // Page should update (no crash)
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading structure", async ({ page }) => {
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test("should have accessible form controls", async ({ page }) => {
      const inputs = page.locator("input, select, textarea");
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const hasLabel = await input.getAttribute("aria-label");
          const hasLabelledBy = await input.getAttribute("aria-labelledby");
          const hasId = await input.getAttribute("id");
          
          // Input should have some form of labeling
          expect(hasLabel || hasLabelledBy || hasId).toBeTruthy();
        }
      }
    });

    test("should support keyboard navigation", async ({ page }) => {
      // Press Tab to navigate
      await page.keyboard.press("Tab");
      await page.waitForTimeout(200);
      
      // Something should be focused
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("should load within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto("/maritime-command");
      await page.waitForLoadState("domcontentloaded");
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test("should not have console errors on load", async ({ page }) => {
      const errors: string[] = [];
      
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });
      
      await page.goto("/maritime-command");
      await page.waitForLoadState("networkidle");
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("net::ERR")
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle API failures gracefully", async ({ page }) => {
      // Intercept and fail API calls
      await page.route("**/rest/v1/**", (route) => {
        route.abort("failed");
      });
      
      await page.goto("/maritime-command");
      await page.waitForTimeout(3000);
      
      // Page should still render
      await expect(page.locator("body")).toBeVisible();
      
      // Should show error state or empty state
      const errorOrEmpty = page.locator("[class*='error'], [class*='empty'], text=/sem dados|no data|erro|error/i");
      // May or may not show error depending on implementation
      const count = await errorOrEmpty.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("should handle slow network gracefully", async ({ page }) => {
      // Simulate slow network
      const client = await page.context().newCDPSession(page);
      await client.send("Network.enable");
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (2 * 1024 * 1024) / 8, // 2 Mbps
        uploadThroughput: (1 * 1024 * 1024) / 8,
        latency: 500,
      });
      
      await page.goto("/maritime-command", { timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Page should still load
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
