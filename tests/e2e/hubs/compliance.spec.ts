/**
 * NAUTI ONE — E2E: Compliance Hub
 * Tests audit workflows and compliance modules
 */

import { test, expect } from '@playwright/test';

test.describe('Compliance Hub', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('hub loads', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
    const content = page.locator('main, .flex-1');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });

  test('risk matrix page renders', async ({ page }) => {
    await page.goto('/risk-matrix');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('PEO-DP audit page renders', async ({ page }) => {
    await page.goto('/peo-dp');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('SGSO ANP page renders', async ({ page }) => {
    await page.goto('/sgso');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('MLC inspection page renders', async ({ page }) => {
    await page.goto('/mlc-inspection');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('PSC package page renders', async ({ page }) => {
    await page.goto('/psc-package');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });

  test('audit agents page renders', async ({ page }) => {
    await page.goto('/audit-agents');
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    expect(body).not.toContain('Not Found');
  });
});
