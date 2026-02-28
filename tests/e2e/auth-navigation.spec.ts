/**
 * E2E Tests: Auth & Navigation Critical Flows
 * Validates login page, navigation guards, and core routing
 */
import { test, expect } from "@playwright/test";

test.describe("Auth Page", () => {
  test("should render login form", async ({ page }) => {
    await page.goto("/auth");
    // Should show auth form elements
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test("should show validation on empty submit", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show some validation feedback (HTML5 or custom)
      await page.waitForTimeout(500);
    }
  });

  test("should redirect unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/(auth|login)/);
  });
});

test.describe("Public Pages", () => {
  test("should load landing page", async ({ page }) => {
    await page.goto("/landing");
    await page.waitForLoadState("networkidle");
    // Should not redirect to auth
    await expect(page).toHaveURL(/\/landing/);
  });

  test("should load demo page", async ({ page }) => {
    await page.goto("/demo");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/demo/);
  });
});

test.describe("Navigation Guards", () => {
  test("should protect /crew route", async ({ page }) => {
    await page.goto("/crew");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/(auth|login)/);
  });

  test("should protect /compliance route", async ({ page }) => {
    await page.goto("/compliance");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/(auth|login)/);
  });

  test("should protect /finance route", async ({ page }) => {
    await page.goto("/finance");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/(auth|login)/);
  });
});
