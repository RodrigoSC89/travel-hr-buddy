/**
 * NAUTI ONE — E2E: People Hub
 * Tests crew management and HR workflows
 */

import { test, expect } from '@playwright/test';

test.describe('People Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('people section loads via workbench', async ({ page }) => {
    await page.goto('/workbench?section=people');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('HR dashboard loads', async ({ page }) => {
    await page.goto('/hr-dashboard');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('crew wellbeing page renders', async ({ page }) => {
    await page.goto('/crew-wellbeing');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('STCW/MLC center renders', async ({ page }) => {
    await page.goto('/stcw-mlc');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('medical infirmary renders', async ({ page }) => {
    await page.goto('/medical-infirmary');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
