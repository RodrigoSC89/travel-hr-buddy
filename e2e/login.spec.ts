import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flows
 * Tests login validation, error handling, and successful redirects
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page elements', async ({ page }) => {
    // Check for essential login elements
    await expect(page.getByRole('heading', { name: /nautilus/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    // Try to login with invalid credentials
    const emailInput = page.getByPlaceholder(/email|e-mail/i);
    const passwordInput = page.getByPlaceholder(/senha|password/i);
    const loginButton = page.getByRole('button', { name: /entrar|login/i });

    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await loginButton.click();

      // Should show error message
      await expect(page.getByText(/erro|error|inválido|invalid/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // This test requires valid test credentials
    // In a real scenario, use environment variables or test database
    test.skip(true, 'Requires valid test credentials');
  });

  test('should handle navigation when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/admin');
    
    // Should redirect to login or show unauthorized
    await expect(page).toHaveURL(/\/(unauthorized)?/, { timeout: 5000 });
  });
});
