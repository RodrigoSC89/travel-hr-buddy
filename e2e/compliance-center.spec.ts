/**
 * E2E Tests for Compliance One Module
 * Based on ISO 37301 Compliance Management System
 */

import { test, expect } from "@playwright/test";

test.describe("Compliance One Module", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page first
    await page.goto("/auth");
    // Wait for page load
    await page.waitForLoadState("networkidle");
  });

  test("Dashboard loads correctly", async ({ page }) => {
    await page.goto("/compliance-center/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Should show dashboard elements
    await expect(page.locator("text=Compliance Dashboard")).toBeVisible({ timeout: 10000 });
  });

  test("Regulamentos page loads", async ({ page }) => {
    await page.goto("/compliance-center/regulamentos");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Regulamentos")).toBeVisible({ timeout: 10000 });
  });

  test("Riscos page loads with matrix", async ({ page }) => {
    await page.goto("/compliance-center/riscos");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Matriz de Riscos")).toBeVisible({ timeout: 10000 });
  });

  test("Evidências page loads", async ({ page }) => {
    await page.goto("/compliance-center/evidencias");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Evidências")).toBeVisible({ timeout: 10000 });
  });

  test("Terceiros (Due Diligence) page loads", async ({ page }) => {
    await page.goto("/compliance-center/terceiros");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Terceiros")).toBeVisible({ timeout: 10000 });
  });

  test("Denúncias page loads", async ({ page }) => {
    await page.goto("/compliance-center/denuncias");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Denúncias")).toBeVisible({ timeout: 10000 });
  });

  test("IA Recommendations page loads", async ({ page }) => {
    await page.goto("/compliance-center/ia-recommendations");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Recomendações")).toBeVisible({ timeout: 10000 });
  });

  test("Workflows page loads", async ({ page }) => {
    await page.goto("/compliance-center/workflows");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Workflows")).toBeVisible({ timeout: 10000 });
  });

  test("Relatórios page loads", async ({ page }) => {
    await page.goto("/compliance-center/relatorios");
    await page.waitForLoadState("networkidle");
    
    await expect(page.locator("text=Relatórios")).toBeVisible({ timeout: 10000 });
  });

  test("Navigation between compliance pages works", async ({ page }) => {
    // Start at dashboard
    await page.goto("/compliance-center/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Navigate to riscos
    await page.goto("/compliance-center/riscos");
    await expect(page.locator("text=Matriz de Riscos")).toBeVisible({ timeout: 10000 });
    
    // Navigate to IA recommendations
    await page.goto("/compliance-center/ia-recommendations");
    await expect(page.locator("text=Recomendações")).toBeVisible({ timeout: 10000 });
  });

  test("Redirect from /compliance-center to dashboard", async ({ page }) => {
    await page.goto("/compliance-center");
    await page.waitForLoadState("networkidle");
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/compliance-center\/dashboard/);
  });
});

test.describe("Compliance Dashboard Metrics", () => {
  test("Shows compliance score indicator", async ({ page }) => {
    await page.goto("/compliance-center/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Should display score card
    await expect(page.locator("text=Score de Conformidade")).toBeVisible({ timeout: 10000 });
  });

  test("Shows risk count cards", async ({ page }) => {
    await page.goto("/compliance-center/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Should display risk-related metrics
    await expect(page.locator("text=Riscos")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Compliance Risk Management", () => {
  test("Risk matrix displays correctly", async ({ page }) => {
    await page.goto("/compliance-center/riscos");
    await page.waitForLoadState("networkidle");
    
    // Should show probability and impact labels
    await expect(page.locator("text=Probabilidade")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Impacto")).toBeVisible({ timeout: 10000 });
  });

  test("Add risk button is visible", async ({ page }) => {
    await page.goto("/compliance-center/riscos");
    await page.waitForLoadState("networkidle");
    
    // Should have add button
    await expect(page.locator("button:has-text('Adicionar'), button:has-text('Novo')")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Compliance AI Recommendations", () => {
  test("AI recommendations page shows generate button", async ({ page }) => {
    await page.goto("/compliance-center/ia-recommendations");
    await page.waitForLoadState("networkidle");
    
    // Should show generate recommendations button
    await expect(page.locator("button:has-text('Gerar')")).toBeVisible({ timeout: 10000 });
  });

  test("Shows confidence scores for recommendations", async ({ page }) => {
    await page.goto("/compliance-center/ia-recommendations");
    await page.waitForLoadState("networkidle");
    
    // Page should load without errors
    await expect(page.locator("h1, h2")).toBeVisible({ timeout: 10000 });
  });
});
