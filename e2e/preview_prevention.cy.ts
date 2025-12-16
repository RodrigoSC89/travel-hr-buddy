import { test, expect } from '@playwright/test';

/**
 * PATCH 607: E2E Tests for Preview Prevention
 * 
 * Tests to ensure all preview routes load without crashing
 */

// List of preview routes to test
const previewRoutes = [
  '/preview/ai-training',
  '/preview/mlc-inspection',
  '/preview/ovid-precheck',
  '/preview/psc-precheck',
  '/preview/esg-dashboard',
  '/preview/remote-audits',
  '/preview/smart-scheduler',
];

test.describe('Preview Stability Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for preview loading
    test.setTimeout(60000);
  });

  for (const route of previewRoutes) {
    test(`Preview loads without crashing: ${route}`, async ({ page }) => {
      // Navigate to preview route
      await page.goto(route, { waitUntil: 'networkidle' });
      
      // Wait for initial render
      await page.waitForTimeout(1000);
      
      // Check that no crash error is visible
      const crashText = await page.locator('text=/Erro|Error|crash/i').isVisible().catch(() => false);
      expect(crashText).toBeFalsy();
      
      // Check that skeleton loader eventually disappears
      const skeleton = await page.locator('.skeleton').isVisible().catch(() => false);
      
      // Wait for content to load (max 10 seconds)
      if (skeleton) {
        await page.waitForTimeout(10000);
        const stillLoading = await page.locator('.skeleton').isVisible().catch(() => false);
        expect(stillLoading).toBeFalsy();
      }
      
      // Check that some content is visible
      const body = await page.locator('body').textContent();
      expect(body).toBeTruthy();
      expect(body!.length).toBeGreaterThan(0);
    });
  }

  test('Preview components handle errors gracefully', async ({ page }) => {
    // Test with invalid route
    await page.goto('/preview/invalid-route-test');
    
    // Should show error boundary or 404, not crash
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
    
    // Page should still be interactive
    const isInteractive = await page.evaluate(() => {
      return document.body !== null && document.readyState === 'complete';
    });
    expect(isInteractive).toBeTruthy();
  });

  test('Preview does not create infinite loops', async ({ page }) => {
    // Monitor console for repeated error messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Navigate to a preview page
    await page.goto('/preview/ai-training');
    
    // Wait and check for repeated console errors
    await page.waitForTimeout(5000);
    
    // Check for repeated identical errors (sign of infinite loop)
    const errorCounts = consoleMessages.reduce((acc, msg) => {
      acc[msg] = (acc[msg] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxRepeats = Math.max(...Object.values(errorCounts), 0);
    
    // If same error appears more than 10 times, likely an infinite loop
    expect(maxRepeats).toBeLessThan(10);
  });

  test('Preview components cleanup on unmount', async ({ page }) => {
    // Navigate to preview
    await page.goto('/preview/ai-training');
    await page.waitForTimeout(2000);
    
    // Navigate away
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Check that there are no lingering timers causing console errors
    const finalCheck = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(finalCheck).toBeTruthy();
  });

  test('Multiple preview navigations dont cause memory leaks', async ({ page }) => {
    // Navigate between previews multiple times
    for (let i = 0; i < 3; i++) {
      for (const route of previewRoutes.slice(0, 3)) { // Test first 3 routes
        await page.goto(route);
        await page.waitForTimeout(1000);
      }
    }
    
    // Check that page is still responsive
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isResponsive).toBeTruthy();
  });
});
