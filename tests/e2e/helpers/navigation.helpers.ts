/**
 * Navigation Test Helpers - FASE 3
 * Funções auxiliares para navegação em testes
 */

import { Page, expect } from "@playwright/test";
import { mainRoutes, moduleRoutes } from "../fixtures/navigation.fixtures";

/**
 * Navega para uma rota e aguarda carregamento
 */
export async function navigateTo(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState("networkidle", { timeout: 15000 });
}

/**
 * Clica em item de menu e aguarda navegação
 */
export async function clickMenuItem(page: Page, menuText: string): Promise<void> {
  const menuItem = page.locator(`nav >> text=${menuText}`).first();
  await menuItem.click();
  await page.waitForLoadState("networkidle");
}

/**
 * Verifica se breadcrumbs estão corretos
 */
export async function expectBreadcrumbs(page: Page, expectedCrumbs: string[]): Promise<void> {
  const breadcrumbSelectors = [
    "[data-testid=\"breadcrumb\"]",
    "nav[aria-label=\"breadcrumb\"]",
    ".breadcrumb",
    "[class*=\"breadcrumb\"]"
  ];
  
  for (const selector of breadcrumbSelectors) {
    const breadcrumb = page.locator(selector).first();
    if (await breadcrumb.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await breadcrumb.textContent();
      for (const crumb of expectedCrumbs) {
        expect(text).toContain(crumb);
      }
      return;
    }
  }
}

/**
 * Verifica se o menu principal está visível
 */
export async function expectMainMenu(page: Page): Promise<void> {
  const nav = page.locator("nav").first();
  await expect(nav).toBeVisible();
}

/**
 * Abre menu mobile (se necessário)
 */
export async function openMobileMenu(page: Page): Promise<void> {
  const menuButtonSelectors = [
    "button[aria-label=\"Menu\"]",
    "button:has-text(\"Menu\")",
    "[data-testid=\"mobile-menu-button\"]",
    ".mobile-menu-button",
    "button.hamburger"
  ];
  
  for (const selector of menuButtonSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      await page.waitForTimeout(500);
      return;
    }
  }
}

/**
 * Verifica se a página não é 404
 */
export async function expectNotFound(page: Page, shouldBeNotFound: boolean = false): Promise<void> {
  const bodyText = await page.locator("body").textContent();
  const isNotFound = bodyText?.includes("404") || bodyText?.includes("Not Found") || bodyText?.includes("Página não encontrada");
  
  if (shouldBeNotFound) {
    expect(isNotFound).toBe(true);
  } else {
    expect(isNotFound).toBe(false);
  }
}

/**
 * Aguarda e verifica se a página carregou sem erros críticos
 */
export async function expectPageLoaded(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
  
  // Verificar se não há erro de página em branco
  const bodyText = await page.locator("body").textContent();
  expect(bodyText).not.toBe("");
  
  // Verificar se não é 404
  await expectNotFound(page, false);
}

/**
 * Verifica se um elemento está visível na página
 */
export async function expectElementVisible(page: Page, selector: string): Promise<void> {
  await expect(page.locator(selector).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Aguarda navegação completar
 */
export async function waitForNavigation(page: Page, timeout: number = 10000): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout });
  await page.waitForLoadState("domcontentloaded", { timeout });
}

/**
 * Verifica se está na rota esperada
 */
export async function expectCurrentRoute(page: Page, expectedRoute: string | RegExp): Promise<void> {
  if (typeof expectedRoute === "string") {
    expect(page.url()).toContain(expectedRoute);
  } else {
    await expect(page).toHaveURL(expectedRoute);
  }
}
