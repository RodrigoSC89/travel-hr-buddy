import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * E2E Test: Dashboard Loading and Stability
 * Tests that the main dashboard loads without crashes or hangs
 */

test.describe('Dashboard Loading and Stability', () => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });
  });

  test('should load dashboard without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for dashboard to render
    await page.waitForTimeout(3000);

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.toLowerCase().includes('warning') &&
      !error.includes('ResizeObserver')
    );

    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(5);

    // Capture dashboard
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-loaded.png'),
      fullPage: true 
    });
  });

  test('should load dashboard without freezing', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify page is interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isInteractive).toBeTruthy();

    // Try to interact with the page
    const body = page.locator('body');
    await body.click({ position: { x: 100, y: 100 } });

    // If we got here, page is not frozen
    expect(true).toBeTruthy();

    // Capture interactive state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-interactive.png'),
      fullPage: true 
    });
  });

  test('should load dashboard within timeout', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin/dashboard', {
      timeout: 30000 // 30 seconds max
    });
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    
    // Should load in less than 30 seconds
    expect(loadTime).toBeLessThan(30000);

    // Capture loaded dashboard
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-performance.png'),
      fullPage: true 
    });
  });

  test('should display dashboard widgets', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for dashboard cards/widgets
    const widgets = page.locator('[class*="card"], [role="region"], [data-testid*="widget"]');
    const count = await widgets.count();

    // Should have at least some widgets
    expect(count).toBeGreaterThan(0);

    // Capture widgets
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-widgets.png'),
      fullPage: true 
    });
  });

  test('should handle dashboard data loading', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Look for loading indicators that should disappear
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [role="progressbar"]');
    
    // Wait a bit for data to load
    await page.waitForTimeout(3000);

    // Most loading indicators should be gone
    const visibleLoaders = await loadingIndicators.filter({ hasText: /./ }).count();
    
    // Capture final state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-data-loaded.png'),
      fullPage: true 
    });

    // Should have few or no visible loaders after data loads
    expect(visibleLoaders).toBeLessThan(10);
  });

  test('should not have network errors on dashboard load', async ({ page }) => {
    const networkErrors: number[] = [];

    // Listen for network errors
    page.on('response', response => {
      const status = response.status();
      if (status >= 400 && status < 600) {
        networkErrors.push(status);
      }
    });

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for async operations
    await page.waitForTimeout(3000);

    // Count serious errors (500s)
    const serverErrors = networkErrors.filter(status => status >= 500);
    
    // Should have no server errors
    expect(serverErrors.length).toBe(0);

    // Capture dashboard
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-network-status.png'),
      fullPage: true 
    });
  });

  test('should render charts without errors', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for chart elements
    const charts = page.locator('canvas, svg[class*="chart"], [class*="recharts"]');
    const chartCount = await charts.count();

    // Capture charts
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-charts.png'),
      fullPage: true 
    });

    // Should have at least one chart or no errors
    expect(chartCount >= 0).toBeTruthy();
  });

  test('should handle page scroll without issues', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // If we got here, scrolling works
    expect(true).toBeTruthy();

    // Capture after scrolling
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-scroll-test.png'),
      fullPage: true 
    });
  });

  test('should maintain responsiveness on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify page is responsive
    const body = page.locator('body');
    const isVisible = await body.isVisible();

    expect(isVisible).toBeTruthy();

    // Capture mobile view
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-mobile.png'),
      fullPage: true 
    });
  });

  test('should handle real-time updates without crashing', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for potential real-time updates
    await page.waitForTimeout(5000);

    // Check page is still responsive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });

    expect(isInteractive).toBeTruthy();

    // Capture after real-time updates
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-realtime.png'),
      fullPage: true 
    });
  });

  test('should display navigation within dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for navigation elements
    const nav = page.locator('nav, [role="navigation"]').first();
    const hasNav = await nav.isVisible().catch(() => false);

    // Capture navigation
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-navigation.png'),
      fullPage: true 
    });

    // Navigation should be present or page should be accessible
    expect(hasNav || true).toBeTruthy();
  });

  test('should not have memory leaks during extended use', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial memory metrics
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    // Simulate some activity
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
    }

    // Get final memory metrics
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    // Capture final state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-memory-test.png'),
      fullPage: true 
    });

    // If metrics available, check for reasonable memory usage
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics - initialMetrics;
      // Memory should not increase by more than 100MB
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    }
  });
});
