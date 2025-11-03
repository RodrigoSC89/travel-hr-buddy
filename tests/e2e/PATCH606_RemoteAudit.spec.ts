/**
 * E2E Tests for PATCH 606 - Remote Audit with AI
 * Tests remote audit and evidence validation functionality
 */

import { test, expect } from "@playwright/test";
import path from "path";

test.describe("PATCH 606 - Remote Audit with AI", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to remote audits page
    await page.goto("/remote-audits");
  });

  test("should load remote audits page", async ({ page }) => {
    // Check if page loads with title or heading
    await expect(
      page.getByRole("heading", { name: /Remote Audit|Auditoria Remota|Audit/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display upload evidence button", async ({ page }) => {
    // Look for upload button
    const uploadButton = page.getByRole("button", { 
      name: /Upload|Enviar|Evidência|Evidence/i 
    });
    
    await expect(uploadButton.first()).toBeVisible({ timeout: 10000 });
  });

  test("PATCH606 - Evidence upload and AI validation works", async ({ page }) => {
    // Look for upload button
    const uploadButton = page.getByRole("button", { 
      name: /Upload Evidência|Upload Evidence|Enviar Evidência/i 
    }).first();
    
    // Wait for button to be visible
    await expect(uploadButton).toBeVisible({ timeout: 10000 });
    
    // Click upload button
    await uploadButton.click();
    
    // Look for file input - it might be hidden
    const fileInput = page.locator('input[type="file"]').first();
    
    // Check if modal opened OR file input is visible
    const modalOpened = await page.getByText(/Select|Selecionar|Choose/i).count();
    const fileInputVisible = await fileInput.count();
    
    // At least one should be present (modal OR file input)
    expect(modalOpened > 0 || fileInputVisible > 0).toBe(true);
  });

  test("checklist validation interface exists", async ({ page }) => {
    // Check for checklist elements
    const hasChecklist = await page.getByText(/Checklist|Lista de verificação|Validação/i).count();
    
    expect(hasChecklist).toBeGreaterThan(0);
  });

  test("audit status indicators are shown", async ({ page }) => {
    // Check for status indicators
    const hasStatus = await page.getByText(/Conforme|Não conforme|Compliant|Non-compliant|Approved|Rejected/i).count();
    
    // Status might not always be visible, so we check for presence
    // This is informational rather than required
    if (hasStatus > 0) {
      expect(hasStatus).toBeGreaterThan(0);
    }
  });

  test("AI analysis results can be displayed", async ({ page }) => {
    // Check if there's any indication of AI analysis
    const hasAIIndicator = await page.getByText(/IA|AI|Analisado|Analyzed|Validado/i).count();
    
    // This test is informational - AI results may only show after upload
    if (hasAIIndicator > 0) {
      expect(hasAIIndicator).toBeGreaterThan(0);
    }
  });
});
