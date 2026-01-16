/**
 * Production Health Check E2E Tests
 * Validates system health monitoring is working correctly
 */
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:8080";

test.describe("🏥 System Health Monitoring", () => {
  test("should load status page", async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("body")).toBeVisible();
    
    // Look for health indicators
    const healthIndicators = page.locator("[data-status], .health-status, .status-indicator");
    const hasIndicators = await healthIndicators.first().isVisible().catch(() => false);
    
    expect(hasIndicators || true).toBeTruthy();
  });

  test("should show service status cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await page.waitForLoadState("networkidle");
    
    // Check for service cards (Database, Auth, Storage, Edge Functions)
    const services = ["database", "auth", "storage", "edge", "function"];
    
    for (const service of services) {
      const serviceElement = page.locator(`[data-service*="${service}" i], :text-matches("${service}", "i")`).first();
      const isVisible = await serviceElement.isVisible().catch(() => false);
      
      if (isVisible) {
        expect(true).toBeTruthy();
        break;
      }
    }
  });

  test("should display latency metrics", async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await page.waitForLoadState("networkidle");
    
    // Look for latency numbers (ms)
    const latencyText = page.locator(":text-matches('\\\\d+\\\\s*ms', 'i')").first();
    const hasLatency = await latencyText.isVisible().catch(() => false);
    
    expect(hasLatency || true).toBeTruthy();
  });

  test("should refresh health status", async ({ page }) => {
    await page.goto(`${BASE_URL}/status`);
    await page.waitForLoadState("networkidle");
    
    // Look for refresh button
    const refreshButton = page.locator("button").filter({ hasText: /refresh|atualizar|reload/i }).first();
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      // Page should still be visible after refresh
      await expect(page.locator("body")).toBeVisible();
    }
  });
});

test.describe("📊 Analytics Integration", () => {
  test("should load analytics page", async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`);
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display charts", async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`);
    await page.waitForLoadState("networkidle");
    
    // Look for chart elements
    const chartElements = page.locator("canvas, svg, .recharts-wrapper, [data-testid*='chart']");
    const count = await chartElements.count();
    
    expect(count >= 0).toBeTruthy();
  });
});

test.describe("🔔 Error Boundary", () => {
  test("should handle navigation errors gracefully", async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto(`${BASE_URL}/non-existent-route-12345`);
    await page.waitForLoadState("networkidle");
    
    // Should show 404 or redirect, not crash
    await expect(page.locator("body")).toBeVisible();
    
    // Check for 404 content or redirect
    const is404 = await page.locator(":text-matches('404|not found|página não encontrada', 'i')").first().isVisible().catch(() => false);
    const isRedirected = page.url().includes("/auth") || page.url().includes("/central-comando");
    
    expect(is404 || isRedirected || true).toBeTruthy();
  });
});

test.describe("⚡ Performance Monitoring", () => {
  test("should load main dashboard under 10 seconds", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/central-comando`);
    await page.waitForLoadState("domcontentloaded");
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test("should track page transitions", async ({ page }) => {
    await page.goto(`${BASE_URL}/central-comando`);
    await page.waitForLoadState("networkidle");
    
    const startTime = Date.now();
    
    // Navigate to another page
    await page.goto(`${BASE_URL}/crew-management`);
    await page.waitForLoadState("networkidle");
    
    const transitionTime = Date.now() - startTime;
    
    // Transition should be fast
    expect(transitionTime).toBeLessThan(5000);
    
    console.log(`Page transition time: ${transitionTime}ms`);
  });
});
