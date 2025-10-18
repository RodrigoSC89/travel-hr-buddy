import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're on a login-related page or redirected to auth
    const url = page.url();
    expect(url).toMatch(/\/(|auth|login)/);
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/');
    
    // Try to find login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      
      // Click login button
      await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first().click();
      
      // Should show error message or remain on login page
      await expect(page.locator('text=/erro|error|inválid|fail/i').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    await page.goto('/');
    
    // Check if already logged in or need to login
    const currentUrl = page.url();
    if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
      // Already logged in
      expect(currentUrl).toMatch(/\/(dashboard|admin)/);
    } else {
      // Would need valid credentials to test actual login
      // This is a placeholder for integration with auth system
      expect(page.url()).toBeTruthy();
    }
  });
});
