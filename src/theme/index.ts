/**
 * Design System - Theme Exports
 * Central export for all design tokens
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './breakpoints';

// Re-export as theme object for convenient access
import { colors } from './colors';
import { spacing, containerPadding, gridGaps } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles } from './typography';
import { breakpoints, containerMaxWidth, gridColumns } from './breakpoints';

export const theme = {
  colors,
  spacing,
  containerPadding,
  gridGaps,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  breakpoints,
  containerMaxWidth,
  gridColumns,
} as const;

export type Theme = typeof theme;
