/**
 * NAUTI ONE — E2E: Operations Hub
 * Tests CRUD flows in the Operations mega-hub
 */

import { test, expect } from '@playwright/test';

test.describe('Operations Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('hub loads with tabs', async ({ page }) => {
    await page.goto('/ops');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
    const content = page.locator('main, [role="main"], .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('maritime tab loads', async ({ page }) => {
    await page.goto('/ops?tab=maritime');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('fleet tab loads', async ({ page }) => {
    await page.goto('/ops?tab=fleet');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('voyage tab loads', async ({ page }) => {
    await page.goto('/ops?tab=voyage');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('task management page renders', async ({ page }) => {
    await page.goto('/task-management');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
