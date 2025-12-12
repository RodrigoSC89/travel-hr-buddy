/**
 * Dashboard Page Object Model - FASE 3
 * Representa a página principal do dashboard
 */

import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly mainNav: Locator;
  readonly userMenu: Locator;
  readonly searchInput: Locator;
  readonly notificationBell: Locator;
  readonly widgets: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainNav = page.locator("nav").first();
    this.userMenu = page.locator("[data-testid=\"user-menu\"], button[aria-label=\"User menu\"]").first();
    this.searchInput = page.locator("input[type=\"search\"], input[placeholder*=\"Buscar\"i], input[placeholder*=\"Search\"i]").first();
    this.notificationBell = page.locator("[data-testid=\"notifications\"], button[aria-label*=\"Notifica\"], button[aria-label*=\"Notification\"]").first();
    this.widgets = page.locator(".widget, [data-testid=\"widget\"], [class*=\"widget\"]");
  }

  async goto() {
    await this.page.goto("/dashboard");
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToModule(moduleName: string) {
    const moduleLink = this.page.locator(`nav >> a:has-text("${moduleName}"), nav >> button:has-text("${moduleName}")`).first();
    await moduleLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }

  async openUserMenu() {
    await this.userMenu.click();
    await this.page.waitForTimeout(500);
  }

  async openNotifications() {
    await this.notificationBell.click();
    await this.page.waitForTimeout(500);
  }

  async getWidgetCount(): Promise<number> {
    return await this.widgets.count();
  }
}
