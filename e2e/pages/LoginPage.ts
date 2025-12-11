/**
 * Login Page Object Model - FASE 3
 * Representa a página de login
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name="email"]').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    this.submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
    this.signupLink = page.locator('a:has-text("Cadastrar"), a:has-text("Sign up"), a:has-text("Register")').first();
    this.forgotPasswordLink = page.locator('a:has-text("Esqueceu"), a:has-text("Forgot"), a:has-text("Recuperar")').first();
    this.errorMessage = page.locator('.error, [role="alert"], .error-message, [class*="error"]').first();
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async goToSignup() {
    await this.signupLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
}
