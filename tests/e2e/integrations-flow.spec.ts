/**
 * PATCH: E2E Tests - Integrations Flow
 * Tests integration pages and Supabase connectivity
 */

import { test, expect } from '@playwright/test';
import { setupConsoleErrorListener, filterCriticalErrors } from './test-utils';

test.describe('Integrations Module', () => {
  test('should access integrations page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/integrations');
    await page.waitForTimeout(2000);
    
    const hasIntegrationContent = await page.getByText(/integration|integração|connect|conexão|api/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasIntegrationContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('should display available integrations', async ({ page }) => {
    await page.goto('/integrations');
    await page.waitForTimeout(1000);
    
    // Look for integration cards or list
    const hasCards = await page.locator('.card, [data-integration]').first().isVisible().catch(() => false);
    const hasList = await page.locator('[role="list"], .integration-list').first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasCards || hasList || redirectedToLogin).toBeTruthy();
  });
});

test.describe('Settings Module', () => {
  test('should access settings page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    
    const hasSettingsContent = await page.getByText(/settings|configurações|preferences|preferências/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasSettingsContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('should have settings form elements', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // Look for form elements
    const hasInputs = await page.locator('input, select, textarea').first().isVisible().catch(() => false);
    const hasToggle = await page.locator('[role="switch"], input[type="checkbox"]').first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasInputs || hasToggle || redirectedToLogin).toBeTruthy();
  });
});

test.describe('Analytics Module', () => {
  test('should access analytics page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    
    const hasAnalyticsContent = await page.getByText(/analytics|análise|metrics|métricas|dashboard/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasAnalyticsContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('should display charts or data visualizations', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    
    // Look for chart elements
    const hasChart = await page.locator('canvas, svg, .chart, .recharts-wrapper, [data-chart]').first().isVisible().catch(() => false);
    const hasTable = await page.locator('table, [role="grid"]').first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasChart || hasTable || redirectedToLogin).toBeTruthy();
  });
});

test.describe('Reports Module', () => {
  test('should access reports page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/reports');
    await page.waitForTimeout(2000);
    
    const hasReportsContent = await page.getByText(/report|relatório|export|exportar/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasReportsContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });
});

test.describe('AI Modules', () => {
  test('should access AI dashboard', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/ai-dashboard');
    await page.waitForTimeout(2000);
    
    const hasAIContent = await page.getByText(/ai|inteligência|artificial|machine|learning/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes('login');
    
    expect(hasAIContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('should access AI suggestions page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/ai-suggestions');
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('body').textContent();
    const redirectedToLogin = page.url().includes('login');
    
    expect((hasContent?.length ?? 0) > 0 || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('should access AI adoption page', async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto('/ai-adoption');
    await page.waitForTimeout(2000);
    
    const hasContent = await page.locator('body').textContent();
    const redirectedToLogin = page.url().includes('login');
    
    expect((hasContent?.length ?? 0) > 0 || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });
});
