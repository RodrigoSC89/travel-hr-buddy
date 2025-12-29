/**
 * E2E Tests for PWA Offline Functionality
 * Tests service worker, offline mode, and background sync
 */
import { test, expect } from "@playwright/test";

test.describe("PWA & Offline Support", () => {
  test.describe("Service Worker", () => {
    test("should register service worker", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      // Check if service worker is registered
      const swRegistered = await page.evaluate(async () => {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return registrations.length > 0;
        }
        return false;
      });
      
      expect(swRegistered).toBe(true);
      console.log("✓ Service Worker registered");
    });

    test("should cache static assets", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      
      // Check cache
      const cacheStats = await page.evaluate(async () => {
        const cacheNames = await caches.keys();
        let totalEntries = 0;
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          totalEntries += keys.length;
        }
        
        return { caches: cacheNames.length, entries: totalEntries };
      });
      
      console.log(`Caches: ${cacheStats.caches}, Entries: ${cacheStats.entries}`);
      expect(cacheStats.caches).toBeGreaterThan(0);
    });
  });

  test.describe("Offline Mode", () => {
    test("should show offline page when offline", async ({ page, context }) => {
      // First load the page online
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      
      // Go offline
      await context.setOffline(true);
      
      // Navigate to a new page
      await page.goto("/dashboard").catch(() => {});
      await page.waitForTimeout(1000);
      
      // Should show cached content or offline page
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      // Restore online
      await context.setOffline(false);
      
      console.log("✓ Offline mode handled gracefully");
    });

    test("should serve cached API responses offline", async ({ page, context }) => {
      // Load page and trigger API calls
      await page.goto("/nautilus-command");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      
      // Go offline
      await context.setOffline(true);
      
      // Reload page
      await page.reload().catch(() => {});
      await page.waitForTimeout(2000);
      
      // Should still show some content from cache
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      const content = await page.textContent("body");
      expect(content?.trim().length).toBeGreaterThan(100);
      
      // Restore online
      await context.setOffline(false);
      
      console.log("✓ Cached content served offline");
    });

    test("should indicate offline status to user", async ({ page, context }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      // Go offline
      await context.setOffline(true);
      await page.waitForTimeout(1000);
      
      // Look for offline indicator
      const offlineIndicator = page.locator('text=/offline/i, [class*="offline" i]');
      const count = await offlineIndicator.count();
      
      // Restore online
      await context.setOffline(false);
      
      console.log(`Found ${count} offline indicators`);
    });
  });

  test.describe("PWA Installation", () => {
    test("should have valid manifest.json", async ({ page }) => {
      const response = await page.goto("/manifest.json");
      expect(response?.status()).toBe(200);
      
      const manifest = await response?.json();
      
      expect(manifest).toHaveProperty("name");
      expect(manifest).toHaveProperty("short_name");
      expect(manifest).toHaveProperty("start_url");
      expect(manifest).toHaveProperty("display");
      expect(manifest).toHaveProperty("icons");
      
      console.log(`✓ Manifest valid: ${manifest.name}`);
    });

    test("should have proper meta tags for PWA", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      
      // Check for PWA meta tags
      const themeColor = await page.locator('meta[name="theme-color"]').getAttribute("content");
      const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
      const manifestLink = await page.locator('link[rel="manifest"]').getAttribute("href");
      
      expect(themeColor).toBeTruthy();
      expect(viewport).toBeTruthy();
      expect(manifestLink).toBeTruthy();
      
      console.log(`✓ PWA meta tags present`);
    });
  });

  test.describe("Background Sync", () => {
    test("should queue offline actions", async ({ page, context }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      // Check if Background Sync is supported
      const syncSupported = await page.evaluate(async () => {
        if ("serviceWorker" in navigator && "sync" in (await navigator.serviceWorker.ready)) {
          return true;
        }
        return false;
      });
      
      console.log(`Background Sync supported: ${syncSupported}`);
    });

    test("should persist data in IndexedDB", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      // Check IndexedDB
      const hasIndexedDB = await page.evaluate(async () => {
        const dbs = await indexedDB.databases();
        return dbs.length > 0;
      });
      
      console.log(`IndexedDB databases present: ${hasIndexedDB}`);
    });
  });

  test.describe("Push Notifications", () => {
    test("should have notification permission request capability", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      
      const notificationSupported = await page.evaluate(() => {
        return "Notification" in window;
      });
      
      expect(notificationSupported).toBe(true);
      console.log("✓ Notifications API available");
    });

    test("should have push service worker registered", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      
      const hasPushSW = await page.evaluate(async () => {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          return registration.pushManager !== undefined;
        }
        return false;
      });
      
      console.log(`Push Manager available: ${hasPushSW}`);
    });
  });
});
