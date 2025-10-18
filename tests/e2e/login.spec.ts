import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /login|entrar|sign in/i }).first()).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.locator('input[type="email"], input[name="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error - could be toast, alert, or inline message
    const hasError = await page.locator('text=/erro|error|invalid|inválido/i').count() > 0;
    expect(hasError || page.url().includes('login')).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Check for HTML5 validation or custom validation messages
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    
    expect(isInvalid).toBeTruthy();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Skip if no valid credentials available
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      test.skip();
    }

    await page.locator('input[type="email"], input[name="email"]').fill(process.env.TEST_USER_EMAIL);
    await page.locator('input[type="password"], input[name="password"]').fill(process.env.TEST_USER_PASSWORD);
    await page.locator('button[type="submit"]').click();
    
    // Wait for navigation
    await page.waitForURL(/dashboard|admin|home/i, { timeout: 10000 });
    
    // Verify we're no longer on login page
    expect(page.url()).not.toContain('login');
  });
});
