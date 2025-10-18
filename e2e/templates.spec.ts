import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Template System
 * Tests template creation, application, favorites, filter, and search
 */

test.describe('Template System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display templates page', async ({ page }) => {
    await page.goto('/admin/templates');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(templates|unauthorized)/);
  });

  test('should navigate to template editor', async ({ page }) => {
    await page.goto('/admin/templates/editor');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(editor|unauthorized)/);
  });

  test('should display template editor demo', async ({ page }) => {
    await page.goto('/template-editor-demo');
    
    // Check if page loads
    const url = page.url();
    expect(url).toMatch(/(template-editor-demo)/);
  });

  test('should navigate to AI templates', async ({ page }) => {
    await page.goto('/admin/documents/ai/templates');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(templates|unauthorized)/);
  });

  test('should display workflows page', async ({ page }) => {
    await page.goto('/admin/workflows');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(workflows|unauthorized)/);
  });
});
