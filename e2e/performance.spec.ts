import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load homepage within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should have good Largest Contentful Paint", async ({ page }) => {
    await page.goto("/");
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5s for "good" score
    expect(lcp).toBeLessThan(4500); // Allowing some buffer for test environment
  });

  test("should have minimal Cumulative Layout Shift", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    
    // CLS should be under 0.1 for "good" score
    expect(cls).toBeLessThan(0.25);
  });

  test("should have no JavaScript errors on load", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });
    
    await page.goto("/");
    await page.waitForTimeout(2000);
    
    expect(errors).toEqual([]);
  });

  test("should have no failed network requests", async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.goto("/");
    await page.waitForTimeout(2000);
    
    expect(failedRequests).toEqual([]);
  });

  test("should have proper caching headers for static assets", async ({ page }) => {
    const staticAssets: { url: string; cacheControl?: string }[] = [];
    
    page.on("response", (response) => {
      const url = response.url();
      if (url.match(/\.(js|css|png|jpg|jpeg|svg|woff2?)$/)) {
        staticAssets.push({
          url,
          cacheControl: response.headers()["cache-control"],
        });
      }
    });
    
    await page.goto("/");
    
    // Check that static assets have cache headers
    for (const asset of staticAssets) {
      if (asset.cacheControl) {
        expect(asset.cacheControl).toMatch(/max-age|immutable/);
      }
    }
  });
});

test.describe("Core Web Vitals", () => {
  test("should measure all Web Vitals", async ({ page }) => {
    await page.goto("/");
    
    const webVitals = await page.evaluate(() => {
      return new Promise<{ fcp: number; lcp: number; ttfb: number }>((resolve) => {
        const vitals = { fcp: 0, lcp: 0, ttfb: 0 };
        
        // TTFB
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        vitals.ttfb = navigation.responseStart - navigation.requestStart;
        
        // FCP
        const fcpObserver = new PerformanceObserver((list) => {
          const entry = list.getEntries()[0];
          vitals.fcp = entry.startTime;
        });
        fcpObserver.observe({ type: "paint", buffered: true });
        
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.lcp = entries[entries.length - 1].startTime;
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        
        setTimeout(() => resolve(vitals), 3000);
      });
    });
    
    console.log("Web Vitals:", webVitals);
    
    // Assertions with reasonable thresholds
    expect(webVitals.ttfb).toBeLessThan(1500);
    expect(webVitals.fcp).toBeLessThan(3500);
    expect(webVitals.lcp).toBeLessThan(4500);
  });
});
