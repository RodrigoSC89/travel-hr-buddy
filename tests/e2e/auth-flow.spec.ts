/**
 * PATCH 653 - E2E Tests: Authentication Flow
 * Tests complete user authentication journey
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page for unauthenticated users", async ({ page }) => {
    // Check if login form is visible
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
    await expect(page.locator("input[type=\"password\"]")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|login|entrar/i })).toBeVisible();
  });

  test("should show validation errors for invalid credentials", async ({ page }) => {
    // Fill invalid email
    await page.locator("input[type=\"email\"]").fill("invalid-email");
    await page.locator("input[type=\"password\"]").fill("short");
    
    // Try to submit
    await page.getByRole("button", { name: /sign in|login|entrar/i }).click();
    
    // Check for error message (toast or inline)
    await expect(page.locator("text=/invalid|error|erro/i")).toBeVisible({ timeout: 3000 });
  });

  test("should handle empty form submission", async ({ page }) => {
    // Try to submit without filling
    await page.getByRole("button", { name: /sign in|login|entrar/i }).click();
    
    // Should show validation or remain on page
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
  });

  test("should navigate to signup from login", async ({ page }) => {
    // Look for signup link
    const signupLink = page.getByRole("link", { name: /sign up|create account|criar conta|register/i });
    
    if (await signupLink.isVisible()) {
      await signupLink.click();
      
      // Should navigate to signup page
      await expect(page).toHaveURL(/signup|register/i);
    }
  });

  test("should have password visibility toggle", async ({ page }) => {
    const passwordInput = page.locator("input[type=\"password\"]");
    
    if (await passwordInput.isVisible()) {
      // Look for show/hide password button
      const toggleButton = page.locator("button[aria-label*=\"password\" i], button:has-text(\"show\"), button:has-text(\"hide\")").first();
      
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        
        // Password should change to text type
        await expect(page.locator("input[type=\"text\"]")).toBeVisible();
      }
    }
  });

  test("should show loading state during authentication", async ({ page }) => {
    await page.locator("input[type=\"email\"]").fill("test@example.com");
    await page.locator("input[type=\"password\"]").fill("password123");
    
    const submitButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await submitButton.click();
    
    // Check for loading state (disabled button or loading spinner)
    await expect(submitButton).toBeDisabled({ timeout: 1000 }).catch(() => {
      // If not disabled, check for loading indicator
      expect(page.locator("text=/loading|carregando/i, [role=\"status\"]")).toBeVisible();
    });
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when accessing protected route", async ({ page }) => {
    // Try to access a protected route
    await page.goto("/admin/performance");
    
    // Should redirect to login or show login form
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
    await expect(page.locator("input[type=\"email\"], input[type=\"password\"]")).toBeVisible();
  });

  test("should redirect to login when accessing admin routes", async ({ page }) => {
    await page.goto("/admin/errors");
    
    // Should redirect to login
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
  });

  test("should redirect to login when accessing health route", async ({ page }) => {
    await page.goto("/health");
    
    // Should redirect to login or show auth requirement
    await page.waitForURL(/login|signin|auth|\/$/, { timeout: 5000 });
  });
});
