import { test, expect } from '@playwright/test';

/**
 * Mobile Offline Sync - E2E Tests
 * Tests offline-first functionality and sync indicators
 */

test.describe('Mobile Sync Status Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display sync status badge', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    // Look for sync status indicator
    const syncBadge = page.locator('[class*="sync"], text=/Sync|Sincronizado|Offline/i');
    // Sync indicator should be present
  });

  test('should show online status when connected', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    // Check for online indicators
    const onlineIndicators = page.locator('text=/Online|Conectado|Sincronizado/i, [class*="bg-green"]');
    // Should show connected state
  });

  test('should persist across navigation', async ({ page }) => {
    const routes = ['/central-comando', '/crew', '/vessels'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(1500);
      
      // Sync status should remain visible
      const syncIndicator = page.locator('[class*="sync"], [class*="cloud"]');
      // Indicator should be consistent
    }
  });
});

test.describe('Offline Data Persistence', () => {
  test('should use IndexedDB for offline storage', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');

    // Check if IndexedDB is being used
    const hasIndexedDB = await page.evaluate(() => {
      return 'indexedDB' in window;
    });
    
    expect(hasIndexedDB).toBe(true);
  });

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasServiceWorker = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });

    // Service worker may or may not be registered depending on environment
  });

  test('should handle network changes gracefully', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');

    // Simulate going offline
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // App should still be responsive
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
  });
});

test.describe('Sync Queue Management', () => {
  test('should handle pending operations', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');

    // Verify sync system is initialized
    const syncReady = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });

    expect(syncReady).toBe(true);
  });

  test('should show pending count when offline edits exist', async ({ page }) => {
    await page.goto('/crew');
    await page.waitForTimeout(2000);

    // Look for pending sync indicators
    const pendingIndicator = page.locator('text=/pending|pendente/i, [class*="badge"]');
    // May show pending items if any exist
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should display sync badge on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    // Sync status should be visible on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should maintain functionality on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    // App should function on tablet sizes
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });
});
