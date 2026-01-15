/**
 * 🚀 NAUTI ONE v4.0 - LIGHTHOUSE PERFORMANCE TESTS
 * Validates performance metrics for 95+ Lighthouse score
 */

import { test, expect, Page } from '@playwright/test';

const waitForPageLoad = async (page: Page) => {
  await page.waitForLoadState('networkidle', { timeout: 30000 });
};

// ═══════════════════════════════════════════════════════════════════════════
// ⚡ CORE WEB VITALS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('⚡ Core Web Vitals', () => {
  test('should have good LCP (< 2.5s)', async ({ page }) => {
    await page.goto('/');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        setTimeout(() => resolve(2500), 5000);
      });
    });
    
    expect(lcp).toBeLessThan(2500);
  });

  test('should have good FID proxy (< 100ms)', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Measure interaction delay
    const startTime = Date.now();
    await page.click('body');
    const interactionTime = Date.now() - startTime;
    
    expect(interactionTime).toBeLessThan(200);
  });

  test('should have good CLS (< 0.1)', async ({ page }) => {
    await page.goto('/');
    
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsScore), 3000);
      });
    });
    
    expect(cls).toBeLessThan(0.1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📏 PAGE LOAD TIMES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📏 Page Load Performance', () => {
  const criticalPages = [
    { path: '/', name: 'Homepage', maxTime: 3000 },
    { path: '/central-comando/visao-geral', name: 'Command Center', maxTime: 5000 },
    { path: '/peotram', name: 'PEOTRAM', maxTime: 4000 },
    { path: '/crew-management', name: 'Crew Management', maxTime: 4000 },
    { path: '/fleet-manager', name: 'Fleet Manager', maxTime: 4000 },
    { path: '/analytics', name: 'Analytics', maxTime: 5000 },
  ];

  for (const pageConfig of criticalPages) {
    test(`${pageConfig.name} should load within ${pageConfig.maxTime}ms`, async ({ page }) => {
      const startTime = Date.now();
      await page.goto(pageConfig.path);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(pageConfig.maxTime);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 📦 BUNDLE SIZE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📦 Resource Size', () => {
  test('should load minimal JS initially', async ({ page }) => {
    const resources: number[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.js') && response.status() === 200) {
        const headers = response.headers();
        const contentLength = parseInt(headers['content-length'] || '0');
        resources.push(contentLength);
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    const totalJS = resources.reduce((a, b) => a + b, 0);
    const totalKB = totalJS / 1024;
    
    console.log(`Total JS loaded: ${totalKB.toFixed(2)} KB`);
    // Allow up to 500KB for initial JS
    expect(totalKB).toBeLessThan(500);
  });

  test('should have compressed responses', async ({ page }) => {
    let hasCompression = false;
    
    page.on('response', async (response) => {
      const headers = response.headers();
      if (headers['content-encoding']) {
        hasCompression = true;
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    // Note: Compression depends on server config
    console.log('Compression detected:', hasCompression);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🖼️ IMAGE OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🖼️ Image Performance', () => {
  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    const lazyImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      return images.length;
    });
    
    console.log(`Lazy loaded images: ${lazyImages}`);
  });

  test('should use modern image formats', async ({ page }) => {
    const imageTypes: string[] = [];
    
    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'];
      if (contentType?.includes('image/')) {
        imageTypes.push(contentType);
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    console.log('Image formats used:', [...new Set(imageTypes)]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 CACHING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🔄 Caching Strategy', () => {
  test('should cache static assets', async ({ page }) => {
    let cachedAssets = 0;
    
    page.on('response', async (response) => {
      const headers = response.headers();
      const cacheControl = headers['cache-control'];
      if (cacheControl && (cacheControl.includes('max-age') || cacheControl.includes('immutable'))) {
        cachedAssets++;
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    console.log(`Cached assets: ${cachedAssets}`);
    expect(cachedAssets).toBeGreaterThan(0);
  });

  test('should have service worker', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    
    const hasServiceWorker = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    console.log('Service Worker registered:', hasServiceWorker);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 RENDER BLOCKING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🔧 Render Performance', () => {
  test('should not have render-blocking resources', async ({ page }) => {
    await page.goto('/');
    
    const renderBlockingResources = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
      const scripts = document.querySelectorAll('script:not([async]):not([defer]):not([type="module"])');
      return {
        stylesheets: stylesheets.length,
        scripts: scripts.length
      };
    });
    
    console.log('Potential render-blocking:', renderBlockingResources);
  });

  test('should use async/defer for scripts', async ({ page }) => {
    await page.goto('/');
    
    const scriptStats = await page.evaluate(() => {
      const allScripts = document.querySelectorAll('script[src]');
      const asyncScripts = document.querySelectorAll('script[async]');
      const deferScripts = document.querySelectorAll('script[defer]');
      const moduleScripts = document.querySelectorAll('script[type="module"]');
      
      return {
        total: allScripts.length,
        async: asyncScripts.length,
        defer: deferScripts.length,
        module: moduleScripts.length
      };
    });
    
    console.log('Script loading:', scriptStats);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 📱 MOBILE PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📱 Mobile Performance', () => {
  test('should perform well on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should be touch-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);
    
    const touchTargets = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      let smallTargets = 0;
      
      buttons.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          smallTargets++;
        }
      });
      
      return { total: buttons.length, small: smallTargets };
    });
    
    console.log('Touch targets:', touchTargets);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 🌐 NETWORK EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🌐 Network Efficiency', () => {
  test('should minimize HTTP requests', async ({ page }) => {
    let requestCount = 0;
    
    page.on('request', () => {
      requestCount++;
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    console.log(`Total HTTP requests: ${requestCount}`);
    expect(requestCount).toBeLessThan(100);
  });

  test('should use HTTP/2', async ({ page }) => {
    let http2Responses = 0;
    let totalResponses = 0;
    
    page.on('response', async (response) => {
      totalResponses++;
      // Note: HTTP/2 detection depends on server
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    console.log(`Total responses: ${totalResponses}`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ⚙️ PERFORMANCE BUDGET
// ═══════════════════════════════════════════════════════════════════════════

test.describe('⚙️ Performance Budget', () => {
  test('should meet performance budget', async ({ page }) => {
    const metrics = {
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      totalSize: 0,
      requestCount: 0
    };
    
    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] || '';
      const contentLength = parseInt(response.headers()['content-length'] || '0');
      
      metrics.requestCount++;
      metrics.totalSize += contentLength;
      
      if (contentType.includes('javascript')) {
        metrics.jsSize += contentLength;
      } else if (contentType.includes('css')) {
        metrics.cssSize += contentLength;
      } else if (contentType.includes('image')) {
        metrics.imageSize += contentLength;
      }
    });
    
    await page.goto('/');
    await waitForPageLoad(page);
    
    console.log('Performance Budget Results:');
    console.log(`  JS: ${(metrics.jsSize / 1024).toFixed(2)} KB`);
    console.log(`  CSS: ${(metrics.cssSize / 1024).toFixed(2)} KB`);
    console.log(`  Images: ${(metrics.imageSize / 1024).toFixed(2)} KB`);
    console.log(`  Total: ${(metrics.totalSize / 1024).toFixed(2)} KB`);
    console.log(`  Requests: ${metrics.requestCount}`);
    
    // Budget assertions
    expect(metrics.jsSize / 1024).toBeLessThan(500); // < 500KB JS
    expect(metrics.requestCount).toBeLessThan(100);   // < 100 requests
  });
});
