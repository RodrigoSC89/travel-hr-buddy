/**
 * Authentication Test Helpers - FASE 3
 * Funções auxiliares para autenticação em testes
 */

import { Page, expect } from "@playwright/test";
import { testUsers, authEndpoints } from "../fixtures/auth.fixtures";

/**
 * Realiza login com credenciais fornecidas
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(authEndpoints.login);
  
  // Aguardar formulário de login
  await page.waitForSelector("input[type=\"email\"], input[name=\"email\"]", { timeout: 10000 });
  
  // Preencher formulário
  await page.fill("input[type=\"email\"], input[name=\"email\"]", email);
  await page.fill("input[type=\"password\"], input[name=\"password\"]", password);
  
  // Submeter
  await page.click("button[type=\"submit\"], button:has-text(\"Entrar\"), button:has-text(\"Login\")");
  
  // Aguardar navegação ou mensagem
  await page.waitForLoadState("networkidle", { timeout: 15000 });
}

/**
 * Realiza login com usuário válido padrão
 */
export async function loginAsUser(page: Page): Promise<void> {
  await login(page, testUsers.valid.email, testUsers.valid.password);
}

/**
 * Realiza login como administrador
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, testUsers.admin.email, testUsers.admin.password);
}

/**
 * Realiza logout
 */
export async function logout(page: Page): Promise<void> {
  // Tentar encontrar botão de logout em diferentes locais
  const logoutSelectors = [
    "button:has-text(\"Sair\")",
    "button:has-text(\"Logout\")",
    "a:has-text(\"Sair\")",
    "a:has-text(\"Logout\")",
    "[data-testid=\"logout-button\"]",
    "[aria-label=\"Logout\"]"
  ];
  
  for (const selector of logoutSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
      await element.click();
      await page.waitForLoadState("networkidle");
      return;
    }
  }
  
  // Se não encontrou, tentar menu de usuário
  const userMenuSelectors = [
    "[data-testid=\"user-menu\"]",
    "button[aria-label=\"User menu\"]",
    ".user-menu",
    "[class*=\"user-avatar\"]"
  ];
  
  for (const selector of userMenuSelectors) {
    const menu = page.locator(selector).first();
    if (await menu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await menu.click();
      await page.waitForTimeout(500);
      
      // Tentar clicar em logout no menu aberto
      for (const logoutSelector of logoutSelectors) {
        const logoutBtn = page.locator(logoutSelector).first();
        if (await logoutBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await logoutBtn.click();
          await page.waitForLoadState("networkidle");
          return;
        }
      }
    }
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Verificar localStorage
  const hasToken = await page.evaluate(() => {
    return !!localStorage.getItem("auth-token") || 
           !!localStorage.getItem("access_token") || 
           !!localStorage.getItem("supabase.auth.token");
  });
  
  if (hasToken) return true;
  
  // Verificar se está em página protegida (não login)
  const currentUrl = page.url();
  const isOnLoginPage = currentUrl.includes("/auth") || currentUrl.includes("/login");
  
  return !isOnLoginPage;
}

/**
 * Configura token de autenticação diretamente no localStorage
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate((token) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("access_token", token);
  }, token);
}

/**
 * Remove token de autenticação do localStorage
 */
export async function clearAuthToken(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.clear();
  });
}

/**
 * Verifica se está na página de login
 */
export async function expectLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/auth|\/login/);
  await expect(page.locator("input[type=\"email\"], input[name=\"email\"]")).toBeVisible();
}

/**
 * Verifica se foi redirecionado após login
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page).not.toHaveURL(/\/auth|\/login/);
  const isAuth = await isAuthenticated(page);
  expect(isAuth).toBe(true);
}
