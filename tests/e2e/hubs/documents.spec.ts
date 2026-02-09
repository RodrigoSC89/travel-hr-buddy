/**
 * NAUTI ONE — E2E: Documents Hub
 * Tests document management workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Documents Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('documents page loads', async ({ page }) => {
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('workbench docs section loads', async ({ page }) => {
    await page.goto('/workbench?section=docs');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('document center premium loads', async ({ page }) => {
    await page.goto('/document-center');
    await page.waitForLoadState('networkidle');
    // Either renders or redirects to workbench docs
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
