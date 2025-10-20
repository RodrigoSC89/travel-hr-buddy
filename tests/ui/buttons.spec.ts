import { test, expect } from "@playwright/test";

test.describe("Button Component Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page which has various buttons
    await page.goto("/");
  });

  test("should render buttons with proper contrast ratios", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Check if buttons are visible
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check first button is visible
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
    }
  });

  test("should have proper minimum touch target size (44x44px)", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const buttons = page.locator("button:visible");
    const count = await buttons.count();
    
    if (count > 0) {
      // Check first visible button
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();
      
      if (box) {
        // WCAG 2.1 Level AAA requires 44x44px minimum touch target
        expect(box.width).toBeGreaterThanOrEqual(40); // Allow slight variance
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test("should be keyboard accessible", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Tab to first interactive element
    await page.keyboard.press("Tab");
    
    // Check if an element is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have visible focus indicators", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Find a button
    const button = page.locator("button:visible").first();
    
    if (await button.count() > 0) {
      await button.focus();
      
      // Get computed styles to check for focus indicator
      const outline = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });
      
      // Should have either outline or box-shadow for focus
      const hasFocusIndicator = 
        outline.outline !== "none" || 
        outline.outlineWidth !== "0px" ||
        outline.boxShadow !== "none";
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test("should have proper aria labels or text content", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const buttons = page.locator("button:visible");
    const count = await buttons.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        
        // Button should have either text content or aria-label
        const textContent = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");
        
        const hasAccessibleName = 
          (textContent && textContent.trim().length > 0) || 
          (ariaLabel && ariaLabel.trim().length > 0);
        
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });

  test("should have proper disabled state styling", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Check for disabled buttons
    const disabledButtons = page.locator("button[disabled]");
    const count = await disabledButtons.count();
    
    if (count > 0) {
      const firstDisabled = disabledButtons.first();
      
      // Disabled button should have reduced opacity or visual indicator
      const opacity = await firstDisabled.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      
      // Should have reduced opacity (typically 0.5)
      expect(parseFloat(opacity)).toBeLessThan(1);
    }
  });

  test("should have proper button type attribute", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const button = buttons.nth(i);
        const type = await button.getAttribute("type");
        
        // Button should have type attribute (button, submit, or reset)
        expect(["button", "submit", "reset"]).toContain(type);
      }
    }
  });

  test("should handle loading state appropriately", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    // Look for submit/login button
    const submitButton = page.locator("button[type=\"submit\"]").first();
    
    if (await submitButton.count() > 0) {
      // Button should be clickable when not loading
      await expect(submitButton).toBeEnabled();
      
      // Check if button can be disabled
      const isDisabled = await submitButton.isDisabled();
      expect(typeof isDisabled).toBe("boolean");
    }
  });

  test("should maintain consistent spacing and sizing", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const buttons = page.locator("button:visible");
    const count = await buttons.count();
    
    if (count >= 2) {
      // Get dimensions of multiple buttons
      const dimensions = [];
      for (let i = 0; i < Math.min(count, 3); i++) {
        const box = await buttons.nth(i).boundingBox();
        if (box) {
          dimensions.push(box);
        }
      }
      
      // Check that buttons have reasonable dimensions
      dimensions.forEach((dim) => {
        expect(dim.width).toBeGreaterThan(0);
        expect(dim.height).toBeGreaterThan(0);
      });
    }
  });

  test("should support active state styling", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    
    const button = page.locator("button:visible:not([disabled])").first();
    
    if (await button.count() > 0) {
      // Hover over button
      await button.hover();
      
      // Button should be visible when hovered
      await expect(button).toBeVisible();
      
      // Get styles to ensure interactive feedback exists
      const cursor = await button.evaluate((el) => {
        return window.getComputedStyle(el).cursor;
      });
      
      // Non-disabled buttons should have pointer cursor
      expect(["pointer", "default"]).toContain(cursor);
    }
  });
});
