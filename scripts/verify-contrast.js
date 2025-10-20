#!/usr/bin/env node

/**
 * Color Contrast Verification Script
 * Verifies that all color tokens meet WCAG 2.1 AA standards (4.5:1 for normal text)
 */

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Color definitions
const colors = {
  background: {
    base: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    elevated: "#334155", // slate-700
  },
  text: {
    base: "#f1f5f9", // slate-100
    muted: "#cbd5e1", // slate-300
    subtle: "#a8b8cc", // lightened slate
  },
  alert: {
    warning: "#fbbf24", // yellow-400
    error: "#fca5a5", // red-300
    success: "#34d399", // emerald-400
  },
};

// WCAG Standards
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;
const WCAG_AAA_NORMAL = 7.0;

console.log("🎨 Color Contrast Verification for WCAG 2.1 AA Compliance\n");
console.log("=" .repeat(70));

let allPassed = true;

// Test text colors on dark backgrounds
console.log("\n📊 Text Colors on Dark Backgrounds:");
console.log("-".repeat(70));

const backgrounds = Object.entries(colors.background);
const textColors = Object.entries(colors.text);

textColors.forEach(([textName, textColor]) => {
  backgrounds.forEach(([bgName, bgColor]) => {
    const ratio = getContrastRatio(textColor, bgColor);
    const passes = ratio >= WCAG_AA_NORMAL;
    const passesAAA = ratio >= WCAG_AAA_NORMAL;
    const status = passes ? "✅" : "❌";
    
    if (!passes) allPassed = false;
    
    console.log(
      `${status} text-${textName} on bg-${bgName}: ${ratio.toFixed(2)}:1 ${
        passesAAA ? "(AAA)" : passes ? "(AA)" : "(FAIL)"
      }`
    );
  });
});

// Test alert colors on dark backgrounds
console.log("\n📊 Alert Colors on Dark Backgrounds:");
console.log("-".repeat(70));

const alertColors = Object.entries(colors.alert);

alertColors.forEach(([alertName, alertColor]) => {
  backgrounds.forEach(([bgName, bgColor]) => {
    const ratio = getContrastRatio(alertColor, bgColor);
    const passes = ratio >= WCAG_AA_NORMAL;
    const passesAAA = ratio >= WCAG_AAA_NORMAL;
    const status = passes ? "✅" : "❌";
    
    if (!passes) allPassed = false;
    
    console.log(
      `${status} alert-${alertName} on bg-${bgName}: ${ratio.toFixed(2)}:1 ${
        passesAAA ? "(AAA)" : passes ? "(AA)" : "(FAIL)"
      }`
    );
  });
});

console.log("\n" + "=".repeat(70));
if (allPassed) {
  console.log("✅ All color combinations meet WCAG 2.1 AA standards!");
  console.log("✅ Minimum contrast ratio achieved: 4.5:1");
  process.exit(0);
} else {
  console.log("❌ Some color combinations do not meet WCAG 2.1 AA standards");
  console.log("❌ Please review the failed combinations above");
  process.exit(1);
}
