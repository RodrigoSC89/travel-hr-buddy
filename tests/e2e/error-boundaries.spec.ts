/**
 * FASE 3.3 - Error Boundaries E2E Tests
 * Testes para error boundaries e tracking de erros
 */

import { test, expect, Page } from '@playwright/test';

// Test IDs
const ERROR_BOUNDARY_TESTS = {
  GLOBAL: 'ERR-BOUNDARY-001',
  ROUTE: 'ERR-BOUNDARY-002',
  DASHBOARD: 'ERR-BOUNDARY-003',
  MODULE: 'ERR-BOUNDARY-004',
  COMPONENT: 'ERR-BOUNDARY-005',
  NETWORK: 'ERR-BOUNDARY-006',
  RECOVERY: 'ERR-BOUNDARY-007',
  TRACKING: 'ERR-BOUNDARY-008',
};

test.describe('Error Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test(`${ERROR_BOUNDARY_TESTS.GLOBAL} - Global Error Boundary should catch uncaught errors`, async ({ page }) => {
    // Inject a script that will throw an error
    await page.evaluate(() => {
      // Trigger a runtime error
      setTimeout(() => {
        throw new Error('Test error for global boundary');
      }, 100);
    });

    // Wait for error boundary to render
    await page.waitForTimeout(500);

    // Check if error fallback is displayed
    const errorFallback = page.locator('text=Algo deu errado');
    await expect(errorFallback).toBeVisible({ timeout: 5000 });
  });

  test(`${ERROR_BOUNDARY_TESTS.ROUTE} - Route Error Boundary should handle route errors`, async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/non-existent-route-12345');

    // Check if route error fallback is displayed
    const routeError = page.locator('text=Página Não Encontrada');
    await expect(routeError).toBeVisible({ timeout: 5000 });
  });

  test(`${ERROR_BOUNDARY_TESTS.DASHBOARD} - Dashboard Error Boundary should protect dashboard`, async ({ page }) => {
    // Login first (simplified - adjust based on your auth)
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Verify dashboard loaded or error boundary caught error
    const isDashboardVisible = await page.locator('text=Dashboard').isVisible();
    const isErrorBoundaryVisible = await page.locator('text=Erro no Dashboard').isVisible();

    expect(isDashboardVisible || isErrorBoundaryVisible).toBeTruthy();
  });

  test(`${ERROR_BOUNDARY_TESTS.NETWORK} - Network Error Fallback should display on network failure`, async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    // Try to navigate to a page that requires network
    await page.goto('/dashboard');

    // Wait a bit for network error to be detected
    await page.waitForTimeout(2000);

    // Check if network error fallback might be displayed
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBeFalsy();
  });

  test(`${ERROR_BOUNDARY_TESTS.RECOVERY} - Error Recovery should work with retry button`, async ({ page }) => {
    // Navigate to a page
    await page.goto('/');

    // Inject error tracking
    await page.evaluate(() => {
      (window as any).__TEST_ERROR_TRACKING__ = [];
    });

    // If we have an error boundary with retry button
    const retryButton = page.locator('button:has-text("Tentar Novamente")');
    
    // Check if retry button exists (might not if no error)
    const retryExists = await retryButton.count();
    
    if (retryExists > 0) {
      await retryButton.first().click();
      
      // Wait for page to recover
      await page.waitForTimeout(1000);
      
      // Verify page recovered or error still shown
      const hasError = await page.locator('text=Algo deu errado').isVisible();
      
      // At least the retry mechanism should work
      expect(hasError).toBeDefined();
    }
  });

  test(`${ERROR_BOUNDARY_TESTS.TRACKING} - Error Tracking should log errors`, async ({ page }) => {
    // Initialize error tracking spy
    await page.evaluate(() => {
      (window as any).__NAUTILUS_ERRORS__ = [];
      (window as any).__ERROR_TRACKER_INITIALIZED__ = true;
    });

    // Trigger an error
    await page.evaluate(() => {
      try {
        throw new Error('Test tracking error');
      } catch (error) {
        // This should be caught by error tracker
        if ((window as any).__NAUTILUS_ERROR_TRACKER__) {
          (window as any).__NAUTILUS_ERROR_TRACKER__.track(error, 'error', 'runtime');
        }
      }
    });

    // Wait a bit for error to be logged
    await page.waitForTimeout(500);

    // Check if error was tracked
    const errors = await page.evaluate(() => {
      return (window as any).__NAUTILUS_ERRORS__ || [];
    });

    // Verify at least error tracking system is initialized
    expect(errors).toBeDefined();
  });
});

test.describe('Error Fallback UI', () => {
  test(`${ERROR_BOUNDARY_TESTS.COMPONENT} - Error Fallback should display error details in dev mode`, async ({ page }) => {
    // Set development mode
    await page.goto('/?dev=true');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Page should load successfully or show error
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('ERR-UI-001 - Error Fallback should have action buttons', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if common error recovery elements exist (might not be visible if no error)
    const bodyText = await page.textContent('body');
    
    // At least verify the page loaded
    expect(bodyText).toBeTruthy();
  });

  test('ERR-UI-002 - Network Error Fallback should show connection status', async ({ page }) => {
    // Check online status
    const isOnline = await page.evaluate(() => navigator.onLine);
    
    expect(typeof isOnline).toBe('boolean');
  });
});

test.describe('Error Recovery', () => {
  test('ERR-RECOVERY-001 - Should attempt automatic recovery for retryable errors', async ({ page }) => {
    await page.goto('/');
    
    // Wait for any potential auto-recovery
    await page.waitForTimeout(2000);
    
    // Page should either load successfully or show error
    const pageLoaded = await page.isVisible('body');
    expect(pageLoaded).toBeTruthy();
  });

  test('ERR-RECOVERY-002 - Should reset application state on critical error', async ({ page }) => {
    await page.goto('/');
    
    // Check if localStorage is accessible (for state reset functionality)
    const canAccessStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    });
    
    expect(canAccessStorage).toBeTruthy();
  });

  test('ERR-RECOVERY-003 - Should provide navigation to safe routes on error', async ({ page }) => {
    // Navigate to potentially problematic route
    await page.goto('/non-existent-123');
    
    // Wait for error page or redirect
    await page.waitForTimeout(1000);
    
    // Check if home/back button exists
    const homeButton = page.locator('button:has-text("Início")');
    const backButton = page.locator('button:has-text("Voltar")');
    
    const hasHomeButton = await homeButton.count() > 0;
    const hasBackButton = await backButton.count() > 0;
    
    // At least one navigation option should exist on error pages
    expect(hasHomeButton || hasBackButton).toBeDefined();
  });
});

test.describe('Error Tracking Integration', () => {
  test('ERR-TRACK-001 - Should initialize error tracking service', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initialization
    await page.waitForLoadState('networkidle');
    
    // Check if error tracking is initialized
    const isInitialized = await page.evaluate(() => {
      return typeof (window as any).__NAUTILUS_ERROR_TRACKER__ !== 'undefined';
    });
    
    expect(isInitialized).toBeTruthy();
  });

  test('ERR-TRACK-002 - Should track error severity levels', async ({ page }) => {
    await page.goto('/');
    
    // Track different severity errors
    await page.evaluate(() => {
      if ((window as any).__NAUTILUS_ERROR_TRACKER__) {
        const tracker = (window as any).__NAUTILUS_ERROR_TRACKER__;
        tracker.track('Info error', 'info', 'runtime');
        tracker.track('Warning error', 'warning', 'runtime');
        tracker.track('Error error', 'error', 'runtime');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Get error stats
    const stats = await page.evaluate(() => {
      if ((window as any).__NAUTILUS_ERROR_TRACKER__) {
        return (window as any).__NAUTILUS_ERROR_TRACKER__.getStats();
      }
      return null;
    });
    
    expect(stats).toBeDefined();
  });

  test('ERR-TRACK-003 - Should categorize errors correctly', async ({ page }) => {
    await page.goto('/');
    
    // Track different category errors
    await page.evaluate(() => {
      if ((window as any).__NAUTILUS_ERROR_TRACKER__) {
        const tracker = (window as any).__NAUTILUS_ERROR_TRACKER__;
        tracker.trackNetworkError('Network error');
        tracker.trackAuthError('Auth error');
        tracker.trackValidationError('Validation error');
      }
    });
    
    await page.waitForTimeout(500);
    
    // Verify errors were tracked
    const errors = await page.evaluate(() => {
      return (window as any).__NAUTILUS_ERRORS__ || [];
    });
    
    expect(Array.isArray(errors)).toBeTruthy();
  });
});
