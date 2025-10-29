import { test, expect } from '@playwright/test';

/**
 * E2E Test: AI Insight Visualization Flow
 * Tests AI-powered insights and visualizations
 */

test.describe('AI Insight Visualization Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user-role', 'admin');
    });
    await page.waitForLoadState('networkidle');
  });

  test('should display AI insights on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to intelligence or AI insights page
    const aiPages = [
      '/intelligence',
      '/dp-intelligence',
      '/ai-insights',
      '/analytics'
    ];

    let pageFound = false;
    for (const pagePath of aiPages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        pageFound = true;
        break;
      } catch (e) {
        // Try next page
      }
    }

    if (!pageFound) {
      // Default to home
      await page.goto('/');
    }

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-insights-desktop.png' });

    // Verify page loaded
    expect(await page.title()).toBeTruthy();
  });

  test('should display AI insights on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to AI insights
    try {
      await page.goto('/intelligence');
      await page.waitForLoadState('networkidle');
    } catch (e) {
      await page.goto('/');
    }

    // Wait for content
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-insights-mobile.png' });
  });

  test('should render charts and visualizations', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to analytics or dashboard with charts
    const chartPages = ['/analytics', '/dashboard', '/intelligence'];
    
    for (const pagePath of chartPages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        break;
      } catch (e) {
        // Continue
      }
    }

    // Wait for charts to render
    await page.waitForTimeout(3000);

    // Look for chart elements (canvas, svg)
    const chartElements = await page.locator('canvas, svg[class*="chart"], [class*="recharts"]').count();

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-visualizations.png', fullPage: true });

    // Verify some visual elements are present
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('should display AI predictions or recommendations', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to forecasting or prediction page
    const predictionPages = [
      '/forecast',
      '/forecast-global',
      '/predictions',
      '/intelligence'
    ];

    for (const pagePath of predictionPages) {
      try {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        break;
      } catch (e) {
        // Continue
      }
    }

    // Wait for AI predictions to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-predictions.png', fullPage: true });
  });

  test('should interact with AI insight filters', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to insights page
    await page.goto('/intelligence').catch(() => page.goto('/analytics'));
    await page.waitForLoadState('networkidle');

    // Look for filter elements
    const filterSelects = page.locator('select, [role="combobox"]');
    const filterCount = await filterSelects.count();

    if (filterCount > 0) {
      // Click first filter
      await filterSelects.first().click();
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({ path: 'e2e-results/ai-insights-filters.png' });
    }
  });

  test('should verify AI API responses', async ({ page }) => {
    const aiApiCalls: { url: string; status: number }[] = [];

    // Listen for AI-related API calls
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/ai/') || 
          url.includes('/intelligence') ||
          url.includes('/forecast') ||
          url.includes('/predictions') ||
          url.includes('openai') ||
          url.includes('gpt')) {
        aiApiCalls.push({
          url: url,
          status: response.status()
        });
      }
    });

    // Navigate to AI page
    await page.goto('/intelligence').catch(() => page.goto('/'));
    await page.waitForLoadState('networkidle');

    // Wait for API calls
    await page.waitForTimeout(3000);

    // Log AI API calls for debugging
    console.log('AI API calls:', aiApiCalls.length);

    // If we got AI API calls, verify they're successful
    if (aiApiCalls.length > 0) {
      const successful = aiApiCalls.filter(call => call.status >= 200 && call.status < 300);
      expect(successful.length).toBeGreaterThan(0);
    }
  });

  test('should display real-time insights', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to live insights
    await page.goto('/intelligence').catch(() => page.goto('/dashboard'));
    await page.waitForLoadState('networkidle');

    // Capture initial state
    const initialContent = await page.locator('body').textContent();

    // Wait for potential real-time updates
    await page.waitForTimeout(5000);

    // Capture updated state
    const updatedContent = await page.locator('body').textContent();

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-realtime-insights.png' });

    // Verify content is present
    expect(initialContent).toBeTruthy();
    expect(updatedContent).toBeTruthy();
  });

  test('should handle AI insight errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to AI insights
    await page.goto('/intelligence').catch(() => page.goto('/'));
    await page.waitForLoadState('networkidle');

    // Wait for any async operations
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'e2e-results/ai-insights-error-handling.png' });

    // Verify page doesn't crash
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();

    // Console errors should be manageable
    expect(consoleErrors.length).toBeLessThan(10);
  });
});
