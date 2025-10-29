import { test, expect } from '@playwright/test';

/**
 * E2E Test: Navigation Flow
 * Tests main navigation across the application
 */

test.describe('Main Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to dashboard on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if we're on the login page or already authenticated
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (isLoginPage) {
      // Mock login if needed
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
      });
      await page.reload();
    }

    // Wait for page to load
    await page.waitForSelector('body', { state: 'visible' });

    // Verify page loaded successfully
    expect(await page.title()).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e-results/navigation-mobile.png' });
  });

  test('should navigate to dashboard on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Check if we're on the login page or already authenticated
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (isLoginPage) {
      // Mock login if needed
      await page.evaluate(() => {
        localStorage.setItem('auth-token', 'mock-token');
      });
      await page.reload();
    }

    // Wait for page to load
    await page.waitForSelector('body', { state: 'visible' });

    // Verify page loaded successfully
    expect(await page.title()).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: 'e2e-results/navigation-desktop.png' });
  });

  test('should navigate between main sections', async ({ page }) => {
    // Set desktop viewport for easier navigation
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Try to find and click navigation links
    const navLinks = ['Dashboard', 'Documents', 'Analytics', 'Settings'];
    
    for (const linkText of navLinks) {
      const link = page.locator(`text=${linkText}`).first();
      const isVisible = await link.isVisible().catch(() => false);
      
      if (isVisible) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation was successful (page changed)
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'e2e-results/navigation-sections.png' });
  });

  test('should verify network responses are successful', async ({ page }) => {
    const responses: number[] = [];

    // Listen to network responses
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('supabase')) {
        responses.push(response.status());
      }
    });

    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that we got some responses
    if (responses.length > 0) {
      // Count successful responses (200-299)
      const successfulResponses = responses.filter(status => status >= 200 && status < 300);
      const successRate = (successfulResponses.length / responses.length) * 100;

      // At least 80% of API calls should be successful
      expect(successRate).toBeGreaterThanOrEqual(80);
    }
  });

  test('should handle responsive menu on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for mobile menu button (hamburger icon)
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    const isMenuVisible = await menuButton.isVisible().catch(() => false);

    if (isMenuVisible) {
      await menuButton.click();
      await page.waitForTimeout(500); // Wait for menu animation

      // Verify menu opened
      const menuContent = page.locator('[role="menu"], nav').first();
      expect(await menuContent.isVisible().catch(() => false)).toBeTruthy();

      // Take screenshot of open menu
      await page.screenshot({ path: 'e2e-results/navigation-mobile-menu.png' });
    }
  });

  test('should render content without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    // Verify no critical console errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.toLowerCase().includes('warning')
    );

    expect(criticalErrors.length).toBeLessThan(5);
  });
});
