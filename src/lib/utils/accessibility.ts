/**
 * Accessibility Utilities
 * WCAG 2.1 AAA compliant helper functions
 */

/**
 * Get contrast ratio between two colors
 * Returns ratio (1-21), where 21 is maximum contrast
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AAA standard (7:1)
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1)
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * High contrast color pairs for cards
 * All pairs meet WCAG AAA standards (7:1+)
 */
export const highContrastPairs = {
  green: {
    background: '#1F5133',
    foreground: '#E8FFF0',
    name: 'Verde Marítimo'
  },
  blue: {
    background: '#123B64',
    foreground: '#E2F0FF',
    name: 'Azul Oceânico'
  },
  purple: {
    background: '#3B2E56',
    foreground: '#F3EFFF',
    name: 'Roxo Profundo'
  },
  orange: {
    background: '#583215',
    foreground: '#FFF5E8',
    name: 'Laranja Náutico'
  }
};

/**
 * Generate aria-label for metrics
 */
export function generateMetricAriaLabel(
  title: string,
  value: string | number,
  change?: number,
  unit?: string
): string {
  let label = `${title}: ${value}`;
  if (unit) label += ` ${unit}`;
  if (change !== undefined) {
    const direction = change > 0 ? 'aumento' : 'diminuição';
    label += `, ${Math.abs(change)}% de ${direction}`;
  }
  return label;
}
