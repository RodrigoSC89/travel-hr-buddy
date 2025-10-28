/**
 * PATCH 202.0 - Mobile UI Kit (Mobile First)
 * 
 * Comprehensive mobile-first responsive design system with breakpoints,
 * typography, spacing, and utility functions for mobile optimization.
 */

// Breakpoints following mobile-first approach
export const breakpoints = {
  xs: "320px",    // Extra small devices (phones in portrait)
  sm: "640px",    // Small devices (phones in landscape)
  md: "768px",    // Medium devices (tablets)
  lg: "1024px",   // Large devices (desktops)
  xl: "1280px",   // Extra large devices (large desktops)
  "2xl": "1536px" // 2X large devices (very large screens)
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
  
  // Max-width queries (for mobile-specific styles)
  maxSm: `@media (max-width: ${breakpoints.sm})`,
  maxMd: `@media (max-width: ${breakpoints.md})`,
  maxLg: `@media (max-width: ${breakpoints.lg})`,
} as const;

// Mobile-first typography scale
export const typography = {
  // Base font sizes (mobile first)
  fontSize: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "3rem",      // 48px
  },
  
  // Line heights optimized for mobile readability
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
    loose: "2",
  },
  
  // Font weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  
  // Letter spacing
  letterSpacing: {
    tight: "-0.05em",
    normal: "0",
    wide: "0.025em",
  },
} as const;

// Mobile-optimized spacing scale
export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
  
  // Mobile-specific spacing
  touchTarget: "44px",  // Minimum touch target size (Apple HIG)
  safeArea: {
    top: "env(safe-area-inset-top, 0)",
    right: "env(safe-area-inset-right, 0)",
    bottom: "env(safe-area-inset-bottom, 0)",
    left: "env(safe-area-inset-left, 0)",
  },
} as const;

// Container sizes for responsive layouts
export const containers = {
  xs: "100%",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  full: "100%",
} as const;

// Mobile-friendly z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  toast: 1090,
} as const;

// Touch-friendly component sizes
export const componentSizes = {
  button: {
    xs: { height: "32px", padding: "0.5rem 0.75rem", fontSize: typography.fontSize.xs },
    sm: { height: "36px", padding: "0.5rem 1rem", fontSize: typography.fontSize.sm },
    md: { height: "44px", padding: "0.75rem 1.5rem", fontSize: typography.fontSize.base },
    lg: { height: "52px", padding: "1rem 2rem", fontSize: typography.fontSize.lg },
  },
  input: {
    sm: { height: "36px", padding: "0.5rem 0.75rem", fontSize: typography.fontSize.sm },
    md: { height: "44px", padding: "0.75rem 1rem", fontSize: typography.fontSize.base },
    lg: { height: "52px", padding: "1rem 1.25rem", fontSize: typography.fontSize.lg },
  },
} as const;

// Animation and transitions optimized for mobile
export const transitions = {
  fast: "150ms ease-in-out",
  base: "200ms ease-in-out",
  slow: "300ms ease-in-out",
  
  // Touch feedback
  tap: "100ms ease-out",
} as const;

// Utility functions

/**
 * Get responsive value based on current breakpoint
 */
export function getResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
}): T | undefined {
  if (typeof window === "undefined") return values.md || values.sm || values.xs;
  
  const width = window.innerWidth;
  
  if (width >= parseInt(breakpoints["2xl"]) && values["2xl"]) return values["2xl"];
  if (width >= parseInt(breakpoints.xl) && values.xl) return values.xl;
  if (width >= parseInt(breakpoints.lg) && values.lg) return values.lg;
  if (width >= parseInt(breakpoints.md) && values.md) return values.md;
  if (width >= parseInt(breakpoints.sm) && values.sm) return values.sm;
  return values.xs;
}

/**
 * Check if current device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < parseInt(breakpoints.md);
}

/**
 * Check if current device is tablet
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
}

/**
 * Check if current device is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets() {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top, 0)")) || 0,
    right: parseInt(style.getPropertyValue("env(safe-area-inset-right, 0)")) || 0,
    bottom: parseInt(style.getPropertyValue("env(safe-area-inset-bottom, 0)")) || 0,
    left: parseInt(style.getPropertyValue("env(safe-area-inset-left, 0)")) || 0,
  };
}

/**
 * Clamp value for responsive design
 */
export function clampValue(min: number, preferred: number, max: number): string {
  return `clamp(${min}px, ${preferred}px, ${max}px)`;
}

/**
 * Fluid typography helper using CSS clamp
 */
export function fluidTypography(
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1280
): string {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yAxisIntersection = -minViewport * slope + minSize;
  
  return `clamp(${minSize}px, ${yAxisIntersection.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${maxSize}px)`;
}

/**
 * Responsive container with max-width
 */
export function getContainerStyles(size: keyof typeof containers = "xl") {
  return {
    width: "100%",
    maxWidth: containers[size],
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: spacing[4],
    paddingRight: spacing[4],
  };
}

/**
 * Mobile-optimized grid system
 */
export function getGridColumns(columns: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}): string {
  const cols = getResponsiveValue(columns);
  return `repeat(${cols || 1}, minmax(0, 1fr))`;
}

/**
 * Apply touch-friendly padding
 */
export function getTouchPadding(size: "sm" | "md" | "lg" = "md"): string {
  const padding = {
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
  };
  return padding[size];
}

/**
 * CSS class helpers for mobile-first design
 */
export const mobileClasses = {
  // Hide on mobile
  hideOnMobile: "hidden md:block",
  
  // Hide on desktop
  hideOnDesktop: "block md:hidden",
  
  // Stack on mobile, row on desktop
  stackOnMobile: "flex flex-col md:flex-row",
  
  // Full width on mobile, auto on desktop
  fullWidthMobile: "w-full md:w-auto",
  
  // Responsive padding
  responsivePadding: "p-4 md:p-6 lg:p-8",
  
  // Responsive text
  responsiveText: "text-sm md:text-base lg:text-lg",
  
  // Touch-friendly button
  touchButton: "min-h-[44px] min-w-[44px]",
  
  // Safe area padding
  safeAreaTop: "pt-[env(safe-area-inset-top,0)]",
  safeAreaBottom: "pb-[env(safe-area-inset-bottom,0)]",
  safeAreaLeft: "pl-[env(safe-area-inset-left,0)]",
  safeAreaRight: "pr-[env(safe-area-inset-right,0)]",
} as const;

// Export default mobile config
export const mobileConfig = {
  breakpoints,
  mediaQueries,
  typography,
  spacing,
  containers,
  zIndex,
  componentSizes,
  transitions,
  mobileClasses,
} as const;

export default mobileConfig;
