/**
 * Design System - Responsive Breakpoints
 * Mobile-first responsive design breakpoints
 */

/**
 * Breakpoint values in pixels
 */
export const breakpoints = {
  xs: '320px',   // Extra small devices (small phones)
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
} as const;

/**
 * Container max widths for each breakpoint
 */
export const containerMaxWidth = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
} as const;

/**
 * Grid columns for different breakpoints
 */
export const gridColumns = {
  xs: 4,   // 4 columns on mobile
  sm: 6,   // 6 columns on small devices
  md: 8,   // 8 columns on tablets
  lg: 12,  // 12 columns on desktop
  xl: 12,  // 12 columns on large desktop
  '2xl': 12, // 12 columns on extra large
} as const;

/**
 * Utility functions for responsive design
 */

/**
 * Generate media query string for a breakpoint
 * @param breakpoint - Breakpoint key
 * @returns Media query string
 */
export const mediaQuery = (breakpoint: keyof typeof breakpoints): string => {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
};

/**
 * Generate max-width media query string for a breakpoint
 * @param breakpoint - Breakpoint key
 * @returns Media query string
 */
export const mediaQueryMax = (breakpoint: keyof typeof breakpoints): string => {
  const value = parseInt(breakpoints[breakpoint]);
  return `@media (max-width: ${value - 1}px)`;
};

/**
 * Check if current viewport matches a breakpoint
 * @param breakpoint - Breakpoint key
 * @returns Boolean indicating if viewport matches
 */
export const matchesBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`).matches;
};

export type Breakpoint = keyof typeof breakpoints;
export type ContainerMaxWidth = typeof containerMaxWidth;
export type GridColumns = typeof gridColumns;
