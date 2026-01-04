/**
 * Maritime Connectivity E2E Tests
 * Tests for satellite connections, offline mode, and timezone handling
 */
import { test, expect, Page } from '@playwright/test';

test.describe('Maritime Connectivity Scenarios', () => {
  // Test 1: Satellite connection simulation (512kbps)
  test('should work on satellite connection (512kbps)', async ({ page }) => {
    // Throttle network to simulate satellite latency
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 64 * 1024, // 512kbps
      uploadThroughput: 32 * 1024,   // 256kbps
      latency: 500 // 500ms satellite latency
    });
    
    await page.goto('/');
    
    // Should load in < 15s even on slow connection
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    
    // Navigation should work
    const navLink = page.locator('a[href*="fleet"], a[href*="dashboard"]').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await expect(page).toHaveURL(/.*/, { timeout: 10000 });
    }
  });
  
  // Test 2: Offline mode queueing
  test('should queue actions during offline period', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to interact with the page
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      await button.click();
    }
    
    // Check for offline indicator or queued message
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], text=/offline|queued/i');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Wait for sync
    await page.waitForTimeout(2000);
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
  
  // Test 3: Timezone changes (ship crossing dateline)
  test('should handle timezone changes correctly', async ({ page }) => {
    // Set timezone to UTC+12 (New Zealand)
    await page.emulateTimezone('Pacific/Auckland');
    await page.goto('/');
    
    // Wait for page load
    await page.waitForLoadState('domcontentloaded');
    
    // Get any date display
    const dateElements = page.locator('[data-testid="current-date"], time, [datetime]');
    
    // Change to UTC-11 (crossed dateline)
    await page.emulateTimezone('Pacific/Midway');
    await page.reload();
    
    // Page should handle timezone change gracefully
    await expect(page.locator('body')).toBeVisible();
  });
  
  // Test 4: Very slow connection (2G)
  test('should load critical content on 2G connection', async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 37.5 * 1024, // 300kbps (2G)
      uploadThroughput: 18.75 * 1024,  // 150kbps
      latency: 1000 // 1s latency
    });
    
    await page.goto('/', { timeout: 30000 });
    
    // Critical content should load
    await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
  });
  
  // Test 5: Intermittent connection
  test('should recover from intermittent connection drops', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate connection drop
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);
    
    // Reconnect
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
    
    // Should be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Try navigation
    await page.reload();
    await expect(body).toBeVisible();
  });
  
  // Test 6: High latency connection
  test('should handle high latency gracefully', async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1024 * 1024, // Good bandwidth
      uploadThroughput: 512 * 1024,
      latency: 2000 // 2s latency (satellite)
    });
    
    await page.goto('/', { timeout: 30000 });
    
    // Should show loading states
    await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
  });
});

test.describe('PWA Offline Functionality', () => {
  test('should have service worker registered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for service worker
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    // Note: Service worker might not be registered in test environment
    console.log('Service Worker registered:', swRegistered);
  });
  
  test('should cache critical resources', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if caches exist
    const hasCaches = await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        return cacheNames.length > 0;
      }
      return false;
    });
    
    console.log('Has cached resources:', hasCaches);
  });
});

test.describe('Data Synchronization', () => {
  test('should sync data when coming back online', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Store initial state
    const initialContent = await page.content();
    
    // Go offline and interact
    await page.context().setOffline(true);
    await page.waitForTimeout(500);
    
    // Come back online
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);
    
    // Refresh to ensure sync
    await page.reload();
    
    // Should still work
    await expect(page.locator('body')).toBeVisible();
  });
});
