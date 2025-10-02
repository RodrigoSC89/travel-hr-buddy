/**
 * WCAG AAA Accessibility Utilities
 * Tools for ensuring WCAG AAA compliance
 */

/**
 * Calculate relative luminance of a color
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio like 7.2:1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    console.error('Invalid color format. Use hex colors like #FFFFFF');
    return 0;
  }
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get WCAG compliance level for a color combination
 */
export function getWCAGLevel(foreground: string, background: string, largeText = false): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
  level: 'AAA' | 'AA' | 'Fail';
} {
  const ratio = getContrastRatio(foreground, background);
  const AA = meetsWCAG_AA(foreground, background, largeText);
  const AAA = meetsWCAG_AAA(foreground, background, largeText);
  
  let level: 'AAA' | 'AA' | 'Fail';
  if (AAA) {
    level = 'AAA';
  } else if (AA) {
    level = 'AA';
  } else {
    level = 'Fail';
  }
  
  return { ratio, AA, AAA, level };
}

/**
 * Screen reader announcement helper
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.createLiveRegion();
    }
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    
    // Clear and set new message
    this.liveRegion.textContent = '';
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 100);
  }

  /**
   * Clear announcements
   */
  public clear(): void {
    if (this.liveRegion) {
      this.liveRegion.textContent = '';
    }
  }
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement | null = null;
  private previouslyFocused: HTMLElement | null = null;

  /**
   * Activate focus trap on element
   */
  public activate(element: HTMLElement): void {
    this.element = element;
    this.previouslyFocused = document.activeElement as HTMLElement;
    
    // Focus first focusable element
    const focusable = element.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
    
    // Setup listeners
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Deactivate focus trap
   */
  public deactivate(): void {
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Restore focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
    
    this.element = null;
    this.previouslyFocused = null;
  }

  /**
   * Handle keydown events
   */
  private handleKeydown = (e: KeyboardEvent): void => {
    if (!this.element || e.key !== 'Tab') return;

    const focusableElements = Array.from(
      this.element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };
}

// Export singleton instance
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();
