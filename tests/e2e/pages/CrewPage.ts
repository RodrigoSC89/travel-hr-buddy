/**
 * Crew Management Page Object Model - FASE 3
 * Representa a página de gestão de tripulação
 */

import { Page, Locator } from '@playwright/test';

export class CrewPage {
  readonly page: Page;
  readonly addCrewButton: Locator;
  readonly nameInput: Locator;
  readonly rankSelect: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly crewList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCrewButton = page.locator('button:has-text("Adicionar"), button:has-text("Add"), button:has-text("Novo"), [data-testid="add-crew"]').first();
    this.nameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="Nome"i]').first();
    this.rankSelect = page.locator('select[name="rank"], select[id="rank"]').first();
    this.emailInput = page.locator('input[type="email"], input[name="email"]').first();
    this.saveButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Save")').first();
    this.crewList = page.locator('.crew-list, [data-testid="crew-list"], table').first();
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"i]').first();
  }

  async goto() {
    await this.page.goto('/crew-management');
    await this.page.waitForLoadState('networkidle');
  }

  async addCrewMember(name: string, rank: string, email: string) {
    await this.addCrewButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.nameInput.fill(name);
    await this.rankSelect.selectOption(rank);
    await this.emailInput.fill(email);
    
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchCrew(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async getCrewCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, .crew-item');
    return await rows.count();
  }

  async viewCrewDetails(index: number) {
    const row = this.page.locator('table tbody tr, .crew-item').nth(index);
    await row.click();
    await this.page.waitForTimeout(500);
  }
}
