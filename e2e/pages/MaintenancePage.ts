/**
 * Maintenance Page Object Model - FASE 3
 * Representa a página de manutenção preventiva
 */

import { Page, Locator } from '@playwright/test';

export class MaintenancePage {
  readonly page: Page;
  readonly scheduleButton: Locator;
  readonly maintenanceTypeSelect: Locator;
  readonly equipmentSelect: Locator;
  readonly dateInput: Locator;
  readonly prioritySelect: Locator;
  readonly saveButton: Locator;
  readonly maintenanceList: Locator;
  readonly overdueList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.scheduleButton = page.locator('button:has-text("Agendar"), button:has-text("Schedule"), button:has-text("Nova"), [data-testid="schedule-maintenance"]').first();
    this.maintenanceTypeSelect = page.locator('select[name="type"], select[id="maintenance-type"]').first();
    this.equipmentSelect = page.locator('select[name="equipment"], select[id="equipment"]').first();
    this.dateInput = page.locator('input[type="date"], input[name="date"]').first();
    this.prioritySelect = page.locator('select[name="priority"], select[id="priority"]').first();
    this.saveButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Save")').first();
    this.maintenanceList = page.locator('.maintenance-list, [data-testid="maintenance-list"], table').first();
    this.overdueList = page.locator('.overdue-list, [data-testid="overdue-list"]').first();
  }

  async goto() {
    await this.page.goto('/maintenance');
    await this.page.waitForLoadState('networkidle');
  }

  async scheduleMaintenance(type: string, equipment: string, date: string, priority: string) {
    await this.scheduleButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.maintenanceTypeSelect.selectOption(type);
    await this.equipmentSelect.selectOption(equipment);
    await this.dateInput.fill(date);
    await this.prioritySelect.selectOption(priority);
    
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getMaintenanceCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, .maintenance-item');
    return await rows.count();
  }

  async getOverdueCount(): Promise<number> {
    const items = this.page.locator('.overdue-item, [data-status="overdue"]');
    return await items.count();
  }

  async viewMaintenanceHistory() {
    const historyLink = this.page.locator('a:has-text("Histórico"), a:has-text("History")').first();
    await historyLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}
