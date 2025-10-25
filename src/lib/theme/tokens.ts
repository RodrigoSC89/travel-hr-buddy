/**
 * High Contrast Theme Tokens
 * WCAG AAA compliant color system for maritime offshore use
 */

export const themeTokens = {
  // High contrast card backgrounds
  cardBackgrounds: {
    green: "#1F5133",     // WCAG AAA: 7:1+ with light text
    blue: "#123B64",      // WCAG AAA: 7:1+ with light text
    purple: "#3B2E56",    // WCAG AAA: 7:1+ with light text
    orange: "#583215"     // WCAG AAA: 7:1+ with light text
  },
  
  // High contrast card text colors
  cardText: {
    greenLight: "#E8FFF0",   // For green backgrounds
    blueLight: "#E2F0FF",    // For blue backgrounds
    purpleLight: "#F3EFFF",  // For purple backgrounds
    orangeLight: "#FFF5E8",  // For orange backgrounds
    white: "#FFFFFF",        // Pure white for maximum contrast
    subtle: "#BCC3D1"        // Subtle text for less critical info
  },
  
  // Status colors with high contrast
  status: {
    success: "#16C784",      // Bright green
    successDark: "#059669",  // Dark green for backgrounds
    warning: "#E9A63D",      // Amber/Orange
    warningDark: "#B45309",  // Dark orange for backgrounds
    danger: "#FF4D4F",       // Bright red
    dangerDark: "#DC2626",   // Dark red for backgrounds
    info: "#0EA5E9",         // Bright blue
    infoDark: "#0369A1"      // Dark blue for backgrounds
  },
  
  // Text weights for enhanced readability
  fontWeights: {
    normal: 500,      // Increased from 400
    medium: 600,      // Increased from 500
    semibold: 600,    // Maintained
    bold: 700         // Maintained
  },
  
  // Borders for visual separation
  borders: {
    subtle: "1px solid rgba(255, 255, 255, 0.1)",
    medium: "1px solid rgba(255, 255, 255, 0.2)",
    strong: "2px solid rgba(255, 255, 255, 0.3)"
  }
};

export type ThemeVariant = "green" | "blue" | "purple" | "orange";

/**
 * Get card colors for a specific variant
 */
export function getCardColors(variant: ThemeVariant) {
  return {
    background: themeTokens.cardBackgrounds[variant],
    text: themeTokens.cardText[`${variant}Light` as keyof typeof themeTokens.cardText]
  };
}

/**
 * Get status color with appropriate contrast
 */
export function getStatusColor(status: "success" | "warning" | "danger" | "info", isDark = false) {
  return isDark 
    ? themeTokens.status[`${status}Dark` as keyof typeof themeTokens.status]
    : themeTokens.status[status];
}
