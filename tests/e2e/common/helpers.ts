/**
 * NAUTI ONE — E2E Test Helpers
 * Common utilities for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Login helper — uses env vars for credentials
 */
export async function login(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/command**', { timeout: 15000 });
}

/**
 * Navigate to route and verify it loads
 */
export async function navigateAndVerify(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const body = await page.textContent('body');
  expect(body).not.toContain('Not Found');
  expect(body).not.toContain('404');

  const content = page.locator('main, [role="main"], .flex-1');
  await expect(content.first()).toBeVisible({ timeout: 10000 });
}

/**
 * Verify empty state is shown (not blank page)
 */
export async function verifyEmptyState(page: Page) {
  const emptyState = page.locator('[data-testid="empty-state"]');
  const tableRows = page.locator('table tbody tr, [data-testid="data-row"]');
  
  const hasData = await tableRows.count() > 0;
  const hasEmptyState = await emptyState.isVisible().catch(() => false);
  
  // Must have either data or an empty state - never a blank screen
  expect(hasData || hasEmptyState).toBe(true);
}

/**
 * Verify a button has a real action (not dead)
 */
export async function verifyButtonAction(page: Page, buttonSelector: string) {
  const button = page.locator(buttonSelector);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  
  // Click and verify something happens (dialog, navigation, toast)
  await button.click();
  await page.waitForTimeout(1000);
  
  // Check for any response: dialog, toast, navigation change, new content
  const dialog = page.locator('[role="dialog"], [data-state="open"]');
  const toast = page.locator('[data-sonner-toast]');
  
  const hasDialog = await dialog.isVisible().catch(() => false);
  const hasToast = await toast.isVisible().catch(() => false);
  
  return { hasDialog, hasToast };
}

/**
 * Collect console errors during a page visit
 */
export async function collectConsoleErrors(page: Page, action: () => Promise<void>): Promise<string[]> {
  const errors: string[] = [];
  
  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  };
  
  page.on('console', handler);
  await action();
  await page.waitForTimeout(2000);
  page.off('console', handler);
  
  // Filter known benign errors
  return errors.filter(
    (e) => !e.includes('ResizeObserver') && !e.includes('favicon') && !e.includes('AbortError')
  );
}
