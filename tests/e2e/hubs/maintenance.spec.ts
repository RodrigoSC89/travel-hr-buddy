/**
 * NAUTI ONE — E2E: Maintenance Hub
 * Tests maintenance workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Maintenance Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('hub loads with all tabs', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('predictive tab loads', async ({ page }) => {
    await page.goto('/maintenance?tab=predictive');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('drydock tab loads', async ({ page }) => {
    await page.goto('/maintenance?tab=drydock');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('predictive maintenance standalone page', async ({ page }) => {
    await page.goto('/predictive-maintenance');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('ESG tab loads', async ({ page }) => {
    await page.goto('/maintenance?tab=esg');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});
