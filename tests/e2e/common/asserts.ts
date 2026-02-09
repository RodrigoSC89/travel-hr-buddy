/**
 * NAUTI ONE — E2E Assertion Helpers
 * Reusable assertions for common patterns
 */

import { Page, expect } from '@playwright/test';

/**
 * Verify a button performs a real action (navigation, dialog, or toast)
 */
export async function verifyButtonAction(page: Page, selector: string) {
  const button = page.locator(selector).first();
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();

  const urlBefore = page.url();
  await button.click();
  await page.waitForTimeout(1500);

  // Check for response: dialog, toast, or navigation
  const dialog = page.locator('[role="dialog"], [data-state="open"]');
  const toast = page.locator('[data-sonner-toast]');
  const urlAfter = page.url();

  const hasDialog = await dialog.isVisible().catch(() => false);
  const hasToast = await toast.isVisible().catch(() => false);
  const hasNavigated = urlBefore !== urlAfter;

  return { hasDialog, hasToast, hasNavigated, didSomething: hasDialog || hasToast || hasNavigated };
}

/**
 * Verify no console errors during an action
 */
export async function withoutConsoleErrors(page: Page, action: () => Promise<void>): Promise<string[]> {
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

  // Filter benign errors
  return errors.filter(
    (e) =>
      !e.includes('ResizeObserver') &&
      !e.includes('favicon') &&
      !e.includes('AbortError') &&
      !e.includes('net::ERR')
  );
}

/**
 * Verify a form submit results in a toast (success or error)
 */
export async function verifyFormSubmit(page: Page, submitSelector: string) {
  const submit = page.locator(submitSelector).first();
  await submit.click();
  await page.waitForTimeout(2000);

  const toast = page.locator('[data-sonner-toast]');
  const hasToast = await toast.isVisible().catch(() => false);
  return hasToast;
}

/**
 * Verify a table has data or empty state
 */
export async function verifyTableOrEmpty(page: Page) {
  const tableRows = page.locator('table tbody tr');
  const emptyState = page.locator('[data-testid="empty-state"]');

  const rowCount = await tableRows.count();
  const hasEmpty = await emptyState.isVisible().catch(() => false);

  expect(rowCount > 0 || hasEmpty).toBe(true);
}

/**
 * Verify loading state appears then resolves
 */
export async function verifyLoadingTransition(page: Page) {
  const loading = page.locator('[data-testid="loading-state"]');
  // Loading may or may not appear (fast queries skip it)
  // But content should eventually appear
  const content = page.locator('[data-testid="page-header"], [data-testid="empty-state"], table');
  await expect(content.first()).toBeVisible({ timeout: 15000 });
}
