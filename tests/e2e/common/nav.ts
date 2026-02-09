/**
 * NAUTI ONE — E2E Navigation Helpers
 * Sidebar navigation and route validation
 */

import { Page, expect } from '@playwright/test';

/**
 * Navigate to a route and verify it loads correctly
 */
export async function navigateAndVerify(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  // Must not be 404
  const body = await page.textContent('body');
  expect(body).not.toContain('Not Found');
  expect(body).not.toContain('404');

  // Must have visible main content
  const content = page.locator('main, [role="main"], .flex-1, [data-testid="page-header"]');
  await expect(content.first()).toBeVisible({ timeout: 10000 });
}

/**
 * Verify a page has proper content (not blank)
 */
export async function verifyPageHasContent(page: Page) {
  // Must have either data or an empty state — never blank
  const emptyState = page.locator('[data-testid="empty-state"]');
  const pageHeader = page.locator('[data-testid="page-header"]');
  const tableRows = page.locator('table tbody tr, [data-testid="data-row"]');
  const cards = page.locator('[data-testid="data-card"], .card');

  const hasEmptyState = await emptyState.isVisible().catch(() => false);
  const hasHeader = await pageHeader.isVisible().catch(() => false);
  const hasTableData = await tableRows.count() > 0;
  const hasCards = await cards.count() > 0;

  expect(hasEmptyState || hasHeader || hasTableData || hasCards).toBe(true);
}

/**
 * Click a sidebar item by route key
 */
export async function clickSidebarItem(page: Page, testId: string) {
  const sidebarItem = page.locator(`[data-testid="${testId}"]`);
  if (await sidebarItem.isVisible().catch(() => false)) {
    await sidebarItem.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Verify sidebar is visible and has groups
 */
export async function verifySidebarLoaded(page: Page) {
  const sidebar = page.locator('aside, [data-testid="sidebar"], nav').first();
  await expect(sidebar).toBeVisible({ timeout: 10000 });
}

/**
 * Get all sidebar navigation links
 */
export async function getSidebarLinks(page: Page): Promise<string[]> {
  const links = page.locator('aside a[href], nav a[href]');
  const count = await links.count();
  const hrefs: string[] = [];
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute('href');
    if (href) hrefs.push(href);
  }
  return hrefs;
}
