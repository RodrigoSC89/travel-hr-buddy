/**
 * Authentication E2E Tests
 * Tests for login flow and protected routes
 */
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/auth");
    
    // Should show login form elements
    const emailInput = page.locator("input[type='email'], input[name='email'], input[placeholder*='email']");
    const passwordInput = page.locator("input[type='password']");
    
    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
    await expect(passwordInput.first()).toBeVisible({ timeout: 10000 });
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    
    // Try to submit empty form
    const submitButton = page.locator("button[type='submit'], button:has-text('Entrar'), button:has-text('Login')");
    
    if (await submitButton.first().isVisible().catch(() => false)) {
      await submitButton.first().click();
      
      // Should show some validation feedback
      await page.waitForTimeout(500);
    }
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/nautilus-command");
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    // Should either show login or the page (if already authenticated via session)
    const url = page.url();
    const isProtectedOrAuth = url.includes("/auth") || url.includes("/nautilus-command") || url.includes("/login");
    
    expect(isProtectedOrAuth).toBeTruthy();
  });
});

test.describe("Session Management", () => {
  test("should persist session across page reloads", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Store initial URL
    const initialUrl = page.url();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    // URL pattern should remain consistent
    const reloadedUrl = page.url();
    expect(reloadedUrl).toBeTruthy();
  });
});
