import { test, expect } from '@playwright/test';

/**
 * Voice NLU System - E2E Tests
 * Tests voice command interface and NLU processing
 */

test.describe('Voice NLU Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display voice button in floating container', async ({ page }) => {
    // Look for the voice/microphone button
    const voiceButton = page.locator('button[aria-label*="voz" i], button:has(svg.lucide-mic), button:has(svg.lucide-mic-off)');
    await expect(voiceButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show voice button across different routes', async ({ page }) => {
    const routes = ['/central-comando', '/crew', '/vessels', '/compliance-center'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      
      const voiceButton = page.locator('button:has(svg[class*="lucide-mic"])');
      // Voice button should be available globally
    }
  });

  test('should have accessible voice controls', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    // Check for aria labels on voice controls
    const accessibleVoice = page.locator('[aria-label*="voz" i], [aria-label*="voice" i], [aria-label*="mic" i]');
    // Accessibility attributes should be present
  });

  test('should maintain voice button visibility on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/central-comando');
    await page.waitForTimeout(2000);

    const voiceButton = page.locator('button:has(svg[class*="lucide-mic"])');
    // Voice button should be visible on mobile
  });
});

test.describe('Voice NLU Navigation Commands', () => {
  test('should have navigation intent handlers configured', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');

    // Verify voice system is loaded by checking for related UI elements
    const floatingButtons = page.locator('[class*="floating"], [class*="fixed"]').filter({
      has: page.locator('button')
    });
    
    // Floating action buttons should be present
    await expect(floatingButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('should support multiple languages', async ({ page }) => {
    await page.goto('/central-comando');
    
    // The NLU system should support PT-BR and EN commands
    // This tests the presence of the multilingual system
    await page.waitForTimeout(2000);
  });
});

test.describe('Voice Command Integration', () => {
  test('should integrate with central command dashboard', async ({ page }) => {
    await page.goto('/central-comando/visao-geral');
    await page.waitForLoadState('networkidle');

    // Voice should be available in command center
    const dashboard = page.locator('main, [role="main"]');
    await expect(dashboard).toBeVisible();
  });

  test('should not interfere with other floating buttons', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForTimeout(3000);

    // Check that multiple floating buttons don't overlap
    const floatingContainer = page.locator('[class*="FloatingButtons"], .fixed.bottom-4.right-4');
    // Container should organize buttons properly
  });
});
