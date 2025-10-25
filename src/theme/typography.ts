/**
 * Design System - Typography Tokens
 * Accessible font sizes using rem units
 * Follows WCAG 2.1 guidelines for readability
 */

/**
 * Font families
 */
export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
} as const;

/**
 * Font sizes (rem-based for accessibility)
 * Base size: 16px (1rem)
 */
export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
} as const;

/**
 * Font weights
 */
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * Line heights
 */
export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Predefined text styles for common use cases
 */
export const textStyles = {
  h1: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.heading,
  },
  h2: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    fontFamily: fontFamily.heading,
  },
  h3: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.heading,
  },
  h4: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
    fontFamily: fontFamily.heading,
  },
  h5: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.heading,
  },
  h6: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.heading,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
    fontFamily: fontFamily.sans,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.sans,
  },
  code: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    fontFamily: fontFamily.mono,
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type TextStyles = typeof textStyles;
