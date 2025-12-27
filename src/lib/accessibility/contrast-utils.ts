/**
 * Utilitários de Contraste - WCAG 2.1 AA/AAA
 * Funções para cálculo e validação de contraste
 */

/**
 * Converte cor hex para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calcula luminância relativa conforme WCAG 2.1
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula ratio de contraste entre duas cores
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica se o contraste atende WCAG AA (4.5:1)
 */
export function meetsWCAG_AA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Verifica se o contraste atende WCAG AAA (7:1)
 */
export function meetsWCAG_AAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Verifica se o contraste atende WCAG AA para texto grande (3:1)
 */
export function meetsWCAG_AA_LargeText(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 3;
}

/**
 * Retorna uma cor ajustada para melhor contraste
 */
export function adjustForContrast(
  color: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return color;

  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const isDarkBg = bgLuminance < 0.5;

  // Se o fundo é escuro, clarear a cor; se claro, escurecer
  let colorRgb = hexToRgb(color);
  if (!colorRgb) return color;

  let iterations = 0;
  const maxIterations = 100;

  while (getContrastRatio(color, background) < targetRatio && iterations < maxIterations) {
    if (isDarkBg) {
      colorRgb = {
        r: Math.min(255, colorRgb.r + 5),
        g: Math.min(255, colorRgb.g + 5),
        b: Math.min(255, colorRgb.b + 5),
      };
    } else {
      colorRgb = {
        r: Math.max(0, colorRgb.r - 5),
        g: Math.max(0, colorRgb.g - 5),
        b: Math.max(0, colorRgb.b - 5),
      };
    }
    color = `#${colorRgb.r.toString(16).padStart(2, '0')}${colorRgb.g.toString(16).padStart(2, '0')}${colorRgb.b.toString(16).padStart(2, '0')}`;
    iterations++;
  }

  return color;
}

/**
 * Gera relatório de contraste para cores do sistema
 */
export function generateContrastReport(colors: Record<string, string>, background: string) {
  const report: Record<string, { ratio: number; aa: boolean; aaa: boolean }> = {};

  for (const [name, color] of Object.entries(colors)) {
    const ratio = getContrastRatio(color, background);
    report[name] = {
      ratio: Math.round(ratio * 100) / 100,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    };
  }

  return report;
}

// Cores padrão do sistema para referência
export const systemColors = {
  foreground: '#0A0E1A',
  mutedForeground: '#404040',
  primary: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#3B82F6',
};

export const backgrounds = {
  light: '#FFFFFF',
  dark: '#0E1116',
};
