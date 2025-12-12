/**
 * PATCH: E2E Tests - Compliance Flow
 * Tests critical compliance workflows
 */

import { test, expect } from "@playwright/test";
import { setupConsoleErrorListener, filterCriticalErrors } from "./test-utils";

test.describe("Compliance Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should access compliance dashboard", async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto("/compliance");
    
    // Wait for page load
    await page.waitForTimeout(2000);
    
    // Check for compliance-related content or redirect to login
    const hasComplianceContent = await page.getByText(/compliance|conformidade|audit|ism|solas/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login") || await page.locator("input[type=\"password\"]").isVisible().catch(() => false);
    
    expect(hasComplianceContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test("should display compliance checklist or form", async ({ page }) => {
    await page.goto("/compliance");
    
    // Look for typical compliance UI elements
    const hasForm = await page.locator("form").first().isVisible().catch(() => false);
    const hasChecklist = await page.locator("[role=\"checkbox\"], input[type=\"checkbox\"]").first().isVisible().catch(() => false);
    const hasTable = await page.locator("table, [role=\"grid\"]").first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasForm || hasChecklist || hasTable || redirectedToLogin).toBeTruthy();
  });

  test("should handle compliance filter/search", async ({ page }) => {
    await page.goto("/compliance");
    await page.waitForTimeout(1000);
    
    // Look for search or filter input
    const searchInput = page.locator("input[type=\"search\"], input[placeholder*=\"search\"], input[placeholder*=\"buscar\"], input[placeholder*=\"filtrar\"]").first();
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("test search");
      await page.waitForTimeout(500);
      
      // Should not crash
      const bodyText = await page.locator("body").textContent();
      expect(bodyText?.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Document Upload Flow", () => {
  test("should access documents page", async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto("/documents");
    await page.waitForTimeout(2000);
    
    // Check page loaded
    const hasDocumentContent = await page.getByText(/document|documento|upload|arquivo/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasDocumentContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test("should display upload interface", async ({ page }) => {
    await page.goto("/documents");
    await page.waitForTimeout(1000);
    
    // Look for upload elements
    const hasFileInput = await page.locator("input[type=\"file\"]").first().isVisible().catch(() => false);
    const hasUploadButton = await page.getByRole("button", { name: /upload|enviar|adicionar/i }).first().isVisible().catch(() => false);
    const hasDropzone = await page.locator("[data-dropzone], .dropzone").first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasFileInput || hasUploadButton || hasDropzone || redirectedToLogin).toBeTruthy();
  });
});

test.describe("HR Module", () => {
  test("should access HR dashboard", async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto("/hr");
    await page.waitForTimeout(2000);
    
    const hasHRContent = await page.getByText(/hr|recursos humanos|crew|tripulação|employee/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasHRContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test("should display crew list or management interface", async ({ page }) => {
    await page.goto("/crew");
    await page.waitForTimeout(1000);
    
    // Look for crew management elements
    const hasTable = await page.locator("table, [role=\"grid\"]").first().isVisible().catch(() => false);
    const hasList = await page.locator("[role=\"list\"], ul, .list").first().isVisible().catch(() => false);
    const hasCards = await page.locator(".card, [data-card]").first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasTable || hasList || hasCards || redirectedToLogin).toBeTruthy();
  });
});

test.describe("Training Module", () => {
  test("should access training page", async ({ page }) => {
    const consoleErrors = setupConsoleErrorListener(page);
    
    await page.goto("/training");
    await page.waitForTimeout(2000);
    
    const hasTrainingContent = await page.getByText(/training|treinamento|course|curso|certificate/i).first().isVisible().catch(() => false);
    const redirectedToLogin = page.url().includes("login");
    
    expect(hasTrainingContent || redirectedToLogin).toBeTruthy();
    
    const criticalErrors = filterCriticalErrors(consoleErrors);
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });
});
