import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("should not have any automatically detectable accessibility issues on login page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper color contrast ratios", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include("button")
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "color-contrast"
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["best-practice"])
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "heading-order"
    );

    expect(headingViolations).toHaveLength(0);
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "label"
    );

    expect(labelViolations).toHaveLength(0);
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const ariaViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id.includes("aria")
    );

    expect(ariaViolations).toHaveLength(0);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const keyboardViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "keyboard" || violation.id === "focus-order-semantics"
    );

    expect(keyboardViolations).toHaveLength(0);
  });

  test("should have proper alt text for images", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const imageAltViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "image-alt"
    );

    expect(imageAltViolations).toHaveLength(0);
  });

  test("should have proper link text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const linkTextViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === "link-name"
    );

    expect(linkTextViolations).toHaveLength(0);
  });

  test("should have proper document structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze();

    const structureViolations = accessibilityScanResults.violations.filter(
      (violation) => 
        violation.id === "page-has-heading-one" || 
        violation.id === "landmark-one-main" ||
        violation.id === "region"
    );

    expect(structureViolations).toHaveLength(0);
  });

  test("should support screen readers", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"]) // Contrast tested separately
      .analyze();

    // Check for critical violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(0);
  });
});
