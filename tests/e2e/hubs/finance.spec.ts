/**
 * NAUTI ONE — E2E: Finance Hub
 * Tests financial management workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Finance Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('finance section loads via workbench', async ({ page }) => {
    await page.goto('/workbench?section=finance');
    await page.waitForLoadState('networkidle');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('finance command center loads', async ({ page }) => {
    await page.goto('/finance-command');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('payroll page renders', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('procurement page renders', async ({ page }) => {
    await page.goto('/procurement');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
