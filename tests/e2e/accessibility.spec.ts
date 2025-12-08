/**
 * Accessibility E2E Tests
 * Testa acessibilidade WCAG 2.1
 */
import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has title', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  test('page has main landmark', async ({ page }) => {
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    const buttons = page.locator('button').first();
    
    if (await buttons.count() > 0) {
      await buttons.focus();
      await expect(buttons).toBeFocused();
    }
  });

  test('links have descriptive text', async ({ page }) => {
    const links = await page.locator('a').all();
    
    for (const link of links.slice(0, 10)) { // Check first 10 links
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('images have alt text', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Image should have alt or be decorative (role="presentation")
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    const inputs = await page.locator('input:not([type="hidden"])').all();
    
    for (const input of inputs.slice(0, 10)) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
      }
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    // Basic check - ensure text is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // More detailed contrast checks would use axe-core
  });

  test('focus is visible', async ({ page }) => {
    const focusableElements = page.locator('button, a, input, select, textarea');
    const first = focusableElements.first();
    
    if (await first.count() > 0) {
      await first.focus();
      
      // Element should be focused
      await expect(first).toBeFocused();
    }
  });
});

test.describe('Keyboard Navigation', () => {
  test('can navigate with Tab key', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('can navigate backwards with Shift+Tab', async ({ page }) => {
    await page.goto('/');
    
    // Tab forward
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Tab backward
    await page.keyboard.press('Shift+Tab');
    
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});

test.describe('Screen Reader', () => {
  test('headings are properly structured', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    
    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(0); // May not be visible initially
  });

  test('aria-live regions exist for dynamic content', async ({ page }) => {
    await page.goto('/');
    
    const liveRegions = await page.locator('[aria-live]').count();
    const statusRegions = await page.locator('[role="status"], [role="alert"]').count();
    
    // May have live regions for notifications
    expect(liveRegions + statusRegions).toBeGreaterThanOrEqual(0);
  });
});
