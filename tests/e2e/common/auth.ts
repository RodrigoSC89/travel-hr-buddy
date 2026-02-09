/**
 * NAUTI ONE — E2E Auth Helpers
 * Login & session management for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Login via UI — the standard approach
 * Uses env vars: TEST_USER_EMAIL, TEST_USER_PASSWORD
 */
export async function loginViaUI(page: Page) {
  const email = process.env.TEST_USER_EMAIL || '';
  const password = process.env.TEST_USER_PASSWORD || '';

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set');
  }

  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);

  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(password);

  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();

  // Wait for redirect to command hub
  await page.waitForURL('**/command**', { timeout: 20000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const url = page.url();
    return !url.includes('/auth') && !url.includes('/login');
  } catch {
    return false;
  }
}

/**
 * Ensure user is logged in — login if not
 */
export async function ensureLoggedIn(page: Page) {
  await page.goto('/command');
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/auth')) {
    await loginViaUI(page);
  }
}
