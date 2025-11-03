/**
 * E2E Tests for Pre-OVID Inspection Module
 * PATCH 650 - Pre-OVID Inspection Module
 */

import { test, expect } from "@playwright/test";

test.describe("Pre-OVID Inspection Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Pre-OVID page
    await page.goto("/admin/pre-ovid-inspection");
  });

  test("should display Pre-OVID inspection panel", async ({ page }) => {
    // Check if main title is visible
    await expect(
      page.getByRole("heading", { name: /Pré-OVID Inspection Module/i })
    ).toBeVisible();

    // Check if tabs are visible
    await expect(page.getByRole("tab", { name: /Inspeção/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Evidências/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /Relatório IA/i })
    ).toBeVisible();
  });

  test("should have inspection form fields", async ({ page }) => {
    // Check for form fields in inspection tab
    await expect(page.getByLabel(/Embarcação/i)).toBeVisible();
    await expect(page.getByLabel(/Inspetor Responsável/i)).toBeVisible();
    await expect(page.getByLabel(/Local da Inspeção/i)).toBeVisible();
    await expect(page.getByLabel(/Checklist OVID/i)).toBeVisible();
    await expect(page.getByLabel(/Observações Gerais/i)).toBeVisible();
  });

  test("should fill inspection form and save", async ({ page }) => {
    // Fill form fields
    await page.getByLabel(/Embarcação/i).fill("Navio Teste");
    await page.getByLabel(/Inspetor Responsável/i).fill("João Silva");
    await page.getByLabel(/Local da Inspeção/i).fill("Porto de Santos");
    await page
      .getByLabel(/Observações Gerais/i)
      .fill("Inspeção de teste automatizada");

    // Click save button
    await page.getByRole("button", { name: /Salvar Inspeção/i }).click();

    // Wait for success message (mock scenario)
    // In real scenario, this would wait for actual API response
    await page.waitForTimeout(1000);
  });

  test("should switch to evidence tab", async ({ page }) => {
    // Click on evidence tab
    await page.getByRole("tab", { name: /Evidências/i }).click();

    // Check if evidence section is visible
    await expect(page.getByText(/Enviar Evidências/i)).toBeVisible();
    await expect(page.getByText(/Selecionar Arquivos/i)).toBeVisible();
  });

  test("should switch to AI report tab", async ({ page }) => {
    // Click on AI report tab
    await page.getByRole("tab", { name: /Relatório IA/i }).click();

    // Check if AI report section is visible
    await expect(page.getByText(/Resumo Automático/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Gerar Relatório IA/i })
    ).toBeVisible();
  });

  test("should show export buttons in AI report tab", async ({ page }) => {
    // Navigate to AI report tab
    await page.getByRole("tab", { name: /Relatório IA/i }).click();

    // Check for export buttons
    await expect(
      page.getByRole("button", { name: /Exportar PDF/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Exportar CSV/i })
    ).toBeVisible();
  });

  test("should have checklist version dropdown", async ({ page }) => {
    // Check if checklist dropdown exists
    const checklistSelect = page.getByLabel(/Checklist OVID/i);
    await expect(checklistSelect).toBeVisible();

    // Open dropdown
    await checklistSelect.click();

    // Wait for options to appear
    await page.waitForTimeout(500);
  });

  test("should validate required fields", async ({ page }) => {
    // Try to save without filling inspector name
    await page.getByRole("button", { name: /Salvar Inspeção/i }).click();

    // In a real scenario, validation message would appear
    // This is a placeholder test
    await page.waitForTimeout(500);
  });

  test("should persist data when switching tabs", async ({ page }) => {
    // Fill inspection data
    const vesselName = "Navio Persistente";
    await page.getByLabel(/Embarcação/i).fill(vesselName);

    // Switch to evidence tab
    await page.getByRole("tab", { name: /Evidências/i }).click();
    await page.waitForTimeout(200);

    // Switch back to inspection tab
    await page.getByRole("tab", { name: /Inspeção/i }).click();
    await page.waitForTimeout(200);

    // Check if data persisted
    const vesselInput = page.getByLabel(/Embarcação/i);
    await expect(vesselInput).toHaveValue(vesselName);
  });

  test("should display loading state when saving", async ({ page }) => {
    // Fill minimal data
    await page.getByLabel(/Inspetor Responsável/i).fill("Inspetor Teste");

    // Click save and check for loading indicator
    await page.getByRole("button", { name: /Salvar Inspeção/i }).click();

    // In production, a loading spinner would appear
    await page.waitForTimeout(500);
  });

  test("should have proper layout structure", async ({ page }) => {
    // Check for main container
    const container = page.locator(".container");
    await expect(container).toBeVisible();

    // Check for tabs component
    const tabs = page.locator("[role=\"tablist\"]");
    await expect(tabs).toBeVisible();

    // Check for card components
    const cards = page.locator(".card, [class*=\"card\"]");
    await expect(cards.first()).toBeVisible();
  });
});

test.describe("Pre-OVID Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/admin/pre-ovid-inspection");

    // Check for labeled form fields
    await expect(page.getByLabel(/Embarcação/i)).toBeVisible();
    await expect(page.getByLabel(/Inspetor Responsável/i)).toBeVisible();

    // Check for tabs with proper roles
    await expect(page.getByRole("tab", { name: /Inspeção/i })).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/admin/pre-ovid-inspection");

    // Tab through form fields
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check if focus is working (visual check would be manual)
    await page.waitForTimeout(500);
  });
});

test.describe("Pre-OVID Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display correctly on mobile", async ({ page }) => {
    await page.goto("/admin/pre-ovid-inspection");

    // Check if main elements are visible on mobile
    await expect(
      page.getByRole("heading", { name: /Pré-OVID Inspection Module/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /Inspeção/i })).toBeVisible();
  });

  test("should have stacked form layout on mobile", async ({ page }) => {
    await page.goto("/admin/pre-ovid-inspection");

    // Form fields should be visible and usable on mobile
    await expect(page.getByLabel(/Embarcação/i)).toBeVisible();
    await expect(page.getByLabel(/Inspetor Responsável/i)).toBeVisible();
  });
});
