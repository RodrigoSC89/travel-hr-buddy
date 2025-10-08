#!/bin/bash

# Color Contrast Validation Script
# This script checks for low-contrast color usage in the codebase

echo "🎨 Nautilus One - Color Contrast Validation"
echo "============================================"
echo ""

# Colors to check
LOW_CONTRAST_COLORS=(
  "text-gray-300"
  "text-gray-400"
  "text-gray-500"
  "text-slate-300"
  "text-slate-400"
  "text-zinc-300"
  "text-zinc-400"
  "text-neutral-300"
  "text-neutral-400"
)

TOTAL_ISSUES=0

echo "Scanning for low-contrast colors in light mode..."
echo ""

for color in "${LOW_CONTRAST_COLORS[@]}"; do
  # Count occurrences (excluding dark mode variants)
  count=$(grep -r "$color" src/ --include="*.tsx" --include="*.jsx" | grep -v "dark:" | grep -v ".dark" | wc -l)
  
  if [ "$count" -gt 0 ]; then
    echo "⚠️  Found $count instances of '$color'"
    TOTAL_ISSUES=$((TOTAL_ISSUES + count))
    
    # Show first 5 occurrences
    echo "   First occurrences:"
    grep -rn "$color" src/ --include="*.tsx" --include="*.jsx" | grep -v "dark:" | grep -v ".dark" | head -5 | while read -r line; do
      echo "   - $line"
    done
    echo ""
  fi
done

echo "============================================"
if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo "✅ SUCCESS: No low-contrast colors found!"
  echo ""
  echo "All text colors meet WCAG 2.1 accessibility standards."
  echo "Recommended usage: text-muted-foreground (7.5:1 contrast)"
  exit 0
else
  echo "❌ FAIL: Found $TOTAL_ISSUES low-contrast color instances"
  echo ""
  echo "Action required:"
  echo "1. Replace low-contrast colors with text-muted-foreground"
  echo "2. Ensure minimum 4.5:1 contrast ratio (WCAG AA)"
  echo "3. Target 7:1 contrast ratio for AAA compliance"
  exit 1
fi
