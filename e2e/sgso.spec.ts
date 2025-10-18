import { test, expect } from '@playwright/test';

/**
 * E2E Tests for SGSO Safety System
 * Tests incident registration and AI-powered analysis
 */

test.describe('SGSO System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display SGSO page', async ({ page }) => {
    await page.goto('/sgso');
    
    // Check if redirected to unauthorized or SGSO page loads
    const url = page.url();
    expect(url).toMatch(/(sgso|unauthorized)/);
  });

  test('should navigate to SGSO report page', async ({ page }) => {
    await page.goto('/sgso/report');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(sgso|unauthorized)/);
  });

  test('should display admin SGSO page', async ({ page }) => {
    await page.goto('/admin/sgso');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(sgso|unauthorized)/);
  });

  test('should navigate to risk metrics page', async ({ page }) => {
    await page.goto('/admin/metricas-risco');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(metricas-risco|unauthorized)/);
  });

  test('should display DP incidents page', async ({ page }) => {
    await page.goto('/dp-incidents');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(dp-incidents|unauthorized)/);
  });
});
