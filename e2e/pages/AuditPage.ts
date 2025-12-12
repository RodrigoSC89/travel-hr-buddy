/**
 * ISM Audit Page Object Model - FASE 3
 * Representa a página de auditorias ISM
 */

import { Page, Locator } from "@playwright/test";

export class AuditPage {
  readonly page: Page;
  readonly startAuditButton: Locator;
  readonly auditTypeSelect: Locator;
  readonly auditDateInput: Locator;
  readonly auditorInput: Locator;
  readonly checklistItems: Locator;
  readonly saveProgressButton: Locator;
  readonly completeAuditButton: Locator;
  readonly auditsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startAuditButton = page.locator("button:has-text(\"Iniciar\"), button:has-text(\"Nova Auditoria\"), button:has-text(\"Start\"), [data-testid=\"start-audit\"]").first();
    this.auditTypeSelect = page.locator("select[name=\"type\"], select[id=\"audit-type\"]").first();
    this.auditDateInput = page.locator("input[type=\"date\"], input[name=\"date\"]").first();
    this.auditorInput = page.locator("input[name=\"auditor\"], input[id=\"auditor\"]").first();
    this.checklistItems = page.locator(".checklist-item, [data-testid=\"checklist-item\"]");
    this.saveProgressButton = page.locator("button:has-text(\"Salvar\"), button:has-text(\"Save\")").first();
    this.completeAuditButton = page.locator("button:has-text(\"Concluir\"), button:has-text(\"Complete\")").first();
    this.auditsList = page.locator(".audits-list, [data-testid=\"audits-list\"], table").first();
  }

  async goto() {
    await this.page.goto("/ism-audit");
    await this.page.waitForLoadState("networkidle");
  }

  async startNewAudit(type: string, date: string, auditor: string) {
    await this.startAuditButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.auditTypeSelect.selectOption(type);
    await this.auditDateInput.fill(date);
    await this.auditorInput.fill(auditor);
    
    await this.saveProgressButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async fillChecklistItem(index: number, status: "passed" | "failed" | "n/a", notes?: string) {
    const item = this.checklistItems.nth(index);
    
    // Selecionar status
    const statusSelect = item.locator("select, [role=\"combobox\"]").first();
    await statusSelect.selectOption(status);
    
    // Adicionar notas se fornecidas
    if (notes) {
      const notesInput = item.locator("textarea, input[type=\"text\"]").first();
      if (await notesInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await notesInput.fill(notes);
      }
    }
  }

  async saveProgress() {
    await this.saveProgressButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async completeAudit() {
    await this.completeAuditButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async getAuditsCount(): Promise<number> {
    const rows = this.page.locator("table tbody tr, .audit-item");
    return await rows.count();
  }
}
