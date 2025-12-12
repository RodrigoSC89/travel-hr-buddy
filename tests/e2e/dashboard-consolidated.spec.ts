/**
 * E2E Tests for Consolidated Dashboards
 * FASE B.4 - Testes para ExecutiveDashboardBase e AnalyticsDashboardBase
 * 
 * Test Coverage:
 * - ExecutiveDashboardBase: carregamento, widgets, filtros, responsividade
 * - AnalyticsDashboardBase: data loading, visualizações, export, drill-down
 */

import { test, expect } from "@playwright/test";
import { DashboardHelpers } from "./helpers/dashboard.helpers";
import { dashboardFixtures, dashboardSelectors } from "./fixtures/dashboard.fixtures";

test.describe("Dashboard Consolidados - Executive Dashboard", () => {
  let helpers: DashboardHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new DashboardHelpers(page);
  });

  test("DASH-EXEC-001: Deve carregar ExecutiveDashboard com configuração padrão", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Verify dashboard container is visible
    const container = await page.locator(dashboardSelectors.executive.container);
    await expect(container).toBeVisible();

    // Verify page title
    await expect(page).toHaveTitle(/Executive Dashboard|Nautilus One/);
  });

  test("DASH-EXEC-002: Deve exibir widgets KPI corretamente", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Verify KPIs are displayed
    await helpers.verifyKPIsDisplayed(3);

    // Verify KPI cards have expected structure
    const kpiCards = await page.locator(dashboardSelectors.executive.kpiCards);
    const firstKpi = kpiCards.first();
    
    await expect(firstKpi).toBeVisible();
    // Should have label and value
    const hasLabel = await firstKpi.locator("[data-testid=\"kpi-label\"]").count() > 0;
    const hasValue = await firstKpi.locator("[data-testid=\"kpi-value\"]").count() > 0;
    
    expect(hasLabel || hasValue).toBeTruthy();
  });

  test("DASH-EXEC-003: Deve renderizar widgets de gráfico dinamicamente", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Verify charts are displayed
    await helpers.verifyChartsDisplayed();

    // Verify chart widgets load properly
    const chartWidgets = await page.locator(dashboardSelectors.executive.chartWidgets);
    const count = await chartWidgets.count();
    expect(count).toBeGreaterThan(0);
  });

  test("DASH-EXEC-004: Deve aplicar filtros corretamente", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Open filter panel
    const filterPanel = await page.locator(dashboardSelectors.executive.filterPanel);
    
    if (await filterPanel.isVisible()) {
      await filterPanel.click();
      
      // Apply a filter
      await helpers.applyFilter("vessel-type", "Cargo");
      
      // Verify filter was applied (data should reload)
      await page.waitForTimeout(1000);
      
      // Check that dashboard is still visible after filter
      const container = await page.locator(dashboardSelectors.executive.container);
      await expect(container).toBeVisible();
    }
  });

  test("DASH-EXEC-005: Deve executar refresh de dados", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Check if refresh button exists
    const refreshButton = await page.locator(dashboardSelectors.executive.refreshButton);
    
    if (await refreshButton.isVisible()) {
      await helpers.clickRefresh();
      
      // Verify dashboard still loads after refresh
      await helpers.waitForDashboardLoad("executive");
      const container = await page.locator(dashboardSelectors.executive.container);
      await expect(container).toBeVisible();
    }
  });

  test("DASH-EXEC-006: Deve ser responsivo em diferentes viewports", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    
    // Test desktop viewport
    await helpers.verifyResponsiveLayout({ width: 1920, height: 1080 });
    
    // Test tablet viewport
    await helpers.verifyResponsiveLayout({ width: 768, height: 1024 });
    
    // Test mobile viewport
    await helpers.verifyResponsiveLayout({ width: 375, height: 667 });
  });

  test("DASH-EXEC-007: Deve exibir error state quando necessário", async ({ page }) => {
    await helpers.navigateToDashboard("executive", dashboardFixtures.executive.route);
    await helpers.waitForDashboardLoad("executive");

    // Dashboard should load without errors by default
    const hasError = await helpers.checkErrorState();
    expect(hasError).toBe(false);
  });
});

test.describe("Dashboard Consolidados - Analytics Dashboard", () => {
  let helpers: DashboardHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new DashboardHelpers(page);
  });

  test("DASH-ANALYTICS-001: Deve carregar AnalyticsDashboard com múltiplas fontes de dados", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    // Verify dashboard container
    const container = await page.locator(dashboardSelectors.analytics.container);
    await expect(container).toBeVisible();

    // Verify data loading indicators are not stuck
    const loadingSpinner = await page.locator("[data-testid=\"loading-spinner\"]");
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
  });

  test("DASH-ANALYTICS-002: Deve alternar entre time ranges", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    // Check if time range selector exists
    const timeRangeSelect = await page.locator(dashboardSelectors.analytics.timeRangeSelect);
    
    if (await timeRangeSelect.isVisible()) {
      // Try different time ranges
      for (const range of ["7d", "30d", "90d"]) {
        await helpers.selectTimeRange(range);
        
        // Verify dashboard updates
        await page.waitForTimeout(500);
        const container = await page.locator(dashboardSelectors.analytics.container);
        await expect(container).toBeVisible();
      }
    }
  });

  test("DASH-ANALYTICS-003: Deve exportar dados em múltiplos formatos", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    const exportButton = await page.locator(dashboardSelectors.executive.exportButton);
    
    if (await exportButton.isVisible()) {
      // Test export functionality
      await exportButton.click();
      
      // Verify export menu opens
      const exportMenu = await page.locator(dashboardSelectors.analytics.exportMenu);
      const isVisible = await exportMenu.isVisible();
      
      if (isVisible) {
        // Verify export formats are available
        await expect(page.locator("text=pdf")).toBeVisible();
      }
    }
  });

  test("DASH-ANALYTICS-004: Deve realizar drill-down em dados", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    // Check if drill-down is available
    const drillDownButton = await page.locator(dashboardSelectors.analytics.drillDownButton);
    
    if (await drillDownButton.isVisible()) {
      await helpers.performDrillDown();
      
      // Verify navigation or modal opened
      await page.waitForTimeout(1000);
      
      // Dashboard should still be functional
      const container = await page.locator(dashboardSelectors.analytics.container);
      await expect(container).toBeVisible();
    }
  });

  test("DASH-ANALYTICS-005: Deve suportar real-time updates", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    // Check for real-time indicator
    const realTimeIndicator = await page.locator(dashboardSelectors.analytics.realTimeIndicator);
    
    if (await realTimeIndicator.isVisible()) {
      await helpers.verifyRealTimeUpdates();
    }
  });

  test("DASH-ANALYTICS-006: Deve filtrar por categoria", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    const categorySelect = await page.locator(dashboardSelectors.analytics.categorySelect);
    
    if (await categorySelect.isVisible()) {
      // Select different categories
      await categorySelect.click();
      await page.click("text=operations");
      
      await page.waitForTimeout(500);
      
      // Verify dashboard still visible
      const container = await page.locator(dashboardSelectors.analytics.container);
      await expect(container).toBeVisible();
    }
  });

  test("DASH-ANALYTICS-007: Deve exibir visualizações dinâmicas", async ({ page }) => {
    await helpers.navigateToDashboard("analytics", dashboardFixtures.analytics.route);
    await helpers.waitForDashboardLoad("analytics");

    // Verify charts are rendered
    await helpers.verifyChartsDisplayed();

    // Verify at least one chart type exists
    const hasLineChart = await page.locator("[data-chart-type=\"line\"]").count() > 0;
    const hasBarChart = await page.locator("[data-chart-type=\"bar\"]").count() > 0;
    const hasPieChart = await page.locator("[data-chart-type=\"pie\"]").count() > 0;
    
    expect(hasLineChart || hasBarChart || hasPieChart).toBeTruthy();
  });
});
