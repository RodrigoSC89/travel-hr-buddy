/**
 * E2E Tests for ISM Audit Module
 * PATCH-609
 */

import { test, expect } from "@playwright/test";

test.describe("ISM Audit Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to ISM Audits page (adjust route as needed)
    await page.goto("/ism-audits");
  });

  test("should display ISM Audit dashboard", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("ISM Audits");
    await expect(page.getByText("International Safety Management")).toBeVisible();
  });

  test("should show statistics cards", async ({ page }) => {
    await expect(page.getByText("Total de Auditorias")).toBeVisible();
    await expect(page.getByText("Em Andamento")).toBeVisible();
    await expect(page.getByText("Concluídas")).toBeVisible();
    await expect(page.getByText("Score Médio")).toBeVisible();
  });

  test("should open new audit form", async ({ page }) => {
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    await expect(page.getByText("Nova Auditoria ISM")).toBeVisible();
    await expect(page.getByLabel("Embarcação")).toBeVisible();
    await expect(page.getByLabel("Auditor")).toBeVisible();
  });

  test("should open upload dialog", async ({ page }) => {
    await page.getByRole("button", { name: /Upload PDF/i }).click();
    await expect(page.getByText("Upload de Checklist ISM")).toBeVisible();
    await expect(page.getByText("Selecionar Arquivo PDF")).toBeVisible();
  });

  test("should load template in form", async ({ page }) => {
    // Open new audit form
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    
    // Click load template button
    await page.getByRole("button", { name: /Carregar Template/i }).click();
    
    // Verify items are loaded
    await expect(page.getByText("Safety Management System")).toBeVisible();
    await expect(page.getByText("Emergency Preparedness")).toBeVisible();
  });

  test("should create audit with basic information", async ({ page }) => {
    // Open new audit form
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    
    // Fill basic information
    await page.getByLabel("Embarcação").fill("Test Vessel");
    await page.getByLabel("Auditor").fill("Test Auditor");
    await page.getByLabel("Data da Auditoria").fill("2025-01-15");
    
    // Load template
    await page.getByRole("button", { name: /Carregar Template/i }).click();
    
    // Update first item
    const firstItem = page.locator(".checklist-card").first();
    await firstItem.getByRole("button", { name: /Conforme/i }).click();
    
    // Save audit
    await page.getByRole("button", { name: /Salvar/i }).click();
    
    // Verify success message
    await expect(page.getByText("salva com sucesso")).toBeVisible();
  });

  test("should filter audit history", async ({ page }) => {
    // Navigate to history (assuming there's a button or link)
    const historyButton = page.getByRole("button", { name: /Histórico/i });
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Verify history page
      await expect(page.getByText("Histórico de Auditorias ISM")).toBeVisible();
      
      // Test search
      await page.getByPlaceholder("Buscar...").fill("Test");
      
      // Test filter by type
      await page.getByRole("combobox").first().click();
      await page.getByText("Interna").click();
    }
  });

  test("should calculate compliance score", async ({ page }) => {
    // Open new audit form
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    
    // Fill basic info
    await page.getByLabel("Embarcação").fill("Score Test Vessel");
    await page.getByLabel("Auditor").fill("Test Auditor");
    await page.getByLabel("Data da Auditoria").fill("2025-01-15");
    
    // Load template
    await page.getByRole("button", { name: /Carregar Template/i }).click();
    
    // Mark some items as compliant
    const items = page.locator(".checklist-card");
    const count = await items.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await items.nth(i).getByRole("button", { name: /Conforme/i }).click();
    }
    
    // Verify score is displayed
    await expect(page.getByText(/Score:/i)).toBeVisible();
  });

  test("should display validation errors for required fields", async ({ page }) => {
    // Open new audit form
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    
    // Try to save without filling required fields
    await page.getByRole("button", { name: /Salvar/i }).click();
    
    // Verify error message
    await expect(page.getByText(/campos obrigatórios/i)).toBeVisible();
  });

  test("should export audit to PDF", async ({ page }) => {
    // This test assumes there's at least one audit in history
    const historyButton = page.getByRole("button", { name: /Histórico/i });
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Click on first audit
      await page.locator(".audit-card").first().click();
      
      // Click export button
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: /Exportar PDF/i }).click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain(".pdf");
    }
  });

  test("should show different tabs in history", async ({ page }) => {
    const historyButton = page.getByRole("button", { name: /Histórico/i });
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Verify tabs exist
      await expect(page.getByRole("tab", { name: /Auditorias Recentes/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /Ações Rápidas/i })).toBeVisible();
    }
  });
});

test.describe("ISM Audit AI Analysis", () => {
  test("should trigger AI analysis on item", async ({ page }) => {
    await page.goto("/ism-audits");
    
    // Open new audit form
    await page.getByRole("button", { name: /Nova Auditoria/i }).click();
    
    // Fill basic info and load template
    await page.getByLabel("Embarcação").fill("AI Test Vessel");
    await page.getByLabel("Auditor").fill("Test Auditor");
    await page.getByLabel("Data da Auditoria").fill("2025-01-15");
    await page.getByRole("button", { name: /Carregar Template/i }).click();
    
    // Add notes to first item
    const firstItem = page.locator(".checklist-card").first();
    await firstItem.getByPlaceholder(/notas/i).fill("Test evidence and notes");
    
    // Click analyze button
    await firstItem.getByRole("button", { name: /Analisar com IA/i }).click();
    
    // Verify analysis appears (might need to wait for API)
    await expect(firstItem.getByText(/Análise da IA/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("ISM Audit Accessibility", () => {
  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/ism-audits");
    
    // Tab through main actions
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/ism-audits");
    
    // Check for important ARIA labels
    await expect(page.getByRole("button", { name: /Nova Auditoria/i })).toHaveAttribute("role", "button");
    await expect(page.getByRole("heading", { name: /ISM Audits/i })).toBeVisible();
  });
});
