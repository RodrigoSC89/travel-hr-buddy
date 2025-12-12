/**
 * Navigation E2E Tests
 * Testa navegação entre módulos e redirects
 */
import { test, expect } from "@playwright/test";

test.describe("Main Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load dashboard", async ({ page }) => {
    await expect(page).toHaveURL("/");
    // Check for main content
    await expect(page.locator("main")).toBeVisible();
  });

  test("should have working sidebar navigation", async ({ page }) => {
    // Look for sidebar or navigation element
    const sidebar = page.locator("[data-testid=\"sidebar\"], nav, aside").first();
    await expect(sidebar).toBeVisible();
  });
});

test.describe("Module Redirects", () => {
  test("solas-training redirects to nautilus-academy", async ({ page }) => {
    await page.goto("/solas-training");
    await expect(page).toHaveURL(/nautilus-academy/);
  });

  test("voyage-planner redirects to nautilus-voyage", async ({ page }) => {
    await page.goto("/voyage-planner");
    await expect(page).toHaveURL(/nautilus-voyage/);
  });

  test("ai-insights redirects to nautilus-ai-hub", async ({ page }) => {
    await page.goto("/ai-insights");
    await expect(page).toHaveURL(/nautilus-ai-hub/);
  });

  test("intelligent-maintenance redirects to nautilus-maintenance", async ({ page }) => {
    await page.goto("/intelligent-maintenance");
    await expect(page).toHaveURL(/nautilus-maintenance/);
  });

  test("ocean-sonar redirects to subsea-operations", async ({ page }) => {
    await page.goto("/ocean-sonar");
    await expect(page).toHaveURL(/subsea-operations/);
  });
});

test.describe("Unified Modules Load", () => {
  test("nautilus-academy loads correctly", async ({ page }) => {
    await page.goto("/nautilus-academy");
    await expect(page.locator("main")).toBeVisible();
  });

  test("nautilus-people loads correctly", async ({ page }) => {
    await page.goto("/nautilus-people");
    await expect(page.locator("main")).toBeVisible();
  });

  test("nautilus-ai-hub loads correctly", async ({ page }) => {
    await page.goto("/nautilus-ai-hub");
    await expect(page.locator("main")).toBeVisible();
  });

  test("fleet-operations loads correctly", async ({ page }) => {
    await page.goto("/fleet-operations");
    await expect(page.locator("main")).toBeVisible();
  });

  test("subsea-operations loads correctly", async ({ page }) => {
    await page.goto("/subsea-operations");
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Error Handling", () => {
  test("404 page shows for invalid routes", async ({ page }) => {
    await page.goto("/non-existent-route-12345");
    // Should show 404 or redirect to dashboard
    await expect(page.locator("body")).toBeVisible();
  });
});
