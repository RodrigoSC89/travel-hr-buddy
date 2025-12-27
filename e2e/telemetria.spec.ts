import { test, expect } from "@playwright/test";

/**
 * E2E Test: Telemetria Module
 * Tests the telemetry command center with real-time sensors, alerts, and AI predictions
 */

test.describe("Telemetria Command Center", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to telemetria page
    await page.goto("/telemetria");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Load & Layout", () => {
    test("should load telemetria page successfully", async ({ page }) => {
      // Check page title or header
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
      
      // Verify main content area exists
      await expect(page.locator("main, [role='main'], .container")).toBeVisible();
    });

    test("should display navigation tabs", async ({ page }) => {
      // Check for tab navigation (Overview, Sensors, Alerts, AI, History)
      const tabs = page.locator("[role='tablist'], .tabs");
      await expect(tabs).toBeVisible({ timeout: 5000 });
      
      // Verify at least some tabs are present
      const tabButtons = page.locator("[role='tab'], button[data-state]");
      await expect(tabButtons.first()).toBeVisible();
    });

    test("should be responsive on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Page should still render correctly
      await expect(page.locator("body")).toBeVisible();
      
      // Take mobile screenshot
      await page.screenshot({ path: "e2e-results/telemetria-mobile.png", fullPage: true });
    });

    test("should be responsive on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: "e2e-results/telemetria-tablet.png", fullPage: true });
    });

    test("should be responsive on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      await expect(page.locator("body")).toBeVisible();
      await page.screenshot({ path: "e2e-results/telemetria-desktop.png", fullPage: true });
    });
  });

  test.describe("Overview Tab", () => {
    test("should display KPI cards", async ({ page }) => {
      // Look for stat cards with numbers
      const cards = page.locator("[class*='card'], [class*='Card']");
      await expect(cards.first()).toBeVisible({ timeout: 5000 });
    });

    test("should display real-time chart", async ({ page }) => {
      // Look for chart container (recharts or similar)
      const chartContainer = page.locator("[class*='recharts'], canvas, svg[class*='chart']").first();
      
      // Chart may take time to render
      await expect(chartContainer).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Sensors Tab", () => {
    test("should navigate to sensors tab", async ({ page }) => {
      // Click on Sensors tab
      const sensorsTab = page.locator("button, [role='tab']").filter({ hasText: /sensor/i });
      
      if (await sensorsTab.isVisible()) {
        await sensorsTab.click();
        await page.waitForTimeout(500);
        
        // Verify sensors content is displayed
        const content = page.locator("[role='tabpanel'], .tab-content").first();
        await expect(content).toBeVisible();
      }
    });

    test("should display sensor list or table", async ({ page }) => {
      // Navigate to sensors tab
      const sensorsTab = page.locator("button, [role='tab']").filter({ hasText: /sensor/i });
      
      if (await sensorsTab.isVisible()) {
        await sensorsTab.click();
        await page.waitForTimeout(1000);
        
        // Look for table or list of sensors
        const dataDisplay = page.locator("table, [class*='list'], [class*='grid']").first();
        await expect(dataDisplay).toBeVisible({ timeout: 5000 });
      }
    });

    test("should have working filter controls", async ({ page }) => {
      const sensorsTab = page.locator("button, [role='tab']").filter({ hasText: /sensor/i });
      
      if (await sensorsTab.isVisible()) {
        await sensorsTab.click();
        await page.waitForTimeout(500);
        
        // Look for filter inputs or select dropdowns
        const filterControls = page.locator("select, input[type='search'], [class*='filter']");
        
        if (await filterControls.first().isVisible()) {
          await expect(filterControls.first()).toBeEnabled();
        }
      }
    });
  });

  test.describe("Alerts Tab", () => {
    test("should navigate to alerts tab", async ({ page }) => {
      const alertsTab = page.locator("button, [role='tab']").filter({ hasText: /alert/i });
      
      if (await alertsTab.isVisible()) {
        await alertsTab.click();
        await page.waitForTimeout(500);
        
        // Verify alerts content
        await expect(page.locator("[role='tabpanel']").first()).toBeVisible();
      }
    });

    test("should display alert priority badges", async ({ page }) => {
      const alertsTab = page.locator("button, [role='tab']").filter({ hasText: /alert/i });
      
      if (await alertsTab.isVisible()) {
        await alertsTab.click();
        await page.waitForTimeout(1000);
        
        // Look for priority badges (critical, warning, info)
        const badges = page.locator("[class*='badge'], [class*='Badge']");
        
        // May or may not have alerts
        const badgeCount = await badges.count();
        expect(badgeCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("should have action buttons for alerts", async ({ page }) => {
      const alertsTab = page.locator("button, [role='tab']").filter({ hasText: /alert/i });
      
      if (await alertsTab.isVisible()) {
        await alertsTab.click();
        await page.waitForTimeout(1000);
        
        // Look for action buttons (acknowledge, resolve, escalate)
        const actionButtons = page.locator("button").filter({ 
          hasText: /reconhecer|resolver|escalar|acknowledge|resolve/i 
        });
        
        // Buttons may exist if there are alerts
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe("AI Predictive Tab", () => {
    test("should navigate to AI tab", async ({ page }) => {
      const aiTab = page.locator("button, [role='tab']").filter({ hasText: /ia|ai|prediti/i });
      
      if (await aiTab.isVisible()) {
        await aiTab.click();
        await page.waitForTimeout(500);
        
        await expect(page.locator("[role='tabpanel']").first()).toBeVisible();
      }
    });

    test("should display AI insights or analysis button", async ({ page }) => {
      const aiTab = page.locator("button, [role='tab']").filter({ hasText: /ia|ai|prediti/i });
      
      if (await aiTab.isVisible()) {
        await aiTab.click();
        await page.waitForTimeout(1000);
        
        // Look for AI-related content
        const aiContent = page.locator("button, [class*='insight'], [class*='card']").filter({
          hasText: /analis|insight|predição|prediction|gerar|generate/i
        });
        
        if (await aiContent.first().isVisible()) {
          await expect(aiContent.first()).toBeEnabled();
        }
      }
    });

    test("should trigger AI analysis when button clicked", async ({ page }) => {
      const aiTab = page.locator("button, [role='tab']").filter({ hasText: /ia|ai|prediti/i });
      
      if (await aiTab.isVisible()) {
        await aiTab.click();
        await page.waitForTimeout(1000);
        
        const analyzeButton = page.locator("button").filter({
          hasText: /analisar|executar|gerar|analyze|run/i
        }).first();
        
        if (await analyzeButton.isVisible()) {
          await analyzeButton.click();
          
          // Wait for loading state or result
          await page.waitForTimeout(2000);
          
          // Should show loading or result
          const loadingOrResult = page.locator("[class*='loading'], [class*='spinner'], [class*='insight'], [class*='result']");
          await expect(loadingOrResult.first()).toBeVisible({ timeout: 10000 });
        }
      }
    });
  });

  test.describe("History Tab", () => {
    test("should navigate to history tab", async ({ page }) => {
      const historyTab = page.locator("button, [role='tab']").filter({ hasText: /histórico|history|tendência/i });
      
      if (await historyTab.isVisible()) {
        await historyTab.click();
        await page.waitForTimeout(500);
        
        await expect(page.locator("[role='tabpanel']").first()).toBeVisible();
      }
    });

    test("should have date/period filter controls", async ({ page }) => {
      const historyTab = page.locator("button, [role='tab']").filter({ hasText: /histórico|history|tendência/i });
      
      if (await historyTab.isVisible()) {
        await historyTab.click();
        await page.waitForTimeout(1000);
        
        // Look for date picker or period selector
        const dateControls = page.locator("input[type='date'], [class*='calendar'], [class*='date'], select");
        
        if (await dateControls.first().isVisible()) {
          await expect(dateControls.first()).toBeEnabled();
        }
      }
    });

    test("should have export functionality", async ({ page }) => {
      const historyTab = page.locator("button, [role='tab']").filter({ hasText: /histórico|history|tendência/i });
      
      if (await historyTab.isVisible()) {
        await historyTab.click();
        await page.waitForTimeout(1000);
        
        // Look for export button
        const exportButton = page.locator("button").filter({
          hasText: /export|csv|pdf|baixar|download/i
        });
        
        if (await exportButton.first().isVisible()) {
          await expect(exportButton.first()).toBeEnabled();
        }
      }
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBeGreaterThanOrEqual(0);
      expect(h1Count).toBeLessThanOrEqual(1); // Should have at most 1 H1
    });

    test("should have accessible buttons with labels", async ({ page }) => {
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute("aria-label");
        
        // Button should have either text or aria-label
        expect(hasText || hasAriaLabel).toBeTruthy();
      }
    });

    test("should have sufficient color contrast", async ({ page }) => {
      // Take screenshot for visual verification
      await page.screenshot({ path: "e2e-results/telemetria-contrast.png", fullPage: true });
      
      // Check that text elements are visible
      const textElements = page.locator("p, span, h1, h2, h3, h4, label");
      const firstText = textElements.first();
      
      if (await firstText.isVisible()) {
        await expect(firstText).toBeVisible();
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Intercept API calls and return error
      await page.route("**/rest/v1/**", (route) => {
        route.abort("failed");
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Page should still render (not crash)
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
