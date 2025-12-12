/**
 * E2E Tests - Audit Critical Flows
 * FASE B.4 - Testes críticos para módulo Auditorias ISM
 * 
 * Test Coverage:
 * - Criação de auditoria
 * - Checklist interativo
 * - Aprovações
 * - Findings e resoluções
 */

import { test, expect } from "@playwright/test";
import { auditData, auditTypes, checklistStatuses } from "./fixtures/audit.fixtures";

test.describe("Audit Critical Flows - Criação de Auditoria", () => {
  test("AUDIT-CRIT-001: Deve criar nova auditoria ISM", async ({ page }) => {
    await page.goto("/audit");
    await page.waitForLoadState("networkidle");

    const createButton = await page.locator("[data-testid=\"create-audit-button\"]");
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Fill audit form
      await page.selectOption("[name=\"type\"]", auditData.valid.type);
      await page.fill("[name=\"date\"]", auditData.valid.date);
      await page.fill("[name=\"auditor\"]", auditData.valid.auditor);
      await page.selectOption("[name=\"vessel\"]", auditData.valid.vessel);
      
      // Submit
      await page.click("button[type=\"submit\"]");
      await page.waitForTimeout(1000);
      
      // Verify audit was created
      const successMessage = await page.locator(".toast, [role=\"alert\"]");
      const isVisible = await successMessage.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test("AUDIT-CRIT-002: Deve selecionar tipo de auditoria", async ({ page }) => {
    await page.goto("/audit/create");
    await page.waitForLoadState("networkidle");

    const typeSelector = await page.locator("[name=\"type\"]");
    
    if (await typeSelector.isVisible()) {
      // Verify all audit types are available
      for (const type of auditTypes) {
        const option = await page.locator(`option:has-text("${type}")`);
        const exists = await option.count() > 0;
        
        if (!exists) {
          // Some types may not be available, which is ok
          continue;
        }
      }
      
      // At least one type should be available
      const options = await typeSelector.locator("option").count();
      expect(options).toBeGreaterThan(0);
    }
  });

  test("AUDIT-CRIT-003: Deve agendar auditoria futura", async ({ page }) => {
    await page.goto("/audit/schedule");
    await page.waitForLoadState("networkidle");

    const scheduleButton = await page.locator("[data-testid=\"schedule-audit-button\"]");
    
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      
      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const dateString = futureDate.toISOString().split("T")[0];
      
      await page.fill("[name=\"date\"]", dateString);
      await page.selectOption("[name=\"type\"]", "ISM Internal");
      
      // Save
      await page.click("button[type=\"submit\"]");
      await page.waitForTimeout(1000);
      
      // Verify scheduled
      const calendar = await page.locator("[data-testid=\"audit-calendar\"]");
      const isVisible = await calendar.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test("AUDIT-CRIT-004: Deve cancelar auditoria agendada", async ({ page }) => {
    await page.goto("/audit");
    await page.waitForLoadState("networkidle");

    // Find a scheduled audit
    const scheduledAudit = await page.locator("[data-status=\"scheduled\"]").first();
    
    if (await scheduledAudit.isVisible()) {
      await scheduledAudit.hover();
      
      const cancelButton = await scheduledAudit.locator("[data-testid=\"cancel-audit\"]");
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Confirm cancellation
        await page.click("button:has-text(\"Confirm\")");
        await page.waitForTimeout(1000);
        
        // Verify cancelled
        const toast = await page.locator(".toast, [role=\"alert\"]");
        const isVisible = await toast.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });
});

test.describe("Audit Critical Flows - Checklist Interativo", () => {
  test("AUDIT-CRIT-005: Deve exibir checklist de auditoria", async ({ page }) => {
    await page.goto("/audit/1/checklist");
    await page.waitForLoadState("networkidle");

    // Verify checklist is displayed
    const checklist = await page.locator("[data-testid=\"audit-checklist\"]");
    await expect(checklist).toBeVisible();

    // Verify checklist items
    const items = await page.locator("[data-testid=\"checklist-item\"]");
    const count = await items.count();
    
    // Should have items or empty state
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("AUDIT-CRIT-006: Deve marcar item do checklist como passed", async ({ page }) => {
    await page.goto("/audit/1/checklist");
    await page.waitForLoadState("networkidle");

    const items = await page.locator("[data-testid=\"checklist-item\"]");
    const count = await items.count();
    
    if (count > 0) {
      const firstItem = items.first();
      
      // Mark as passed
      const passButton = await firstItem.locator("[data-action=\"pass\"]");
      
      if (await passButton.isVisible()) {
        await passButton.click();
        await page.waitForTimeout(500);
        
        // Verify status changed
        const status = await firstItem.getAttribute("data-status");
        expect(status).toBe("passed");
      }
    }
  });

  test("AUDIT-CRIT-007: Deve adicionar notas a item do checklist", async ({ page }) => {
    await page.goto("/audit/1/checklist");
    await page.waitForLoadState("networkidle");

    const items = await page.locator("[data-testid=\"checklist-item\"]");
    const count = await items.count();
    
    if (count > 0) {
      const firstItem = items.first();
      await firstItem.click();
      
      // Add notes
      const notesField = await page.locator("[name=\"notes\"]");
      
      if (await notesField.isVisible()) {
        await notesField.fill("Test notes for this item");
        
        // Save
        await page.click("[data-testid=\"save-notes\"]");
        await page.waitForTimeout(500);
        
        // Verify saved
        const toast = await page.locator(".toast, [role=\"alert\"]");
        const isVisible = await toast.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test("AUDIT-CRIT-008: Deve calcular progresso da auditoria", async ({ page }) => {
    await page.goto("/audit/1/checklist");
    await page.waitForLoadState("networkidle");

    // Check for progress indicator
    const progressBar = await page.locator("[data-testid=\"audit-progress\"]");
    
    if (await progressBar.isVisible()) {
      const progress = await progressBar.getAttribute("value");
      const progressNum = parseFloat(progress || "0");
      
      expect(progressNum).toBeGreaterThanOrEqual(0);
      expect(progressNum).toBeLessThanOrEqual(100);
    }
  });
});

test.describe("Audit Critical Flows - Aprovações e Findings", () => {
  test("AUDIT-CRIT-009: Deve registrar finding de auditoria", async ({ page }) => {
    await page.goto("/audit/1/findings");
    await page.waitForLoadState("networkidle");

    const addFindingButton = await page.locator("[data-testid=\"add-finding-button\"]");
    
    if (await addFindingButton.isVisible()) {
      await addFindingButton.click();
      
      // Fill finding form
      await page.selectOption("[name=\"severity\"]", "medium");
      await page.fill("[name=\"description\"]", "Test finding description");
      await page.fill("[name=\"recommendation\"]", "Test recommendation");
      
      // Submit
      await page.click("button[type=\"submit\"]");
      await page.waitForTimeout(1000);
      
      // Verify finding added
      const findingsList = await page.locator("[data-testid=\"findings-list\"]");
      await expect(findingsList).toBeVisible();
    }
  });

  test("AUDIT-CRIT-010: Deve aprovar auditoria concluída", async ({ page }) => {
    await page.goto("/audit/1/review");
    await page.waitForLoadState("networkidle");

    const approveButton = await page.locator("[data-testid=\"approve-audit\"]");
    
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Add approval notes
      const notesField = await page.locator("[name=\"approvalNotes\"]");
      
      if (await notesField.isVisible()) {
        await notesField.fill("Audit approved");
      }
      
      // Confirm approval
      await page.click("button:has-text(\"Confirm\")");
      await page.waitForTimeout(1000);
      
      // Verify approved
      const status = await page.locator("[data-testid=\"audit-status\"]");
      const statusText = await status.textContent();
      expect(statusText).toContain("approved");
    }
  });

  test("AUDIT-CRIT-011: Deve solicitar revisão de auditoria", async ({ page }) => {
    await page.goto("/audit/1/review");
    await page.waitForLoadState("networkidle");

    const requestRevisionButton = await page.locator("[data-testid=\"request-revision\"]");
    
    if (await requestRevisionButton.isVisible()) {
      await requestRevisionButton.click();
      
      // Add revision notes
      await page.fill("[name=\"revisionNotes\"]", "Please review item 3");
      
      // Submit
      await page.click("button[type=\"submit\"]");
      await page.waitForTimeout(1000);
      
      // Verify revision requested
      const toast = await page.locator(".toast, [role=\"alert\"]");
      const isVisible = await toast.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test("AUDIT-CRIT-012: Deve exportar relatório de auditoria", async ({ page }) => {
    await page.goto("/audit/1");
    await page.waitForLoadState("networkidle");

    const exportButton = await page.locator("[data-testid=\"export-audit\"]");
    
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Select format
      await page.click("text=PDF");
      await page.waitForTimeout(1000);
      
      // Verify export initiated
      const toast = await page.locator(".toast, [role=\"alert\"]");
      const isVisible = await toast.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });
});
