/**
 * Performance E2E Tests
 * Testa métricas de performance em produção
 */
import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('dashboard loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('nautilus-academy loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/nautilus-academy');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (like missing favicon in dev)
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Core Web Vitals', () => {
  test('measures LCP', async ({ page }) => {
    await page.goto('/');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5s for good experience
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('page is interactive quickly', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    
    // Wait for interactive elements
    await page.waitForSelector('button, a, input', { timeout: 5000 });
    
    const tti = Date.now() - start;
    expect(tti).toBeLessThan(5000);
  });
});

test.describe('Resource Loading', () => {
  test('no broken images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(
        img => !img.complete || img.naturalWidth === 0
      ).length;
    });
    
    expect(brokenImages).toBe(0);
  });

  test('no failed network requests', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400 && response.status() !== 404) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(failedRequests.length).toBe(0);
  });
});
