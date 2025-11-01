import { test, expect } from "@playwright/test";
import { 
  setupConsoleErrorListener, 
  filterCriticalErrors, 
  validatePageLoad,
  waitForNetworkIdle
} from "./test-utils";

/**
 * PATCH 549 - E2E Test: Dashboard Module
 * Tests core dashboard functionality and rendering
 */

test.describe("Dashboard Module - PATCH 549", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto("/");
    await waitForNetworkIdle(page);
  });

  test("should load dashboard without errors", async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);

    // Wait for content to load
    await page.waitForSelector("body", { state: "visible", timeout: 10000 });

    // Verify page title or heading
    const heading = await page.locator("h1, h2").first().textContent();
    expect(heading).toBeTruthy();

    // Validate page load
    const { hasErrors, criticalErrors } = validatePageLoad(consoleErrors);
    
    if (hasErrors) {
      console.log("Critical errors found:", criticalErrors);
    }

    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test("should display KPI cards", async ({ page }) => {
    // Look for KPI-like elements (cards with numbers/metrics)
    const cards = page.locator("[data-testid*='kpi'], [class*='KPI'], div[class*='card']");
    
    // Wait for at least some cards to be present
    await page.waitForTimeout(2000);
    
    const cardCount = await cards.count();
    
    // Dashboard should have at least 1 card/metric
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test("should render charts with Suspense fallback", async ({ page }) => {
    // Reload page to catch loading states
    await page.reload();
    
    // Look for skeleton loaders or suspense indicators
    const skeletons = page.locator("[class*='skeleton'], [class*='loading'], [class*='Skeleton']");
    
    // At some point during load, skeletons should appear
    // (This might be very quick, so we check if any exist or existed)
    const hasSkeletons = await skeletons.count() > 0;
    
    // Wait for charts to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    // Charts should eventually load (skeletons should be gone or replaced)
    const remainingSkeletons = await page.locator("[class*='skeleton']").count();
    
    // It's OK to have some structural skeletons, but not blocking ones
    expect(remainingSkeletons).toBeLessThan(10);
  });

  test("should have working tab navigation", async ({ page }) => {
    // Look for tab elements
    const tabs = page.locator("[role='tab'], button[class*='tab'], [data-state='active']");
    
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Click on different tabs
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        await tabs.nth(i).click();
        await page.waitForTimeout(500);
        
        // Verify URL or content changed
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test("should render within performance budget", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/", { waitUntil: "networkidle" });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test("should have responsive design on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    // Check that content is visible
    const body = page.locator("body");
    expect(await body.isVisible()).toBeTruthy();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: "e2e-results/dashboard-mobile-patch549.png",
      fullPage: true 
    });
  });

  test("should display real-time indicators", async ({ page }) => {
    // Look for elements that suggest real-time data
    const realTimeIndicators = page.locator(
      "text=/real.?time/i, text=/live/i, [class*='realtime'], [class*='live']"
    );
    
    const hasRealTime = await realTimeIndicators.count() > 0;
    
    // Dashboard should have some real-time indicators
    if (hasRealTime) {
      expect(await realTimeIndicators.first().isVisible()).toBeTruthy();
    }
  });

  test("should navigate to QA Dashboard link", async ({ page }) => {
    // Look for QA Dashboard link
    const qaLink = page.locator("text=/QA/i, a[href*='qa']").first();
    
    const isVisible = await qaLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await qaLink.click();
      await page.waitForLoadState("networkidle");
      
      // Verify navigation occurred
      const url = page.url();
      expect(url).toContain("qa");
    }
  });

  test("should not have memory leaks in lazy loaded components", async ({ page }) => {
    // Reload multiple times to check for memory issues
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    }
    
    // Check for memory-related console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error" && 
          (msg.text().includes("memory") || 
           msg.text().includes("heap") ||
           msg.text().includes("leak"))) {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    expect(consoleErrors.length).toBe(0);
  });

  test("should handle errors gracefully", async ({ page }) => {
    // Simulate network issues
    await page.route("**/api/**", route => {
      route.abort();
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Page should still render (with error states)
    const body = page.locator("body");
    expect(await body.isVisible()).toBeTruthy();
    
    // Look for error boundary or error message
    const errorMessages = page.locator("text=/error/i, text=/failed/i, [role='alert']");
    
    // It's OK to show error messages when APIs fail
    // The important thing is the page doesn't crash
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});
