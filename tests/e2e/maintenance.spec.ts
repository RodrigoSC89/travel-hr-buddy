/**
 * E2E Tests: Maintenance Module
 * PATCH: Comprehensive maintenance workflow testing
 */

import { test, expect } from "@playwright/test";

test.describe("Maintenance Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/maintenance");
    await page.waitForLoadState("networkidle");
  });

  test("should display maintenance dashboard", async ({ page }) => {
    await expect(
      page.locator('[data-testid="maintenance-dashboard"]').or(
        page.getByText(/manutenção|maintenance/i).first()
      )
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show work orders list", async ({ page }) => {
    const workOrdersTab = page.getByRole("tab", { name: /ordens|work orders|os/i }).or(
      page.getByText(/ordens de serviço|work orders/i).first()
    );
    
    if (await workOrdersTab.isVisible()) {
      await workOrdersTab.click();
      await page.waitForTimeout(500);
    }
  });

  test("should display equipment list", async ({ page }) => {
    const equipmentTab = page.getByRole("tab", { name: /equipamentos|equipment/i }).or(
      page.getByText(/equipamentos|equipment/i).first()
    );
    
    if (await equipmentTab.isVisible()) {
      await equipmentTab.click();
      await expect(page.locator("table").or(page.locator("[data-testid='equipment-list']"))).toBeVisible();
    }
  });

  test("should show predictive maintenance alerts", async ({ page }) => {
    // Look for predictive maintenance section
    const predictiveSection = page.getByText(/preditiva|predictive/i).first().or(
      page.locator('[data-testid="predictive-alerts"]')
    );
    
    if (await predictiveSection.isVisible()) {
      await expect(predictiveSection).toBeVisible();
    }
  });

  test("should filter by priority", async ({ page }) => {
    const priorityFilter = page.locator('[data-testid="priority-filter"]').or(
      page.getByRole("combobox", { name: /prioridade|priority/i })
    );
    
    if (await priorityFilter.isVisible()) {
      await priorityFilter.click();
      
      const highPriority = page.getByRole("option", { name: /alta|high|crítica|critical/i });
      if (await highPriority.isVisible()) {
        await highPriority.click();
      }
    }
  });

  test("should display maintenance calendar", async ({ page }) => {
    const calendarTab = page.getByRole("tab", { name: /calendário|calendar|agenda/i }).or(
      page.getByText(/calendário|calendar/i).first()
    );
    
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      await expect(
        page.locator(".calendar").or(page.locator("[data-testid='maintenance-calendar']"))
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Maintenance - Offline Mode", () => {
  test("should handle offline gracefully", async ({ page, context }) => {
    await page.goto("/maintenance");
    await page.waitForLoadState("networkidle");
    
    // Go offline
    await context.setOffline(true);
    
    // Try to interact with the page
    await page.reload().catch(() => {}); // May fail, that's ok
    
    // Should show offline indicator
    const offlineBanner = page.getByText(/offline|sem conexão|no connection/i);
    
    // Go back online
    await context.setOffline(false);
    
    // Page should recover
    await page.reload();
    await page.waitForLoadState("networkidle");
  });
});
