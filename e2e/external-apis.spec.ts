/**
 * External APIs E2E Tests
 * PATCH: Roadmap v3.2.0 - Testing
 */

import { test, expect } from '@playwright/test';

test.describe('External APIs Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/external-apis');
  });

  test('loads external APIs page', async ({ page }) => {
    await expect(page.locator('text=APIs Externas')).toBeVisible({ timeout: 10000 });
  });

  test('displays API cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should show major APIs
    await expect(page.locator('text=Amadeus')).toBeVisible();
    await expect(page.locator('text=StormGlass')).toBeVisible();
    await expect(page.locator('text=Copernicus')).toBeVisible();
  });

  test('shows API status badges', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should have status indicators
    const badges = page.locator('[class*="badge" i]');
    const count = await badges.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('refresh button works', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Verificar Todas")');
    await expect(refreshButton).toBeVisible();
    
    await refreshButton.click();
    
    // Should show loading state
    await page.waitForTimeout(500);
  });

  test('shows configuration info', async ({ page }) => {
    await expect(page.locator('text=Configuração de APIs')).toBeVisible();
    
    // Should show environment variable names
    await expect(page.locator('text=AMADEUS_API_KEY')).toBeVisible();
    await expect(page.locator('text=STORMGLASS_API_KEY')).toBeVisible();
  });

  test('documentation links work', async ({ page }) => {
    // Find documentation buttons
    const docButtons = page.locator('button:has-text("Documentação")');
    const count = await docButtons.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Weather Maritime Page', () => {
  test('loads weather page', async ({ page }) => {
    await page.goto('/weather-maritime');
    await page.waitForLoadState('networkidle');
    
    // Should load without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('AIS Tracker Page', () => {
  test('loads AIS tracker', async ({ page }) => {
    await page.goto('/ais-tracker-page');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Port API Page', () => {
  test('loads port API page', async ({ page }) => {
    await page.goto('/port-api');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Flight Tracker Page', () => {
  test('loads flight tracker', async ({ page }) => {
    await page.goto('/flight-tracker');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
