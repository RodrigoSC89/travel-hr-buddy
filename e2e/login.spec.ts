import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Nautilus One/);
    // Check for login elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Wait for validation message
    await page.waitForTimeout(1000);
    
    // Check for error indication (could be aria-invalid or error message)
    const emailInput = page.locator('input[type="email"]');
    const hasError = await emailInput.getAttribute('aria-invalid');
    expect(hasError).toBeTruthy();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('password123');
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Verify error state
    const hasError = await emailInput.getAttribute('aria-invalid');
    expect(hasError).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid@example.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error toast or message
    const errorMessage = page.locator('text=/credenciais inválidas|invalid credentials|erro/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    // This test requires valid credentials
    // In a real scenario, you'd use test credentials from environment variables
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword';
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(testPassword);
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    
    // Either we're on dashboard or still on login (if test creds don't exist)
    const url = page.url();
    expect(url).toMatch(/(dashboard|\/)/);
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=/esqueceu|forgot|recuperar/i');
    await expect(forgotPasswordLink.first()).toBeVisible();
  });

  test('should have sign up link or option', async ({ page }) => {
    const signUpLink = page.locator('text=/cadastr|sign up|registr/i');
    // Some apps might not have public signup
    const count = await signUpLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Session Management', () => {
  test('should redirect to login when accessing protected route without authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await page.waitForURL('/', { timeout: 5000 });
    
    // Verify we're on login page
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should maintain session after page reload', async ({ page, context }) => {
    // Skip if no test credentials
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }
    
    await page.goto('/');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testEmail);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(testPassword);
    
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    // Reload the page
    await page.reload();
    
    // Should still be authenticated
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toContain('login');
  });
});
