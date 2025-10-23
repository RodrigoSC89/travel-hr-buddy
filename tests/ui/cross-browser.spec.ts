/**
 * Cross-Browser Compatibility Tests - PATCH 67.4
 * Tests to ensure consistent behavior across different browsers
 */

import { test, expect, devices } from '@playwright/test';

const criticalRoutes = [
  '/',
  '/dashboard',
  '/vessels',
  '/crew',
  '/incidents',
];

const browsers = [
  { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
  { name: 'Desktop Safari', device: devices['Desktop Safari'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPhone 12', device: devices['iPhone 12'] },
];

browsers.forEach(({ name, device }) => {
  test.describe(`Cross-Browser: ${name}`, () => {
    test.use(device);

    criticalRoutes.forEach(route => {
      test(`should load ${route} correctly`, async ({ page }) => {
        await page.goto(route);
        
        // Page should load successfully
        await expect(page).not.toHaveURL(/error/);
        
        // Main content should be visible
        const main = page.locator('main, [role="main"]');
        await expect(main).toBeVisible({ timeout: 10000 });
      });
    });

    test('should handle CSS Grid layout', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check if grid layout is applied
      const grid = page.locator('.grid, [style*="display: grid"]').first();
      if (await grid.count() > 0) {
        const display = await grid.evaluate(el => 
          window.getComputedStyle(el).display
        );
        expect(display).toBe('grid');
      }
    });

    test('should support Flexbox layout', async ({ page }) => {
      await page.goto('/');
      
      // Check if flexbox is working
      const flex = page.locator('.flex, [style*="display: flex"]').first();
      if (await flex.count() > 0) {
        const display = await flex.evaluate(el => 
          window.getComputedStyle(el).display
        );
        expect(display).toBe('flex');
      }
    });

    test('should handle touch events', async ({ page }) => {
      if (name.includes('iPhone') || name.includes('Pixel')) {
        await page.goto('/');
        
        // Simulate touch tap
        const button = page.locator('button').first();
        await button.tap();
        
        // Should not have hover states stuck
        const hasHover = await button.evaluate(el => 
          window.getComputedStyle(el, ':hover').getPropertyValue('background-color')
        );
        expect(hasHover).toBeTruthy();
      }
    });

    test('should support modern JavaScript features', async ({ page }) => {
      await page.goto('/');
      
      // Test async/await support
      const asyncSupported = await page.evaluate(() => {
        try {
          const fn = new Function('return (async () => { return true; })()');
          return fn instanceof Promise;
        } catch {
          return false;
        }
      });
      
      expect(asyncSupported).toBe(true);
    });

    test('should handle localStorage', async ({ page }) => {
      await page.goto('/');
      
      // Test localStorage availability
      const localStorageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const result = localStorage.getItem('test') === 'value';
          localStorage.removeItem('test');
          return result;
        } catch {
          return false;
        }
      });
      
      expect(localStorageWorks).toBe(true);
    });

    test('should support fetch API', async ({ page }) => {
      await page.goto('/');
      
      const fetchSupported = await page.evaluate(() => {
        return typeof fetch === 'function';
      });
      
      expect(fetchSupported).toBe(true);
    });

    test('should handle viewport changes', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('body')).toBeVisible();
      
      // Tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('body')).toBeVisible();
      
      // Mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('body')).toBeVisible();
    });

    test('should support CSS custom properties', async ({ page }) => {
      await page.goto('/');
      
      const customPropsSupported = await page.evaluate(() => {
        const el = document.createElement('div');
        el.style.setProperty('--test', 'red');
        return el.style.getPropertyValue('--test') === 'red';
      });
      
      expect(customPropsSupported).toBe(true);
    });

    test('should handle form inputs consistently', async ({ page }) => {
      await page.goto('/');
      
      // Find any text input
      const input = page.locator('input[type="text"], input[type="email"]').first();
      if (await input.count() > 0) {
        await input.fill('Test Input');
        await expect(input).toHaveValue('Test Input');
      }
    });
  });
});

test.describe('Browser-Specific Features', () => {
  test('Chrome: Should support WebP images', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    await page.goto('/');
    const supportsWebP = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    });
    
    expect(supportsWebP).toBe(true);
  });

  test('Firefox: Should support CSS containment', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    
    await page.goto('/');
    const supportsContainment = await page.evaluate(() => {
      return CSS.supports('contain', 'layout style paint');
    });
    
    expect(supportsContainment).toBe(true);
  });

  test('Safari: Should handle date inputs', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');
    
    await page.goto('/');
    const dateInputSupported = await page.evaluate(() => {
      const input = document.createElement('input');
      input.type = 'date';
      return input.type === 'date';
    });
    
    expect(dateInputSupported).toBe(true);
  });
});
