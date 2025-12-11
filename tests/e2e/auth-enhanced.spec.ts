/**
 * Enhanced Authentication E2E Tests - FASE 3
 * Testes completos de autenticação com Page Object Model
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { testUsers, authMessages } from './fixtures/auth.fixtures';
import { 
  loginAsUser, 
  logout, 
  isAuthenticated, 
  setAuthToken, 
  clearAuthToken,
  expectLoginPage,
  expectAuthenticated 
} from './helpers/auth.helpers';

test.describe('FASE 3 - Authentication Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Limpar auth antes de cada teste
    await clearAuthToken(page);
  });

  test('AUTH-001: Deve exibir página de login corretamente', async ({ page }) => {
    await loginPage.goto();
    
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('AUTH-002: Deve fazer login com credenciais válidas', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.valid.email, testUsers.valid.password);
    
    // Verificar redirecionamento
    await expectAuthenticated(page);
    
    // Verificar que não está mais na página de login
    expect(page.url()).not.toContain('/auth');
    expect(page.url()).not.toContain('/login');
  });

  test('AUTH-003: Deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.invalid.email, testUsers.invalid.password);
    
    // Aguardar mensagem de erro
    await page.waitForTimeout(2000);
    
    // Deve continuar na página de login
    await expectLoginPage(page);
    
    // Verificar mensagem de erro (se visível)
    const hasError = await loginPage.errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasError) {
      const errorText = await loginPage.getErrorMessage();
      expect(errorText.length).toBeGreaterThan(0);
    }
  });

  test('AUTH-004: Deve validar email vazio', async ({ page }) => {
    await loginPage.goto();
    
    // Tentar submeter com email vazio
    await loginPage.passwordInput.fill(testUsers.valid.password);
    await loginPage.submitButton.click();
    await page.waitForTimeout(1000);
    
    // Deve continuar na página de login
    await expectLoginPage(page);
  });

  test('AUTH-005: Deve validar senha vazia', async ({ page }) => {
    await loginPage.goto();
    
    // Tentar submeter com senha vazia
    await loginPage.emailInput.fill(testUsers.valid.email);
    await loginPage.submitButton.click();
    await page.waitForTimeout(1000);
    
    // Deve continuar na página de login
    await expectLoginPage(page);
  });

  test('AUTH-006: Deve validar formato de email inválido', async ({ page }) => {
    await loginPage.goto();
    
    await loginPage.emailInput.fill(testUsers.invalidEmailFormat.email);
    await loginPage.passwordInput.fill(testUsers.valid.password);
    await loginPage.submitButton.click();
    await page.waitForTimeout(1000);
    
    // Deve continuar na página de login
    await expectLoginPage(page);
  });

  test('AUTH-007: Deve fazer logout com sucesso', async ({ page }) => {
    // Fazer login primeiro
    await loginAsUser(page);
    await expectAuthenticated(page);
    
    // Fazer logout
    await logout(page);
    
    // Verificar que foi desconectado
    await page.waitForTimeout(1000);
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(false);
  });

  test('AUTH-008: Deve navegar para página de cadastro', async ({ page }) => {
    await loginPage.goto();
    
    const signupVisible = await loginPage.signupLink.isVisible({ timeout: 2000 }).catch(() => false);
    if (signupVisible) {
      await loginPage.goToSignup();
      
      // Verificar que mudou de página
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/signup|register|cadastro/i);
    }
  });

  test('AUTH-009: Deve navegar para recuperação de senha', async ({ page }) => {
    await loginPage.goto();
    
    const forgotPasswordVisible = await loginPage.forgotPasswordLink.isVisible({ timeout: 2000 }).catch(() => false);
    if (forgotPasswordVisible) {
      await loginPage.goToForgotPassword();
      
      // Verificar que mudou de página
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/forgot|recupera|reset/i);
    }
  });

  test('AUTH-010: Deve persistir sessão após reload', async ({ page }) => {
    // Fazer login
    await loginAsUser(page);
    await expectAuthenticated(page);
    
    // Recarregar página
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar que ainda está autenticado
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBe(true);
  });

  test('AUTH-011: Deve redirecionar para login ao acessar página protegida sem autenticação', async ({ page }) => {
    // Tentar acessar dashboard sem estar autenticado
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Deve redirecionar para login OU mostrar mensagem de não autenticado
    const currentUrl = page.url();
    const isOnLogin = currentUrl.includes('/auth') || currentUrl.includes('/login');
    const hasUnauthorized = (await page.locator('body').textContent() || '').toLowerCase().includes('unauthorized');
    
    expect(isOnLogin || hasUnauthorized).toBe(true);
  });

  test('AUTH-012: Deve limpar sessão ao fazer logout', async ({ page }) => {
    // Fazer login
    await loginAsUser(page);
    await expectAuthenticated(page);
    
    // Fazer logout
    await logout(page);
    
    // Verificar que token foi removido
    const hasToken = await page.evaluate(() => {
      return !!localStorage.getItem('auth-token') || 
             !!localStorage.getItem('access_token') || 
             !!sessionStorage.getItem('auth-token');
    });
    
    expect(hasToken).toBe(false);
  });
});

test.describe('FASE 3 - Session Management', () => {
  test('SESSION-001: Deve manter sessão entre navegações', async ({ page }) => {
    await loginAsUser(page);
    await expectAuthenticated(page);
    
    // Navegar para diferentes páginas
    await page.goto('/dashboard');
    expect(await isAuthenticated(page)).toBe(true);
    
    await page.goto('/settings');
    expect(await isAuthenticated(page)).toBe(true);
    
    await page.goto('/');
    expect(await isAuthenticated(page)).toBe(true);
  });

  test('SESSION-002: Deve detectar sessão expirada', async ({ page }) => {
    // Configurar token expirado
    await page.goto('/');
    await setAuthToken(page, 'expired-token-12345');
    
    // Tentar acessar página protegida
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Deve redirecionar ou mostrar erro
    const currentUrl = page.url();
    const isOnLogin = currentUrl.includes('/auth') || currentUrl.includes('/login');
    const bodyText = (await page.locator('body').textContent() || '').toLowerCase();
    const hasError = bodyText.includes('expired') || bodyText.includes('unauthorized') || bodyText.includes('error');
    
    expect(isOnLogin || hasError).toBe(true);
  });
});
