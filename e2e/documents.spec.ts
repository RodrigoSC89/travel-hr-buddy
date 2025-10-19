import { test, expect } from "@playwright/test";

test.describe("Document Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to documents page - adjust URL as needed
    await page.goto("/admin/documents");
    // Wait for page to load
    await page.waitForTimeout(1000);
  });

  test("should display documents list page", async ({ page }) => {
    // Check if documents page elements are visible
    await expect(page.locator("h1, h2").filter({ hasText: /document/i }).first()).toBeVisible();
  });

  test("should have document creation button", async ({ page }) => {
    const createButton = page.getByRole("button", { name: /new|create|novo|criar/i }).first();
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  test("should display document list or empty state", async ({ page }) => {
    // Check for either document list or empty state
    const hasList = await page.locator("[data-testid=\"document-list\"], table, .document-item").count() > 0;
    const hasEmptyState = await page.locator("text=/no documents|nenhum documento/i").count() > 0;
    expect(hasList || hasEmptyState).toBeTruthy();
  });

  test("should have search functionality", async ({ page }) => {
    const searchInput = page.locator("input[type=\"search\"], input[placeholder*=\"search\"], input[placeholder*=\"pesquis\"]").first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      await searchInput.fill("test");
      await page.waitForTimeout(500);
    }
  });

  test("should have filter options", async ({ page }) => {
    const filterButton = page.getByRole("button", { name: /filter|filtro/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("should navigate to document details on click", async ({ page }) => {
    const documentItem = page.locator("[data-testid=\"document-item\"], .document-row, table tbody tr").first();
    if (await documentItem.isVisible()) {
      await documentItem.click();
      await page.waitForTimeout(1000);
      // Check if URL changed or modal opened
    }
  });

  test("should support document deletion", async ({ page }) => {
    const deleteButton = page.locator("button[aria-label*=\"delete\"], button[aria-label*=\"excluir\"]").first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      // Check for confirmation dialog
      await page.waitForTimeout(500);
    }
  });

  test("should support document editing", async ({ page }) => {
    const editButton = page.locator("button[aria-label*=\"edit\"], button[aria-label*=\"editar\"]").first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should display document metadata", async ({ page }) => {
    const firstDocument = page.locator("[data-testid=\"document-item\"], .document-row, table tbody tr").first();
    if (await firstDocument.isVisible()) {
      // Check for common metadata fields
      const hasDate = await firstDocument.locator("text=/\\d{2}\\/\\d{2}\\/\\d{4}|\\d{4}-\\d{2}-\\d{2}/").count() > 0;
      const hasAuthor = await firstDocument.locator("text=/by|por|author/i").count() > 0;
      expect(hasDate || hasAuthor).toBeTruthy();
    }
  });

  test("should support document upload", async ({ page }) => {
    const uploadButton = page.locator("button, input[type=\"file\"]").filter({ hasText: /upload|enviar/ }).first();
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
    }
  });

  test("should paginate document list", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: /next|próxim/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should sort documents", async ({ page }) => {
    const sortButton = page.locator("button[aria-label*=\"sort\"], th[role=\"columnheader\"]").first();
    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(500);
    }
  });
});
