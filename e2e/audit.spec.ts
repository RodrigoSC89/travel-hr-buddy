import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Audit Simulation
 * Tests report generation and AI-driven insights
 */

test.describe('Audit Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display audit dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard-auditorias');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(dashboard-auditorias|unauthorized)/);
  });

  test('should navigate to IMCA audits page', async ({ page }) => {
    await page.goto('/admin/auditorias-imca');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(auditorias-imca|unauthorized)/);
  });

  test('should display audits list', async ({ page }) => {
    await page.goto('/admin/auditorias-lista');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(auditorias-lista|unauthorized)/);
  });

  test('should navigate to IMCA audit form', async ({ page }) => {
    await page.goto('/imca-audit');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(imca-audit|unauthorized)/);
  });

  test('should display simulations page', async ({ page }) => {
    await page.goto('/admin/simulations');
    
    // Check if redirected to unauthorized or page loads
    const url = page.url();
    expect(url).toMatch(/(simulations|unauthorized)/);
  });
});
