/**
 * E2E Tests for PATCH 605 - ESG & EEXI Monitoring Dashboard
 * Tests ESG compliance and emission tracking functionality
 */

import { test, expect } from "@playwright/test";

test.describe("PATCH 605 - ESG Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to ESG dashboard
    await page.goto("/esg-dashboard");
  });

  test("should load ESG dashboard page", async ({ page }) => {
    // Check if page loads with title or heading
    await expect(
      page.getByRole("heading", { name: /ESG|Environmental|Sustentabilidade/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("PATCH605 - ESG Dashboard shows emissions data", async ({ page }) => {
    // Check for emissions display
    await expect(
      page.getByText(/Emissões Totais|Total Emissions|CO2/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("PATCH605 - Forecast chart is visible", async ({ page }) => {
    // Check for forecast chart element
    const forecastChart = page.getByTestId("forecast-chart");
    const chartCanvas = page.locator("canvas").first();
    const chartSvg = page.locator("svg").first();
    
    // At least one chart element should be visible
    const hasChart = 
      (await forecastChart.count()) > 0 ||
      (await chartCanvas.count()) > 0 ||
      (await chartSvg.count()) > 0;
    
    expect(hasChart).toBe(true);
  });

  test("should display key ESG metrics", async ({ page }) => {
    // Check for common ESG metrics
    const metricsCount = await page.getByText(/CO2|NOx|SOx|EEXI|CII/i).count();
    
    expect(metricsCount).toBeGreaterThan(0);
  });

  test("compliance level indicators are shown", async ({ page }) => {
    // Check for compliance indicators
    const hasCompliance = await page.getByText(/Compliance|Conformidade|Status/i).count();
    
    expect(hasCompliance).toBeGreaterThan(0);
  });

  test("emissions data is displayed in cards or table", async ({ page }) => {
    // Check if data is presented in structured format
    const hasCards = await page.locator('[class*="card"]').count();
    const hasTable = await page.locator("table").count();
    
    expect(hasCards + hasTable).toBeGreaterThan(0);
  });
});
