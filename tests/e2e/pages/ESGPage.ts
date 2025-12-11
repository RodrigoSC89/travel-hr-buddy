/**
 * ESG Dashboard Page Object Model - FASE 3
 * Representa a página do dashboard de ESG & Emissões
 */

import { Page, Locator } from '@playwright/test';

export class ESGPage {
  readonly page: Page;
  readonly addEmissionButton: Locator;
  readonly emissionTypeSelect: Locator;
  readonly emissionValueInput: Locator;
  readonly emissionDateInput: Locator;
  readonly saveButton: Locator;
  readonly emissionsList: Locator;
  readonly eeximChart: Locator;
  readonly ciiRating: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addEmissionButton = page.locator('button:has-text("Adicionar"), button:has-text("Add"), button:has-text("Nova"), [data-testid="add-emission"]').first();
    this.emissionTypeSelect = page.locator('select[name="type"], select[id="type"], [data-testid="emission-type"]').first();
    this.emissionValueInput = page.locator('input[name="value"], input[id="value"], input[placeholder*="Valor"i]').first();
    this.emissionDateInput = page.locator('input[type="date"], input[name="date"]').first();
    this.saveButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Save")').first();
    this.emissionsList = page.locator('.emissions-list, [data-testid="emissions-list"], table').first();
    this.eeximChart = page.locator('[data-testid="eexi-chart"], .eexi-chart, [class*="eexi"]').first();
    this.ciiRating = page.locator('[data-testid="cii-rating"], .cii-rating, [class*="cii"]').first();
  }

  async goto() {
    await this.page.goto('/esg-dashboard');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async addEmission(type: string, value: number, date: string) {
    await this.addEmissionButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.emissionTypeSelect.selectOption(type);
    await this.emissionValueInput.fill(value.toString());
    await this.emissionDateInput.fill(date);
    
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getEmissionsCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, .emission-item, [data-testid="emission-item"]');
    return await rows.count();
  }

  async viewEmissionDetails(index: number) {
    const row = this.page.locator('table tbody tr, .emission-item').nth(index);
    await row.click();
    await this.page.waitForTimeout(500);
  }
}
