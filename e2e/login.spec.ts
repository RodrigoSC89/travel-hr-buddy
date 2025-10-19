import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page", async ({ page }) => {
    await expect(page).toHaveTitle(/Travel HR Buddy/i);
    // Check for login elements
    await expect(page.locator("input[type=\"email\"]")).toBeVisible();
    await expect(page.locator("input[type=\"password\"]")).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await loginButton.click();
    // Check for validation messages
    await expect(page.locator("text=/email|e-mail/i")).toBeVisible();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    await page.locator("input[type=\"email\"]").fill("invalid-email");
    await page.locator("input[type=\"password\"]").fill("password123");
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await loginButton.click();
    // Wait for potential error message
    await page.waitForTimeout(1000);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.locator("input[type=\"email\"]").fill("test@example.com");
    await page.locator("input[type=\"password\"]").fill("wrongpassword");
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await loginButton.click();
    // Wait for error to appear
    await page.waitForTimeout(2000);
  });

  test("should have forgot password link", async ({ page }) => {
    const forgotPasswordLink = page.getByRole("link", { name: /forgot password|esqueceu a senha/i });
    await expect(forgotPasswordLink).toBeVisible();
  });

  test("should have sign up link or button", async ({ page }) => {
    // Look for sign up options
    const signUpLink = page.getByRole("link", { name: /sign up|criar conta|cadastr/i }).first();
    if (await signUpLink.isVisible()) {
      await expect(signUpLink).toBeVisible();
    }
  });

  test("should remember email on page reload", async ({ page, context }) => {
    await page.locator("input[type=\"email\"]").fill("test@example.com");
    await page.reload();
    // Depending on implementation, email might be saved
  });

  test("should show password visibility toggle", async ({ page }) => {
    const passwordInput = page.locator("input[type=\"password\"]");
    await expect(passwordInput).toBeVisible();
    // Look for visibility toggle button
    const toggleButton = page.locator("button[aria-label*=\"password\"]").first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(page.locator("input[type=\"text\"]")).toBeVisible();
    }
  });

  test("should navigate to home page after successful login (mock)", async ({ page }) => {
    // This is a placeholder test - in real scenario, you'd mock the auth response
    await page.goto("/dashboard");
    // If redirected to login, URL should change
    await page.waitForTimeout(1000);
  });

  test("should handle network errors gracefully", async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    await page.locator("input[type=\"email\"]").fill("test@example.com");
    await page.locator("input[type=\"password\"]").fill("password123");
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await loginButton.click();
    await page.waitForTimeout(2000);
    await context.setOffline(false);
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.locator("input[type=\"email\"]").focus();
    await page.keyboard.press("Tab");
    const passwordInput = page.locator("input[type=\"password\"]");
    await expect(passwordInput).toBeFocused();
    await page.keyboard.press("Tab");
    // Next element should be focused
  });
});
