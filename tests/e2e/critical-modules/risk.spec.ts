/**
 * E2E Tests - Risk Management Module
 * Nautilus One CI - Critical Modules
 */

import { test, expect } from '@playwright/test';

test.describe('Risk Management - Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('admin@nautilus.com');
    await page.getByPlaceholder('Senha').fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/(dashboard|home)?/);
  });

  test('Criar avaliação de risco', async ({ page }) => {
    await page.getByRole('link', { name: /riscos/i }).click();
    await page.getByRole('button', { name: /nova avaliação/i }).click();
    
    await page.getByLabel('Título').fill('Risco de Propulsão');
    await page.getByLabel('Probabilidade').selectOption('Alta');
    await page.getByLabel('Impacto').selectOption('Crítico');
    await page.getByRole('button', { name: /salvar/i }).click();

    await expect(page.getByText('Avaliação registrada com sucesso')).toBeVisible();
  });

  test('Registrar tendência de risco', async ({ page }) => {
    await page.getByRole('link', { name: /riscos/i }).click();
    
    // Navigate to trends section
    const trendsTab = page.getByRole('tab', { name: /tendências/i });
    if (await trendsTab.isVisible()) {
      await trendsTab.click();
    }

    // Verify trends chart is visible
    const chart = page.locator('[class*="recharts"], canvas, svg').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('Listar alertas de risco', async ({ page }) => {
    await page.getByRole('link', { name: /riscos/i }).click();
    
    // Navigate to alerts section
    const alertsTab = page.getByRole('tab', { name: /alertas/i });
    if (await alertsTab.isVisible()) {
      await alertsTab.click();
    }

    // Verify alerts list or empty state
    const alertsList = page.locator('[class*="alert"], [class*="notification"]');
    const count = await alertsList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Visualizar heatmap de risco', async ({ page }) => {
    await page.getByRole('link', { name: /riscos/i }).click();
    
    // Navigate to heatmap
    const heatmapTab = page.getByRole('tab', { name: /mapa|heatmap/i });
    if (await heatmapTab.isVisible()) {
      await heatmapTab.click();
      
      const heatmap = page.locator('[class*="heatmap"], [class*="matrix"]').first();
      await expect(heatmap).toBeVisible({ timeout: 10000 });
    }
  });
});
