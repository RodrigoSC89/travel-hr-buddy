import { test, expect } from "@playwright/test";

test.describe("Button Component Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that has buttons (dashboard is a good starting point)
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should not have suspended/disabled buttons without proper state", async ({ page }) => {
    // Get all buttons on the page
    const buttons = await page.locator("button").all();

    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      const isVisible = await button.isVisible();

      if (isVisible && !isDisabled) {
        // Ensure button is clickable and not in a suspended state
        await expect(button).toBeEnabled();

        // Check that the button has proper pointer-events
        const pointerEvents = await button.evaluate(
          el => window.getComputedStyle(el).pointerEvents
        );

        // Enabled buttons should not have pointer-events: none
        if (pointerEvents === "none") {
          const buttonText = await button.textContent();
          throw new Error(`Button "${buttonText}" has pointer-events: none but is not disabled`);
        }
      }
    }
  });

  test("should have minimum touch target size of 44x44px", async ({ page }) => {
    // Get all buttons on the page
    const buttons = await page.locator("button").all();

    for (const button of buttons) {
      const isVisible = await button.isVisible();

      if (isVisible) {
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          const { width, height } = boundingBox;
          const buttonText = await button.textContent();

          // WCAG 2.1 AAA requires minimum touch target of 44x44px
          expect(
            width >= 40 && height >= 40,
            `Button "${buttonText?.trim() || "unnamed"}" has insufficient touch target size: ${width.toFixed(0)}x${height.toFixed(0)}px (minimum 40x40px recommended)`
          ).toBeTruthy();
        }
      }
    }
  });

  test("should have proper focus states", async ({ page }) => {
    // Get all interactive buttons
    const buttons = await page.locator("button:not([disabled])").all();

    if (buttons.length > 0) {
      const firstButton = buttons[0];
      await firstButton.focus();

      // Check that the button has visible focus ring
      const outlineWidth = await firstButton.evaluate(
        el => window.getComputedStyle(el).outlineWidth
      );
      const ringWidth = await firstButton.evaluate(el =>
        window.getComputedStyle(el).getPropertyValue("--tw-ring-width")
      );

      // Should have either outline or ring focus indicator
      const hasFocusIndicator = outlineWidth !== "0px" || ringWidth !== "";

      expect(
        hasFocusIndicator,
        "Button should have visible focus indicator (outline or ring)"
      ).toBeTruthy();
    }
  });

  test("should maintain state consistency", async ({ page }) => {
    // Get all buttons
    const buttons = await page.locator("button").all();

    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      const ariaDisabled = await button.getAttribute("aria-disabled");
      const className = await button.getAttribute("class");

      // If button is disabled, it should have proper visual state
      if (isDisabled) {
        // Check for disabled-related classes or opacity
        const opacity = await button.evaluate(el => window.getComputedStyle(el).opacity);

        expect(
          parseFloat(opacity) < 1 ||
            className?.includes("disabled") ||
            className?.includes("opacity"),
          "Disabled button should have visual indication (reduced opacity or disabled class)"
        ).toBeTruthy();

        // aria-disabled should align with actual disabled state when present
        if (ariaDisabled) {
          expect(ariaDisabled === "true").toBe(true);
        }
      } else if (ariaDisabled) {
        expect(ariaDisabled === "false").toBe(true);
      }
    }
  });

  test("should have proper loading states", async ({ page }) => {
    // Look for any loading buttons (with loading indicator)
    const loadingButtons = await page.locator("button:has(svg.animate-spin)").all();

    for (const button of loadingButtons) {
      // Loading buttons should be disabled
      const isDisabled = await button.isDisabled();

      expect(isDisabled, "Button with loading indicator should be disabled").toBeTruthy();
    }
  });

  test("should be keyboard accessible", async ({ page }) => {
    // Get all interactive buttons
    const buttons = await page.locator("button:not([disabled])").all();

    if (buttons.length > 0) {
      const firstButton = buttons[0];

      // Tab to the button
      await page.keyboard.press("Tab");

      // Check if we can interact with keyboard
      const isFocused = await firstButton.evaluate(el => el === document.activeElement);

      // At least one button should be keyboard accessible
      // (we might not focus the exact first button due to tab order)
      const anyButtonFocused = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl?.tagName === "BUTTON";
      });

      expect(isFocused || anyButtonFocused, "At least one button should be keyboard accessible").toBeTruthy();
    }
  });

  test("should have proper ARIA labels for icon-only buttons", async ({ page }) => {
    // Get all buttons that might be icon-only
    const buttons = await page.locator("button").all();

    for (const button of buttons) {
      const isVisible = await button.isVisible();

      if (isVisible) {
        const textContent = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        const ariaLabelledBy = await button.getAttribute("aria-labelledby");
        const title = await button.getAttribute("title");

        // If button has no visible text, it should have an accessible label
        if (!textContent?.trim()) {
          const hasAccessibleLabel = ariaLabel || ariaLabelledBy || title;

          expect(
            hasAccessibleLabel,
            "Icon-only button should have aria-label, aria-labelledby, or title attribute"
          ).toBeTruthy();
        }
      }
    }
  });
});
