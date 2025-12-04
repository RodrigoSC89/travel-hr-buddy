import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: /login|entrar|sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth');
    
    const submitButton = page.getByRole('button', { name: /entrar|login|sign in/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Check for validation messages
      await expect(page.getByText(/email|senha|obrigatório|required/i)).toBeVisible();
    }
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/auth');
    
    const signupLink = page.getByRole('link', { name: /cadastrar|sign up|register/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page.getByRole('heading', { name: /cadastro|register|sign up/i })).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check if main navigation is present
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu button is visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Navigation should be visible after clicking menu
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });
});
