/**
 * E2E Tests - Maintenance Order Creation
 */

import { test, expect } from "@playwright/test";

test.describe("Maintenance Order E2E", () => {
  test("deve criar ordem de serviço", async ({ page }) => {
    await page.goto("/maintenance-command");
    await page.click("[data-testid=\"new-job-btn\"]");
    await page.fill("[data-testid=\"job-title\"]", "Troca de óleo");
    await page.selectOption("[data-testid=\"priority-select\"]", "high");
    await page.click("[data-testid=\"save-job\"]");
    await expect(page.locator("text=Troca de óleo")).toBeVisible();
  });
});
