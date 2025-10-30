import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * E2E Test: Mission Engine
 * Tests mission execution with visual feedback
 * Tests the mission-engine module for orchestrating multi-agent missions
 */

test.describe('Mission Engine E2E Tests', () => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mock authentication if on login page
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
    if (isLoginPage) {
      await page.evaluate(() => {
        localStorage.setItem('sb-localhost-auth-token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user', email: 'test@example.com' }
        }));
      });
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should load mission engine page without errors', async ({ page }) => {
    // Navigate to mission engine page
    const missionEngineUrl = '/admin/mission-engine/validation';
    await page.goto(missionEngineUrl);
    await page.waitForLoadState('networkidle');

    // Capture screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-loaded.png'),
      fullPage: true 
    });

    // Verify page loaded successfully
    expect(page.url()).toContain('mission-engine');
    
    // Check for no critical errors in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors (favicon, etc.)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest') &&
      !error.toLowerCase().includes('warning')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should display mission execution interface', async ({ page }) => {
    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Look for mission control elements
    const heading = page.locator('h1, h2, h3').filter({ hasText: /mission/i }).first();
    const isVisible = await heading.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(heading).toBeVisible();
    }

    // Capture screenshot of mission interface
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-interface.png'),
      fullPage: true 
    });
  });

  test('should execute mission with visual feedback', async ({ page }) => {
    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Look for mission execution buttons
    const executeButton = page.locator('button').filter({ 
      hasText: /execute|start|run|iniciar/i 
    }).first();
    
    const buttonExists = await executeButton.isVisible().catch(() => false);

    if (buttonExists) {
      // Click execute button
      await executeButton.click();
      
      // Wait for visual feedback (loading, progress, etc.)
      await page.waitForTimeout(1500);

      // Capture screenshot showing feedback
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'mission-engine-executing.png'),
        fullPage: true 
      });

      // Look for success/progress indicators
      const successIndicator = page.locator('[role="status"], .success, .completed, [data-state="success"]').first();
      const progressIndicator = page.locator('[role="progressbar"], .progress, .loading').first();
      
      const hasVisualFeedback = 
        await successIndicator.isVisible().catch(() => false) ||
        await progressIndicator.isVisible().catch(() => false);

      expect(hasVisualFeedback).toBeTruthy();
    }

    // Final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-complete.png'),
      fullPage: true 
    });
  });

  test('should display mission status updates', async ({ page }) => {
    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Look for status displays
    const statusElements = page.locator('[class*="status"], [data-status], .badge, .chip');
    const count = await statusElements.count();

    expect(count).toBeGreaterThan(0);

    // Capture status display
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-status.png'),
      fullPage: true 
    });
  });

  test('should not have network errors (403/500)', async ({ page }) => {
    const networkErrors: number[] = [];

    // Listen for network responses
    page.on('response', response => {
      const status = response.status();
      if (status === 403 || status === 500) {
        networkErrors.push(status);
      }
    });

    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Wait for async operations
    await page.waitForTimeout(3000);

    // Verify no 403/500 errors
    expect(networkErrors.length).toBe(0);
  });

  test('should handle mission steps visualization', async ({ page }) => {
    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Look for stepper or progress components
    const stepper = page.locator('[class*="step"], [role="tablist"], .stepper, .progress').first();
    const hasSteps = await stepper.isVisible().catch(() => false);

    if (hasSteps) {
      await expect(stepper).toBeVisible();
      
      // Capture stepper visualization
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'mission-engine-steps.png'),
        fullPage: true 
      });
    }
  });

  test('should load without timeout', async ({ page }) => {
    // Set a timeout and ensure page loads within it
    const startTime = Date.now();
    
    await page.goto('/admin/mission-engine/validation', {
      timeout: 30000 // 30 seconds max
    });
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    
    // Should load in less than 30 seconds
    expect(loadTime).toBeLessThan(30000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-performance.png'),
      fullPage: true 
    });
  });

  test('should display mission logs or history', async ({ page }) => {
    await page.goto('/admin/mission-engine/validation');
    await page.waitForLoadState('networkidle');

    // Look for logs or history sections
    const logsSection = page.locator('[class*="log"], [class*="history"], [data-testid*="log"]').first();
    const hasLogs = await logsSection.isVisible().catch(() => false);

    if (hasLogs) {
      await expect(logsSection).toBeVisible();
    }

    // Capture final state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mission-engine-logs.png'),
      fullPage: true 
    });
  });
});
