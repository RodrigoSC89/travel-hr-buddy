/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex=\"-1\"])",
    ].join(", ");

    return Array.from(container.querySelectorAll(selector));
  },

  /**
   * Trap focus within a container (for modals)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusable = this.getFocusableElements(container);
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    return () => activeElement?.focus();
  },
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance
   */
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA
   */
  meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return ratio >= (isLargeText ? 3 : 4.5);
  },

  /**
   * Check if contrast meets WCAG AAA
   */
  meetsWCAGAAA(color1: string, color2: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return ratio >= (isLargeText ? 4.5 : 7);
  },

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowNavigation(
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: { wrap?: boolean; horizontal?: boolean } = {}
  ): number {
    const { wrap = true, horizontal = false } = options;
    
    const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

    let newIndex = currentIndex;

    if (e.key === prevKey) {
      e.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrap ? items.length - 1 : 0;
      }
    } else if (e.key === nextKey) {
      e.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= items.length) {
        newIndex = wrap ? 0 : items.length - 1;
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = items.length - 1;
    }

    items[newIndex]?.focus();
    return newIndex;
  },
};

/**
 * Skip link component for keyboard navigation
 */
export function createSkipLink(targetId: string, label = "Pular para conteúdo principal"): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = `#${targetId}`;
  link.className = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-4 focus:rounded-md focus:shadow-lg";
  link.textContent = label;
  return link;
}

/**
 * Check reduced motion preference
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check high contrast preference
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia("(prefers-contrast: more)").matches;
}
