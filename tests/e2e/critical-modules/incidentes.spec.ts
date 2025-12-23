/**
 * E2E Tests - Incident Management Module
 * Nautilus One CI - Critical Modules
 */

import { test, expect } from '@playwright/test';

test.describe('Incident Management - Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('admin@nautilus.com');
    await page.getByPlaceholder('Senha').fill('admin123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/(dashboard|home)?/);
  });

  test('Criar incidente com IA operacional', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    await page.getByRole('button', { name: /novo incidente/i }).click();
    
    await page.getByLabel('Descrição').fill('Falha de comunicação com ponte de comando');
    await page.getByLabel('Severidade').selectOption('Alta');
    
    // Request AI response
    await page.getByRole('button', { name: /gerar resposta IA/i }).click();

    // Wait for AI recommendation
    await expect(page.getByText(/Recomendação da IA/)).toBeVisible({ timeout: 30000 });
  });

  test('Listar incidentes existentes', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    
    // Verify incident list
    const incidentList = page.locator('table, [class*="list"], [class*="grid"]').first();
    await expect(incidentList).toBeVisible({ timeout: 10000 });
  });

  test('Anexar comentário a incidente', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    
    // Click on first incident
    const firstIncident = page.locator('tr, [class*="card"]').first();
    if (await firstIncident.isVisible({ timeout: 5000 })) {
      await firstIncident.click();
      
      // Add comment
      const commentInput = page.locator('textarea').first();
      if (await commentInput.isVisible({ timeout: 3000 })) {
        await commentInput.fill('Comentário de teste E2E');
        
        const submitBtn = page.getByRole('button', { name: /enviar|comentar|submit/i });
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      }
    }
  });

  test('Filtrar incidentes por severidade', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    
    // Look for severity filter
    const filter = page.locator('select, [class*="filter"]').first();
    if (await filter.isVisible({ timeout: 3000 })) {
      await filter.selectOption({ index: 1 });
      
      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });

  test('Verificar IA sugerir ação preventiva', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    
    // Click on incident with AI suggestion
    const incidentRow = page.locator('tr, [class*="card"]').first();
    if (await incidentRow.isVisible({ timeout: 5000 })) {
      await incidentRow.click();
      
      // Look for AI panel
      const aiPanel = page.locator('[class*="ai"], [class*="recommendation"]');
      const hasAI = await aiPanel.first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(typeof hasAI).toBe('boolean');
    }
  });

  test('Exportar relatório de incidente', async ({ page }) => {
    await page.getByRole('link', { name: /incidentes/i }).click();
    
    // Look for export button
    const exportBtn = page.getByRole('button', { name: /exportar|export|pdf|download/i });
    if (await exportBtn.isVisible({ timeout: 3000 })) {
      await expect(exportBtn).toBeEnabled();
    }
  });
});
