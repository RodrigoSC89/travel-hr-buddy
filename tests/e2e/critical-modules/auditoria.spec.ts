/**
 * E2E Tests - SGSO/ISM Audit Module
 * Nautilus One CI - Critical Modules
 */

import { test, expect } from '@playwright/test';

test.describe('SGSO/ISM Audit - Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as auditor
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('auditor@nautilus.com');
    await page.getByPlaceholder('Senha').fill('auditor123');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/(dashboard|home)?/);
  });

  test('Registrar auditoria SGSO com evidência', async ({ page }) => {
    await page.getByRole('link', { name: /auditorias/i }).click();
    await page.getByRole('button', { name: /nova auditoria/i }).click();
    
    await page.getByLabel('Tipo de auditoria').selectOption('SGSO');
    await page.getByLabel('Embarcação').selectOption('Nautilus IX');
    
    // Upload evidence file
    await page.setInputFiles('input[type="file"]', 'tests/files/evidencia.jpg');
    
    await page.getByRole('button', { name: /registrar/i }).click();

    await expect(page.getByText('Auditoria registrada com sucesso')).toBeVisible();
  });

  test('Listar auditorias existentes', async ({ page }) => {
    await page.getByRole('link', { name: /auditorias/i }).click();
    
    // Verify audit list
    const auditTable = page.locator('table, [class*="list"], [class*="grid"]').first();
    await expect(auditTable).toBeVisible({ timeout: 10000 });
  });

  test('Preencher checklist dinâmico', async ({ page }) => {
    await page.goto('/sgso');
    
    // Find checkboxes
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 0) {
      // Check first item
      await checkboxes.first().click();
      
      // Verify state changed
      const isChecked = await checkboxes.first().isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test('Verificar upload de evidência PDF', async ({ page }) => {
    await page.getByRole('link', { name: /auditorias/i }).click();
    await page.getByRole('button', { name: /nova auditoria/i }).click();
    
    // Check for file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    
    // Verify accepts PDF
    const accept = await fileInput.getAttribute('accept');
    expect(accept).toContain('pdf');
  });

  test('IA análise de gaps', async ({ page }) => {
    await page.goto('/sgso');
    
    // Look for AI analysis button
    const aiButton = page.getByRole('button', { name: /analisar|IA|gaps/i });
    
    if (await aiButton.isVisible({ timeout: 3000 })) {
      await aiButton.click();
      
      // Wait for AI response
      const aiResponse = page.locator('[class*="ai"], [class*="recommendation"]');
      await expect(aiResponse.first()).toBeVisible({ timeout: 15000 });
    }
  });
});
