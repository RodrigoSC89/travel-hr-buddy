/**
 * NAUTI ONE — E2E: Tracking Hub
 * Tests tracking, telemetry, and map views
 */

import { test, expect } from '@playwright/test';

test.describe('Tracking Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('hub loads', async ({ page }) => {
    await page.goto('/tracking');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('realtime tab loads', async ({ page }) => {
    await page.goto('/tracking?tab=realtime');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('AIS tab loads', async ({ page }) => {
    await page.goto('/tracking?tab=ais');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('weather tab loads', async ({ page }) => {
    await page.goto('/tracking?tab=weather');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('IoT dashboard page renders', async ({ page }) => {
    await page.goto('/iot-dashboard');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
