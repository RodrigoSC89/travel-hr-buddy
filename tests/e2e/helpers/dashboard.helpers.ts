/**
 * Dashboard Test Helpers
 * FASE B.4 - Helpers para testes de dashboards consolidados
 */

import { Page, expect } from "@playwright/test";
import { dashboardSelectors } from "../fixtures/dashboard.fixtures";

export class DashboardHelpers {
  constructor(private page: Page) {}

  // Navigate to dashboard
  async navigateToDashboard(type: "executive" | "analytics", route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState("networkidle");
  }

  // Wait for dashboard to load
  async waitForDashboardLoad(type: "executive" | "analytics") {
    const selector = type === "executive" 
      ? dashboardSelectors.executive.container
      : dashboardSelectors.analytics.container;
    await this.page.waitForSelector(selector, { timeout: 10000 });
  }

  // Verify KPIs are displayed
  async verifyKPIsDisplayed(expectedCount?: number) {
    const kpis = await this.page.locator(dashboardSelectors.executive.kpiCards).count();
    if (expectedCount) {
      expect(kpis).toBeGreaterThanOrEqual(expectedCount);
    } else {
      expect(kpis).toBeGreaterThan(0);
    }
  }

  // Verify charts are displayed
  async verifyChartsDisplayed() {
    const charts = await this.page.locator(dashboardSelectors.executive.chartWidgets).count();
    expect(charts).toBeGreaterThan(0);
  }

  // Click refresh button
  async clickRefresh() {
    await this.page.click(dashboardSelectors.executive.refreshButton);
    await this.page.waitForTimeout(1000);
  }

  // Change time range
  async selectTimeRange(range: string) {
    await this.page.click(dashboardSelectors.analytics.timeRangeSelect);
    await this.page.click(`text=${range}`);
    await this.page.waitForTimeout(500);
  }

  // Export data
  async exportData(format: "pdf" | "excel" | "csv" | "json") {
    await this.page.click(dashboardSelectors.executive.exportButton);
    await this.page.click(`text=${format}`);
    await this.page.waitForTimeout(1000);
  }

  // Apply filter
  async applyFilter(filterName: string, value: string) {
    await this.page.click(dashboardSelectors.executive.filterPanel);
    await this.page.fill(`[data-filter="${filterName}"]`, value);
    await this.page.waitForTimeout(500);
  }

  // Verify responsive layout
  async verifyResponsiveLayout(viewport: { width: number; height: number }) {
    await this.page.setViewportSize(viewport);
    await this.page.waitForTimeout(500);
    const container = await this.page.locator(dashboardSelectors.executive.container);
    await expect(container).toBeVisible();
  }

  // Check for error state
  async checkErrorState() {
    const errorElement = await this.page.locator("[data-testid=\"error-state\"]");
    return await errorElement.isVisible();
  }

  // Verify drill-down functionality
  async performDrillDown() {
    await this.page.click(dashboardSelectors.analytics.drillDownButton);
    await this.page.waitForLoadState("networkidle");
  }

  // Verify real-time updates
  async verifyRealTimeUpdates() {
    const indicator = await this.page.locator(dashboardSelectors.analytics.realTimeIndicator);
    await expect(indicator).toBeVisible();
  }
}
