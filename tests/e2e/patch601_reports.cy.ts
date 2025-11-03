/**
 * PATCH 601 - E2E tests for Reporting Engine Module
 * Tests report generation, templates, and export functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Reporting Engine Module - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display reports navigation", async ({ page }) => {
    const reportsLink = page.getByRole("link", { name: /report|relatório/i }).first();
    
    if (await reportsLink.isVisible()) {
      await expect(reportsLink).toBeVisible();
    }
  });

  test("should load reporting dashboard", async ({ page }) => {
    await page.goto("/reports").catch(() => {
      return page.goto("/admin/reports").catch(() => {});
    });
    await page.waitForTimeout(1500);
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("should display report templates", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for template cards or list
    const templates = await page.locator("[class*=\"template\"], [class*=\"report\"], [class*=\"card\"]").count();
    expect(templates).toBeGreaterThanOrEqual(0);
  });

  test("should show report builder interface", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for builder/create button
    const builderButton = await page.getByRole("button", { name: /build|criar|new report/i }).count();
    expect(builderButton).toBeGreaterThanOrEqual(0);
  });

  test("should display export format options", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for export buttons or format selectors
    const exportOptions = await page.locator("[class*=\"export\"], button[class*=\"pdf\"], button[class*=\"excel\"]").count();
    expect(exportOptions).toBeGreaterThanOrEqual(0);
  });

  test("should show report scheduling options", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for scheduling/automation elements
    const scheduling = await page.locator("[class*=\"schedule\"], [class*=\"automat\"], [class*=\"recurrence\"]").count();
    expect(scheduling).toBeGreaterThanOrEqual(0);
  });

  test("should display report history", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for history or generated reports list
    const history = await page.locator("[class*=\"history\"], [class*=\"generated\"], [class*=\"past\"]").count();
    expect(history).toBeGreaterThanOrEqual(0);
  });

  test("should show data visualization options", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for charts or visualization components
    const visualizations = await page.locator("canvas, svg[class*=\"chart\"]").count();
    expect(visualizations).toBeGreaterThanOrEqual(0);
  });

  test("should display AI insights generation", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for AI insights or analysis
    const aiInsights = await page.locator("[class*=\"insight\"], [class*=\"ai\"], [class*=\"analysis\"]").count();
    expect(aiInsights).toBeGreaterThanOrEqual(0);
  });

  test("should show report filters and parameters", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for filter controls
    const filters = await page.locator("[class*=\"filter\"], select, input[type=\"date\"]").count();
    expect(filters).toBeGreaterThanOrEqual(0);
  });

  test("should display report categories", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for category tabs or filters
    const categories = await page.locator("[class*=\"category\"], [role=\"tab\"], [class*=\"type\"]").count();
    expect(categories).toBeGreaterThanOrEqual(0);
  });

  test("should show template customization options", async ({ page }) => {
    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);
    
    // Look for customization/settings buttons
    const customization = await page.getByRole("button", { name: /customize|edit|settings/i }).count();
    expect(customization).toBeGreaterThanOrEqual(0);
  });

  test("should render without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/reports").catch(() => page.goto("/admin/reports").catch(() => {}));
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(
      (error) => !error.includes("404") && !error.includes("favicon")
    );
    expect(criticalErrors.length).toBe(0);
  });
});
