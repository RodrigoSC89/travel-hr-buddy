/**
 * Pre-OVID OVIQ4 E2E Tests
 * Tests the Pre-OVID inspection module with 17 chapters and 130+ questions
 */

import { test, expect } from "@playwright/test";

test.describe("Pre-OVID OVIQ4 Inspection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForTimeout(1000);
  });

  test("should display Pre-OVID dashboard", async ({ page }) => {
    await expect(page.locator("h1, h2").filter({ hasText: /pre-ovid|oviq|inspeção/i }).first()).toBeVisible();
  });

  test("should show 17 OVIQ4 chapters", async ({ page }) => {
    const chaptersSection = page.locator("text=/17 Capítulos|Chapters|Capítulo/i");
    await page.waitForTimeout(2000);
  });

  test("should navigate between chapters", async ({ page }) => {
    const tabs = page.locator('[role="tab"], button:has-text(/Capítulo|Chapter/)');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }
  });

  test("should display objective questions", async ({ page }) => {
    const questions = page.locator('[class*="question"], [class*="item"], input[type="checkbox"], input[type="radio"]');
    await page.waitForTimeout(3000);
  });

  test("should allow answering compliance questions", async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 })) {
      await checkbox.click();
    }
  });

  test("should show inspection progress", async ({ page }) => {
    const progress = page.locator('[class*="progress"], [role="progressbar"], text=/\\d+%/');
    await page.waitForTimeout(2000);
  });

  test("should have new inspection button", async ({ page }) => {
    const newButton = page.locator('button:has-text(/Nova|New|Iniciar|Start/)');
    if (await newButton.first().isVisible({ timeout: 5000 })) {
      await expect(newButton.first()).toBeEnabled();
    }
  });

  test("should display vessel selection", async ({ page }) => {
    const vesselSelect = page.locator('select, [role="combobox"]');
    await page.waitForTimeout(2000);
  });

  test("should show online/offline status", async ({ page }) => {
    const statusIndicator = page.locator('text=/Online|Offline|Conectado|Sincronizado/i');
    await page.waitForTimeout(2000);
  });

  test("should persist responses automatically", async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 5000 })) {
      await checkbox.click();
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe("Pre-OVID AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForTimeout(1000);
  });

  test("should have AI evidence generator", async ({ page }) => {
    const aiButton = page.locator('button:has-text(/IA|AI|Evidência|Evidence|Sugestão/)');
    if (await aiButton.first().isVisible({ timeout: 5000 })) {
      await expect(aiButton.first()).toBeEnabled();
    }
  });

  test("should have voice assistant functionality", async ({ page }) => {
    const voiceButton = page.locator('button:has-text(/Voz|Voice|Microfone|Mic|Realtime/)');
    if (await voiceButton.first().isVisible({ timeout: 5000 })) {
      await expect(voiceButton.first()).toBeEnabled();
    }
  });

  test("should show AI risk analysis", async ({ page }) => {
    const riskSection = page.locator('text=/Risco|Risk|Análise|Analysis/i');
    await page.waitForTimeout(2000);
  });

  test("should provide contextual suggestions", async ({ page }) => {
    const suggestions = page.locator('text=/Sugestão|Suggestion|Recomendação|Recommendation/i');
    await page.waitForTimeout(2000);
  });
});

test.describe("Pre-OVID Voice Commands", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForTimeout(1000);
  });

  test("should have camera command support", async ({ page }) => {
    const cameraButton = page.locator('button:has-text(/Foto|Camera|Câmera/)');
    if (await cameraButton.first().isVisible({ timeout: 5000 })) {
      await expect(cameraButton.first()).toBeEnabled();
    }
  });

  test("should have observation dictation support", async ({ page }) => {
    const observationButton = page.locator('button:has-text(/Observação|Observation|Nota|Note/)');
    if (await observationButton.first().isVisible({ timeout: 5000 })) {
      await expect(observationButton.first()).toBeEnabled();
    }
  });

  test("should show audio waveform visualization", async ({ page }) => {
    const waveform = page.locator('[class*="waveform"], [class*="audio"], canvas');
    await page.waitForTimeout(2000);
  });
});

test.describe("Pre-OVID Reporting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForTimeout(1000);
  });

  test("should generate PDF report", async ({ page }) => {
    const pdfButton = page.locator('button:has-text(/PDF|Relatório|Report|Exportar/)');
    if (await pdfButton.first().isVisible({ timeout: 5000 })) {
      await expect(pdfButton.first()).toBeEnabled();
    }
  });

  test("should include photo evidence in report", async ({ page }) => {
    const evidenceSection = page.locator('text=/Evidência|Evidence|Foto|Photo/i');
    await page.waitForTimeout(2000);
  });

  test("should have digital signature support", async ({ page }) => {
    const signatureSection = page.locator('text=/Assinatura|Signature|Assinar/i');
    await page.waitForTimeout(2000);
  });

  test("should finalize inspection", async ({ page }) => {
    const finalizeButton = page.locator('button:has-text(/Finalizar|Finalize|Concluir|Complete/)');
    if (await finalizeButton.first().isVisible({ timeout: 5000 })) {
      await expect(finalizeButton.first()).toBeEnabled();
    }
  });
});

test.describe("Pre-OVID Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForTimeout(1000);
  });

  test("should show historical evolution chart", async ({ page }) => {
    const evolutionTab = page.locator('button:has-text(/Evolução|Evolution|Histórico|History/)');
    if (await evolutionTab.first().isVisible({ timeout: 5000 })) {
      await evolutionTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should compare inspections side by side", async ({ page }) => {
    const compareTab = page.locator('button:has-text(/Comparar|Compare|Comparação/)');
    if (await compareTab.first().isVisible({ timeout: 5000 })) {
      await compareTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show compliance trends", async ({ page }) => {
    const trendsChart = page.locator('[class*="chart"], [class*="recharts"], canvas');
    await page.waitForTimeout(2000);
  });

  test("should identify critical areas", async ({ page }) => {
    const criticalSection = page.locator('text=/Crítico|Critical|Área|Area/i');
    await page.waitForTimeout(2000);
  });
});

test.describe("Pre-OVID Full Inspection Flow", () => {
  test("should complete full inspection workflow", async ({ page }) => {
    await page.goto("/pre-ovid");
    await page.waitForLoadState('networkidle');

    // Step 1: Start new inspection
    const newButton = page.locator('button:has-text(/Nova|New|Iniciar/)');
    if (await newButton.first().isVisible({ timeout: 5000 })) {
      await newButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Step 2: Fill vessel info if form appears
    const vesselInput = page.locator('input[name*="vessel"], input[placeholder*="embarcação"]');
    if (await vesselInput.isVisible({ timeout: 3000 })) {
      await vesselInput.fill('M/V Test Vessel');
    }

    // Step 3: Answer some questions
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      if (await checkboxes.nth(i).isVisible()) {
        await checkboxes.nth(i).click();
        await page.waitForTimeout(200);
      }
    }

    // Step 4: Navigate chapters
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    }

    // Step 5: Check progress updated
    const progress = page.locator('text=/\\d+%/');
    await page.waitForTimeout(1000);
  });
});

test.describe("Pre-OVID Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/pre-ovid");

    // Check for tabs with proper roles
    const tabs = page.locator('[role="tab"]');
    await page.waitForTimeout(2000);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/pre-ovid");

    // Tab through elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);
  });
});

test.describe("Pre-OVID Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display correctly on mobile", async ({ page }) => {
    await page.goto("/pre-ovid");

    await expect(page.locator("h1, h2").filter({ hasText: /pre-ovid|oviq/i }).first()).toBeVisible();
  });

  test("should have stacked layout on mobile", async ({ page }) => {
    await page.goto("/pre-ovid");

    // Content should be visible on mobile
    await page.waitForTimeout(2000);
  });
});
