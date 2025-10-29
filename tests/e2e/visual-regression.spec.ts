import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests - Mobile/Desktop UI Validation
 * Tests components across different resolutions
 */

const viewports = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile-medium', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-small', width: 1024, height: 768 },
  { name: 'desktop-medium', width: 1366, height: 768 },
  { name: 'desktop-large', width: 1440, height: 900 },
  { name: 'desktop-xl', width: 1920, height: 1080 },
];

test.describe('UI Visual Validation', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport);
      });

      test('should render homepage without layout issues', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check for horizontal scroll (shouldn't exist)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
        
        // Take snapshot
        await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });

      test('should render dashboard without overlap', async ({ page }) => {
        await page.goto('/');
        
        // Try to navigate to dashboard
        const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();
        if (await dashboardLink.count() > 0) {
          await dashboardLink.click();
          await page.waitForLoadState('networkidle');
          
          // Check for element overlaps
          const hasOverlap = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('[data-testid], [class*="card"]'));
            const rects = elements.map(el => el.getBoundingClientRect());
            
            // Check if any elements overlap significantly
            for (let i = 0; i < rects.length; i++) {
              for (let j = i + 1; j < rects.length; j++) {
                const rect1 = rects[i];
                const rect2 = rects[j];
                
                const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
                const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
                
                // If overlap is more than 50% of smaller element, it's a problem
                const area1 = rect1.width * rect1.height;
                const area2 = rect2.width * rect2.height;
                const overlapArea = overlapX * overlapY;
                const minArea = Math.min(area1, area2);
                
                if (overlapArea > minArea * 0.5) {
                  return true;
                }
              }
            }
            return false;
          });
          
          expect(hasOverlap).toBe(false);
          
          await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
            fullPage: true,
            maxDiffPixels: 100,
          });
        }
      });

      test('should render DP Intelligence without breaking', async ({ page }) => {
        await page.goto('/');
        
        const dpLink = page.getByRole('link', { name: /intelligence|dp/i }).first();
        if (await dpLink.count() > 0) {
          await dpLink.click();
          await page.waitForLoadState('networkidle');
          
          // Check for broken layout
          const isBroken = await page.evaluate(() => {
            const body = document.body;
            return body.scrollHeight < 100 || body.scrollWidth < 100;
          });
          
          expect(isBroken).toBe(false);
          
          await expect(page).toHaveScreenshot(`dp-intelligence-${viewport.name}.png`, {
            maxDiffPixels: 100,
          });
        }
      });

      test('should render Forecast page responsively', async ({ page }) => {
        await page.goto('/');
        
        const forecastLink = page.getByRole('link', { name: /forecast/i }).first();
        if (await forecastLink.count() > 0) {
          await forecastLink.click();
          await page.waitForLoadState('networkidle');
          
          // Check responsive elements
          const hasResponsiveClasses = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('[class*="responsive"], [class*="grid"], [class*="flex"]'));
            return elements.length > 0;
          });
          
          expect(hasResponsiveClasses).toBe(true);
          
          await expect(page).toHaveScreenshot(`forecast-${viewport.name}.png`, {
            maxDiffPixels: 100,
          });
        }
      });

      test('should render Document Hub without scroll issues', async ({ page }) => {
        await page.goto('/');
        
        const docLink = page.getByRole('link', { name: /document/i }).first();
        if (await docLink.count() > 0) {
          await docLink.click();
          await page.waitForLoadState('networkidle');
          
          // Check for unintended scroll
          const scrollInfo = await page.evaluate(() => {
            return {
              hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight,
              hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
              scrollHeight: document.documentElement.scrollHeight,
              scrollWidth: document.documentElement.scrollWidth,
            };
          });
          
          // Horizontal scroll should not exist
          expect(scrollInfo.hasHorizontalScroll).toBe(false);
          
          await expect(page).toHaveScreenshot(`documents-${viewport.name}.png`, {
            maxDiffPixels: 100,
          });
        }
      });

      test('should render navigation menu properly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check navigation
        const nav = page.locator('nav').first();
        if (await nav.count() > 0) {
          const isVisible = await nav.isVisible();
          expect(isVisible).toBe(true);
          
          // On mobile, check for hamburger menu
          if (viewport.width < 768) {
            const mobileMenu = page.locator('[aria-label*="menu" i], button[aria-expanded]').first();
            if (await mobileMenu.count() > 0) {
              await mobileMenu.click();
              await page.waitForTimeout(500);
            }
          }
          
          await expect(page).toHaveScreenshot(`navigation-${viewport.name}.png`, {
            maxDiffPixels: 100,
          });
        }
      });

      test('should render forms without truncation', async ({ page }) => {
        await page.goto('/');
        
        // Look for any forms
        const form = page.locator('form').first();
        if (await form.count() > 0) {
          // Check if form elements are visible
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();
          
          if (inputCount > 0) {
            for (let i = 0; i < Math.min(inputCount, 5); i++) {
              const input = inputs.nth(i);
              const isVisible = await input.isVisible();
              expect(isVisible).toBe(true);
            }
          }
        }
      });

      test('should render cards grid responsively', async ({ page }) => {
        await page.goto('/');
        
        // Look for card grids
        const cards = page.locator('[class*="grid"], [class*="flex"]');
        if (await cards.count() > 0) {
          // Check grid layout
          const gridInfo = await cards.first().evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              display: styles.display,
              gridTemplateColumns: styles.gridTemplateColumns,
              flexDirection: styles.flexDirection,
            };
          });
          
          expect(['grid', 'flex', 'block'].includes(gridInfo.display)).toBe(true);
        }
      });

      test('should handle tables responsively', async ({ page }) => {
        await page.goto('/');
        
        // Look for tables
        const table = page.locator('table').first();
        if (await table.count() > 0) {
          // Check if table has overflow handling
          const hasOverflow = await table.evaluate(el => {
            const parent = el.parentElement;
            if (!parent) return false;
            
            const styles = window.getComputedStyle(parent);
            return styles.overflowX === 'auto' || styles.overflowX === 'scroll';
          });
          
          // On mobile, tables should have horizontal scroll
          if (viewport.width < 768) {
            expect(hasOverflow).toBe(true);
          }
        }
      });

      test('should render buttons with proper sizing', async ({ page }) => {
        await page.goto('/');
        
        // Check button sizes
        const buttons = page.locator('button').filter({ hasText: /./});
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            const box = await button.boundingBox();
            
            if (box) {
              // Buttons should be at least 44x44 on mobile (accessibility)
              if (viewport.width < 768) {
                expect(box.height).toBeGreaterThanOrEqual(40);
              }
            }
          }
        }
      });
    });
  }
});
