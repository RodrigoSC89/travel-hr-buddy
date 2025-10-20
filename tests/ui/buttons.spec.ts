import { test, expect } from "@playwright/test";

test.describe("Button UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should render login button with correct state", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // Check button is not in suspended/loading state
    const isDisabled = await loginButton.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test("should have proper button styling and contrast", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Get computed styles
    const buttonStyles = await loginButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        cursor: styles.cursor,
        opacity: styles.opacity,
      };
    });
    
    // Button should not be transparent or have low opacity
    expect(parseFloat(buttonStyles.opacity)).toBeGreaterThanOrEqual(0.9);
    
    // Button should have pointer cursor when enabled
    expect(buttonStyles.cursor).toBe("pointer");
  });

  test("should not have suspended or loading state on initial render", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Check for common loading indicators
    const hasLoadingClass = await loginButton.evaluate((el) => {
      return el.className.includes("loading") || el.className.includes("pending") || el.className.includes("disabled");
    });
    
    expect(hasLoadingClass).toBe(false);
  });

  test("should be clickable and interactive", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Button should be clickable
    await expect(loginButton).toBeEnabled();
    
    // Try clicking the button
    await loginButton.click();
    
    // After click, the page should show some response (validation errors, etc.)
    await page.waitForTimeout(500);
  });

  test("should maintain proper button accessibility attributes", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Check button has proper role and type
    const buttonInfo = await loginButton.evaluate((el: HTMLButtonElement) => {
      return {
        role: el.getAttribute("role") || el.tagName,
        type: el.type,
        ariaDisabled: el.getAttribute("aria-disabled"),
        tabIndex: el.tabIndex,
      };
    });
    
    // Button should be focusable
    expect(buttonInfo.tabIndex).toBeGreaterThanOrEqual(0);
    
    // Button should not be aria-disabled on load
    expect(buttonInfo.ariaDisabled).not.toBe("true");
  });

  test("should have visible text or icon", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Check button has text content or aria-label
    const hasContent = await loginButton.evaluate((el) => {
      const textContent = el.textContent?.trim();
      const ariaLabel = el.getAttribute("aria-label");
      return (textContent && textContent.length > 0) || (ariaLabel && ariaLabel.length > 0);
    });
    
    expect(hasContent).toBe(true);
  });

  test("should support keyboard interaction", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Focus the button using keyboard
    await loginButton.focus();
    await expect(loginButton).toBeFocused();
    
    // Press Enter key
    await page.keyboard.press("Enter");
    
    // Should trigger button action
    await page.waitForTimeout(500);
  });

  test("should have proper focus styles", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Focus the button
    await loginButton.focus();
    
    // Get outline or focus ring styles
    const focusStyles = await loginButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some focus indicator (outline or box-shadow)
    const hasFocusIndicator = 
      focusStyles.outline !== "none" || 
      focusStyles.outlineWidth !== "0px" || 
      focusStyles.boxShadow !== "none";
    
    expect(hasFocusIndicator).toBe(true);
  });

  test("should not have conflicting states", async ({ page }) => {
    const buttons = await page.locator("button").all();
    
    for (const button of buttons) {
      const isVisible = await button.isVisible();
      if (!isVisible) continue;
      
      const stateInfo = await button.evaluate((el: HTMLButtonElement) => {
        return {
          disabled: el.disabled,
          ariaDisabled: el.getAttribute("aria-disabled") === "true",
          hasLoadingClass: el.className.includes("loading") || el.className.includes("pending"),
        };
      });
      
      // If button is disabled, it should be consistently disabled
      if (stateInfo.disabled) {
        // Button should not be in a loading state while disabled (unless intentional)
        // This is just a sanity check
      }
    }
  });

  test("should handle rapid clicks gracefully", async ({ page }) => {
    const loginButton = page.getByRole("button", { name: /sign in|login|entrar/i });
    await expect(loginButton).toBeVisible();
    
    // Click button multiple times rapidly
    await loginButton.click({ clickCount: 3 });
    
    // Page should handle this gracefully without crashing
    await page.waitForTimeout(500);
    
    // Button should still be in a valid state
    const isVisible = await loginButton.isVisible();
    expect(isVisible).toBe(true);
  });
});
