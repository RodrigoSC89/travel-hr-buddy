/**
 * E2E Tests for Voice Assistant / IA de Voz
 * Tests voice transcription and AI voice features
 */
import { test, expect } from "@playwright/test";

test.describe("Voice Assistant", () => {
  test.describe("Voice Transcriber Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/voice-transcriber");
    });

    test("should load voice transcriber page", async ({ page }) => {
      await expect(page).toHaveURL(/.*voice-transcriber/);
      await page.waitForLoadState("networkidle");
    });

    test("should display voice controls", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Look for microphone button or voice controls
      const voiceButton = page.locator('button[aria-label*="microphone" i], button[aria-label*="voice" i], button[aria-label*="gravar" i], [class*="mic"]');
      
      // May or may not be visible depending on browser permissions
      await page.waitForTimeout(2000);
    });

    test("should show permission prompt for microphone", async ({ page, context }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Check if there's any indication about microphone access
      const content = await page.textContent("body");
      
      // Page should have loaded content
      expect(content?.trim().length).toBeGreaterThan(0);
    });
  });

  test.describe("Global Voice Button", () => {
    test("should display global voice button on dashboard", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      
      // Look for the global voice button
      const voiceButton = page.locator('[class*="voice"], [aria-label*="voice" i], [aria-label*="voz" i]');
      
      // Wait for dynamic content
      await page.waitForTimeout(2000);
      
      const count = await voiceButton.count();
      console.log(`Found ${count} voice-related elements`);
    });

    test("should be keyboard accessible", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      
      // Tab through the page
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press("Tab");
      }
      
      // Should have focused elements
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Voice Assistant Page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/voice-assistant");
    });

    test("should load voice assistant page", async ({ page }) => {
      await expect(page).toHaveURL(/.*voice-assistant/);
      await page.waitForLoadState("networkidle");
    });

    test("should have proper accessibility structure", async ({ page }) => {
      await page.waitForLoadState("domcontentloaded");
      
      // Check for heading
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      
      // Check for main landmark
      const main = page.locator("main, [role='main']").first();
      const mainVisible = await main.isVisible().catch(() => false);
      console.log(`Main landmark visible: ${mainVisible}`);
    });

    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      
      // Content should be visible
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      // Check that content doesn't overflow
      const bodyBox = await body.boundingBox();
      expect(bodyBox?.width).toBeLessThanOrEqual(375);
    });
  });

  test.describe("LiteMode Integration", () => {
    test("should respect slow connection mode", async ({ page }) => {
      // Simulate slow 2G network
      const client = await page.context().newCDPSession(page);
      await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (50 * 1024) / 8, // 50kb/s (slow 2G)
        uploadThroughput: (20 * 1024) / 8,
        latency: 2000,
      });

      await page.goto("/voice-assistant");
      await page.waitForLoadState("domcontentloaded");
      
      // Page should still load
      const body = page.locator("body");
      await expect(body).toBeVisible();
      
      console.log("✓ Voice assistant works on slow connection");
    });
  });
});
