#!/bin/bash

# ============================================
# React Hooks Validation Script
# Checks for useEffect without dependency arrays
# ============================================

echo "⚛️  React Hooks Validation Report"
echo "================================="
echo ""

# Count useEffect without deps or with empty deps []
USEEFFECT_NO_DEPS=$(grep -r "useEffect(\s*()\\s*=>" src/ --include="*.tsx" --include="*.ts" | wc -l)
USEEFFECT_EMPTY_DEPS=$(grep -r "useEffect(.*,\\s*\\[\\s*\\])" src/ --include="*.tsx" --include="*.ts" | wc -l)

# Count files with potential issues
PROBLEM_FILES=$(grep -r "useEffect(\s*()\\s*=>" src/ --include="*.tsx" --include="*.ts" -l | wc -l)

echo "📊 Summary:"
echo "  useEffect without deps array:  $USEEFFECT_NO_DEPS occurrences"
echo "  useEffect with empty deps []:  $USEEFFECT_EMPTY_DEPS occurrences"
echo "  Files with potential issues:   $PROBLEM_FILES files"
echo ""

# Check for common patterns that might cause issues
echo "🔍 Analyzing patterns..."
echo ""

# Memory leak indicators
SETTIMEOUT=$(grep -r "setTimeout" src/components --include="*.tsx" | grep "useEffect" -A 5 | grep -c "setTimeout")
SETINTERVAL=$(grep -r "setInterval" src/components --include="*.tsx" | grep "useEffect" -A 5 | grep -c "setInterval")
SUBSCRIBE=$(grep -r "\\.subscribe" src/components --include="*.tsx" | grep "useEffect" -A 5 | grep -c "subscribe")

echo "⚠️  Potential Memory Leak Indicators:"
echo "  setTimeout in useEffect:   $SETTIMEOUT occurrences"
echo "  setInterval in useEffect:  $SETINTERVAL occurrences"
echo "  subscriptions in useEffect: $SUBSCRIBE occurrences"
echo ""

# Status
TOTAL_ISSUES=$((USEEFFECT_NO_DEPS + SETTIMEOUT + SETINTERVAL + SUBSCRIBE))

if [ $TOTAL_ISSUES -eq 0 ]; then
  echo "✅ STATUS: EXCELLENT - All hooks properly configured!"
  exit 0
elif [ $TOTAL_ISSUES -lt 50 ]; then
  echo "✅ STATUS: GOOD - Few hook issues ($TOTAL_ISSUES)"
  exit 0
elif [ $TOTAL_ISSUES -lt 200 ]; then
  echo "⚠️  STATUS: WARNING - Moderate hook issues ($TOTAL_ISSUES)"
  echo ""
  echo "💡 Recommendations:"
  echo "  1. Add dependency arrays to useEffect"
  echo "  2. Return cleanup functions for timers/subscriptions"
  echo "  3. Use useCallback/useMemo to stabilize dependencies"
  exit 0
else
  echo "❌ STATUS: CRITICAL - Many hook issues ($TOTAL_ISSUES)"
  echo ""
  echo "🔴 Action Required:"
  echo "  1. Review useEffect hooks without dependency arrays"
  echo "  2. Add proper cleanup functions"
  echo "  3. Use React DevTools Profiler to detect issues"
  echo "  4. Consider using custom hooks for complex effects"
  exit 1
fi
