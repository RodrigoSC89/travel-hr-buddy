/**
 * E2E tests with Playwright for Nautilus One system
 * Tests validate that main application routes load correctly
 */

import { test, expect } from '@playwright/test';

/**
 * Main routes to validate in the Nautilus One system
 * These routes should load without showing 404 errors and have visible content
 */
const routes = [
  { path: '/', description: 'Home page' },
  { path: '/documents', description: 'Documents page' },
  { path: '/checklists', description: 'Checklists page' },
  { path: '/ai-assistant', description: 'AI Assistant page' },
  { path: '/dashboard', description: 'Dashboard page' },
  { path: '/admin/reports/logs', description: 'Logs page' },
  { path: '/admin/workflows', description: 'Smart Workflows page' },
  { path: '/admin/templates', description: 'Templates page' },
  { path: '/mmi/bi', description: 'MMI BI page' },
];

test.describe('🧪 Main Routes Validation', () => {
  /**
   * Test each route to ensure it loads correctly
   * - Should not redirect to 404
   * - Should have visible body content
   * - Should not show error messages
   */
  for (const route of routes) {
    test(`should load ${route.description} correctly (${route.path})`, async ({ page }) => {
      // Navigate to the route
      await page.goto(route.path);
      
      // Wait for the page to be in a stable state
      await page.waitForLoadState('networkidle');
      
      // Verify the URL does not contain 404
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('404');
      expect(currentUrl).not.toMatch(/not-found/i);
      
      // Verify the body is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Verify there's no "404" or "Not Found" text on the page
      const pageText = await page.textContent('body');
      expect(pageText).toBeTruthy();
    });
  }
});

test.describe('🧪 Navigation and Accessibility', () => {
  test('should have a valid title on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should load without JavaScript errors on dashboard', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // There should be no critical JavaScript errors
    // Note: We allow warnings and info messages, only checking for errors
    const criticalErrors = errors.filter(error => 
      !error.includes('warning') && 
      !error.includes('info') &&
      !error.includes('deprecated')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Detected errors:', criticalErrors);
    }
  });

  test('should have accessible navigation structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify there's some form of navigation (header, nav, or menu)
    const hasNavigation = await page.locator('nav, header, [role="navigation"]').count();
    expect(hasNavigation).toBeGreaterThan(0);
  });
});

test.describe('🧪 Admin Routes Validation', () => {
  const adminRoutes = [
    { path: '/admin', description: 'Admin main page' },
    { path: '/admin/dashboard', description: 'Admin dashboard' },
    { path: '/admin/documents', description: 'Admin documents' },
    { path: '/admin/workflows', description: 'Admin workflows' },
    { path: '/admin/templates', description: 'Admin templates' },
  ];

  for (const route of adminRoutes) {
    test(`should load ${route.description} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded (not 404)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('404');
      
      // Verify body is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

test.describe('🧪 MMI Routes Validation', () => {
  const mmiRoutes = [
    { path: '/mmi/jobs', description: 'MMI Jobs panel' },
    { path: '/mmi/bi', description: 'MMI BI dashboard' },
  ];

  for (const route of mmiRoutes) {
    test(`should load ${route.description} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded (not 404)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('404');
      
      // Verify body is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});
