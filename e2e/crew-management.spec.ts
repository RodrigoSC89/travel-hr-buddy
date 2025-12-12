/**
 * E2E Tests - Crew Management Flow
 * Playwright E2E test for crew CRUD operations
 */

import { test, expect } from "@playwright/test";

test.describe("Crew Management E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/maritime-command");
    await page.waitForLoadState("networkidle");
  });

  test("deve cadastrar novo tripulante", async ({ page }) => {
    await page.click("[data-testid=\"add-crew-btn\"]");
    await page.fill("[data-testid=\"crew-name\"]", "João Silva");
    await page.fill("[data-testid=\"crew-rank\"]", "Capitão");
    await page.fill("[data-testid=\"crew-nationality\"]", "Brasileiro");
    await page.click("[data-testid=\"submit-btn\"]");
    await expect(page.locator("text=João Silva")).toBeVisible();
  });

  test("deve editar tripulante existente", async ({ page }) => {
    await page.click("[data-testid=\"edit-crew-btn\"]");
    await page.fill("[data-testid=\"crew-rank\"]", "Imediato");
    await page.click("[data-testid=\"submit-btn\"]");
    await expect(page.locator("text=Imediato")).toBeVisible();
  });
});
