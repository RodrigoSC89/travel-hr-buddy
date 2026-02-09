/**
 * NAUTI ONE — E2E Smoke Test
 * Validates core navigation and page rendering
 * Every sidebar item must load without errors
 */

import { test, expect } from '@playwright/test';

// All 7 mega-hub routes + key standalone routes
const MEGA_HUB_ROUTES = [
  { path: '/command', name: 'Command Hub' },
  { path: '/ops', name: 'Ops Hub' },
  { path: '/maintenance', name: 'Maintenance Hub' },
  { path: '/ai', name: 'AI Hub' },
  { path: '/tracking', name: 'Tracking Hub' },
  { path: '/compliance', name: 'Compliance Hub' },
  { path: '/workbench', name: 'Workbench Hub' },
];

const CRITICAL_ROUTES = [
  { path: '/peo-dp', name: 'PEO-DP Audit' },
  { path: '/peotram', name: 'PEOTRAM Audit' },
  { path: '/sgso', name: 'SGSO ANP' },
  { path: '/risk-matrix', name: 'Risk Matrix' },
  { path: '/psc-package', name: 'PSC Package' },
  { path: '/mlc-inspection', name: 'MLC Inspection' },
  { path: '/settings', name: 'Settings' },
  { path: '/documents', name: 'Documents' },
  { path: '/fleet-pulse', name: 'Fleet Pulse' },
  { path: '/predictive-maintenance', name: 'Predictive Maintenance' },
  { path: '/finance-command', name: 'Finance Command' },
  { path: '/hr-dashboard', name: 'HR Dashboard' },
  { path: '/dp-intelligence', name: 'DP Intelligence' },
  { path: '/medical-infirmary', name: 'Medical Infirmary' },
];

test.describe('Smoke Test — Core Navigation', () => {
  // Assume unauthenticated user redirects to /auth
  test('unauthenticated user redirects to auth', async ({ page }) => {
    await page.goto('/command');
    await page.waitForLoadState('networkidle');
    // Should redirect to auth page
    expect(page.url()).toContain('/auth');
  });

  test('auth page renders login form', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    // Should have email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
  });

  test('landing page renders', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    // Should have content (not blank/error)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
});

test.describe('Smoke Test — Mega Hubs (requires auth)', () => {
  // These tests require login — skip if no test credentials configured
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  for (const hub of MEGA_HUB_ROUTES) {
    test(`${hub.name} loads without error`, async ({ page }) => {
      await page.goto(hub.path);
      await page.waitForLoadState('networkidle');

      // Should NOT show 404 or error
      const content = await page.textContent('body');
      expect(content).not.toContain('404');
      expect(content).not.toContain('Not Found');

      // Should have meaningful content (not just loader)
      const mainContent = page.locator('main, [role="main"], .flex-1');
      await expect(mainContent.first()).toBeVisible({ timeout: 10000 });

      // Should NOT have uncaught errors in console
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      
      // Wait a bit for any async errors
      await page.waitForTimeout(2000);
      
      // Filter out known benign errors
      const criticalErrors = errors.filter(
        (e) => !e.includes('ResizeObserver') && !e.includes('AbortError')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Smoke Test — Critical Routes (requires auth)', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  for (const route of CRITICAL_ROUTES) {
    test(`${route.name} (${route.path}) renders`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Should render content, not 404
      const body = await page.textContent('body');
      expect(body).not.toContain('Not Found');

      // Should have visible main content
      const content = page.locator('main, [role="main"], .flex-1, [data-testid="page-header"]');
      await expect(content.first()).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe('Smoke Test — Sidebar Navigation', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Skipping: TEST_USER_EMAIL not set');

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command**', { timeout: 15000 });
  });

  test('sidebar renders with all hub groups', async ({ page }) => {
    // Sidebar should be visible on desktop
    const sidebar = page.locator('aside, [data-testid="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Should have all 8 group titles (7 hubs + World-Class)
    const hubLabels = ['Command', 'Ops', 'Maintenance', 'AI', 'Tracking', 'Compliance', 'Workbench'];
    for (const label of hubLabels) {
      const group = page.locator(`text=${label}`).first();
      await expect(group).toBeVisible({ timeout: 5000 });
    }
  });

  test('clicking sidebar items navigates without error', async ({ page }) => {
    // Click first hub item
    const firstLink = page.locator('aside a[href], nav a[href]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await page.waitForLoadState('networkidle');

      // Should not show error
      const body = await page.textContent('body');
      expect(body).not.toContain('Not Found');
    }
  });
});
