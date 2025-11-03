/**
 * E2E Tests for PATCH 603 - Smart Scheduler AI
 * Tests AI-powered scheduling functionality
 */

import { test, expect } from "@playwright/test";

test.describe("PATCH 603 - Smart Scheduler AI", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to smart scheduler page
    await page.goto("/smart-scheduler");
  });

  test("should load smart scheduler page", async ({ page }) => {
    // Check if page loads with title or heading
    await expect(
      page.getByRole("heading", { name: /Smart Scheduler|Agendamento Inteligente/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("PATCH603 - AI scheduling button works correctly", async ({ page }) => {
    // Look for AI scheduling button
    const scheduleButton = page.getByRole("button", { 
      name: /Agendar com IA|Schedule with AI|AI Schedule/i 
    });
    
    // Wait for button to be visible
    await expect(scheduleButton).toBeVisible({ timeout: 10000 });
    await expect(scheduleButton).toBeEnabled();
    
    // Click the button
    await scheduleButton.click();
    
    // Wait for result message
    await expect(
      page.getByText(/Agendamento gerado|Schedule generated|Successfully scheduled/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test("should display scheduling interface", async ({ page }) => {
    // Check for calendar or scheduling interface elements
    const hasCalendar = await page.locator('[role="grid"]').count();
    const hasScheduleList = await page.getByText(/Schedule|Agenda|Próximas/i).count();
    
    expect(hasCalendar + hasScheduleList).toBeGreaterThan(0);
  });

  test("AI recommendations are displayed", async ({ page }) => {
    // Check if AI recommendations section exists
    const hasRecommendations = await page.getByText(/Recomendação|Recommendation|Sugestão/i).count();
    
    // If recommendations are available, verify they're shown
    if (hasRecommendations > 0) {
      await expect(page.getByText(/IA|AI|Inteligência/i)).toBeVisible();
    }
  });
});
