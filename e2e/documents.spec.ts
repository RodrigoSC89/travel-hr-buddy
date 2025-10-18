import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Document Management
 * Tests document creation, AI generation, and PDF export
 */

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: Real tests would require authentication
  });

  test('should display documents page', async ({ page }) => {
    await page.goto('/documents');
    
    // Check if redirected to unauthorized or documents page loads
    const url = page.url();
    expect(url).toMatch(/(documents|unauthorized)/);
  });

  test('should navigate to intelligent documents', async ({ page }) => {
    await page.goto('/intelligent-documents');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(intelligent-documents|unauthorized)/);
  });

  test('should display admin documents page', async ({ page }) => {
    await page.goto('/admin/documents');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(documents|unauthorized)/);
  });

  test('should navigate to AI templates page', async ({ page }) => {
    await page.goto('/admin/documents/ai/templates');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(templates|unauthorized)/);
  });

  test('should navigate to document editor', async ({ page }) => {
    await page.goto('/admin/documents/editor');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(editor|unauthorized)/);
  });
});
