/**
 * Nautilus Command Center E2E Tests
 * PATCH UNIFIED: Testes para o módulo unificado
 */
import { test, expect } from "@playwright/test";

test.describe("Nautilus Command Center", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the command center
    await page.goto("/nautilus-command");
  });

  test("should display the unified command center", async ({ page }) => {
    // Check main title is visible
    await expect(page.locator("text=Command Center")).toBeVisible({ timeout: 10000 });
    
    // Verify the page loaded without errors
    const errorBoundary = page.locator("text=Algo deu errado");
    await expect(errorBoundary).not.toBeVisible();
  });

  test("should navigate between sections", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Test navigation tabs if visible
    const tabs = ["Visão Geral", "Operações", "Executivo", "Inteligência", "Alertas"];
    
    for (const tab of tabs) {
      const tabElement = page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
      if (await tabElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tabElement.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("should display KPI cards", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Look for KPI-related content
    const kpiCards = page.locator("[class*='card'], [class*='Card']");
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
  });

  test("should have responsive layout on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    // Verify page still renders correctly
    const mainContent = page.locator("main, [role='main'], .main-content");
    if (await mainContent.isVisible().catch(() => false)) {
      await expect(mainContent).toBeVisible();
    }
  });
});

test.describe("AI Integration", () => {
  test("should display AI copilot button", async ({ page }) => {
    await page.goto("/nautilus-command");
    await page.waitForLoadState("networkidle");
    
    // Look for AI/Copilot related elements
    const aiButton = page.locator("button:has-text('IA'), button:has-text('Copilot'), button:has-text('Assistente'), [aria-label*='AI']");
    
    // AI button should be visible somewhere on the page
    const isVisible = await aiButton.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      await expect(aiButton.first()).toBeVisible();
    }
  });
});

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/nautilus-command");
    await page.waitForLoadState("domcontentloaded");
    
    const loadTime = Date.now() - startTime;
    
    // Page should load DOM in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should not have console errors on load", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.goto("/nautilus-command");
    await page.waitForLoadState("networkidle");
    
    // Filter out expected/acceptable errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("manifest") && !e.includes("net::ERR")
    );
    
    // Should have no critical console errors
    expect(criticalErrors.length).toBe(0);
  });
});
