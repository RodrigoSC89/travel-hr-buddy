#!/bin/bash

# ============================================
# TypeScript Validation Script
# Checks for @ts-nocheck, @ts-ignore, @ts-expect-error
# ============================================

echo "🔍 TypeScript Validation Report"
echo "================================"
echo ""

# Count @ts-nocheck
TS_NOCHECK=$(grep -r "@ts-nocheck" src/ --include="*.ts" --include="*.tsx" | wc -l)
TS_NOCHECK_FILES=$(grep -r "@ts-nocheck" src/ --include="*.ts" --include="*.tsx" -l | wc -l)

# Count @ts-ignore
TS_IGNORE=$(grep -r "@ts-ignore" src/ --include="*.ts" --include="*.tsx" | wc -l)
TS_IGNORE_FILES=$(grep -r "@ts-ignore" src/ --include="*.ts" --include="*.tsx" -l | wc -l)

# Count @ts-expect-error
TS_EXPECT=$(grep -r "@ts-expect-error" src/ --include="*.ts" --include="*.tsx" | wc -l)
TS_EXPECT_FILES=$(grep -r "@ts-expect-error" src/ --include="*.ts" --include="*.tsx" -l | wc -l)

TOTAL=$((TS_NOCHECK + TS_IGNORE + TS_EXPECT))
TOTAL_FILES=$((TS_NOCHECK_FILES + TS_IGNORE_FILES + TS_EXPECT_FILES))

echo "📊 Summary:"
echo "  @ts-nocheck:      $TS_NOCHECK occurrences in $TS_NOCHECK_FILES files"
echo "  @ts-ignore:       $TS_IGNORE occurrences in $TS_IGNORE_FILES files"
echo "  @ts-expect-error: $TS_EXPECT occurrences in $TS_EXPECT_FILES files"
echo "  ─────────────────────────────────────"
echo "  TOTAL:            $TOTAL occurrences in $TOTAL_FILES files"
echo ""

# Status
if [ $TOTAL -eq 0 ]; then
  echo "✅ STATUS: EXCELLENT - No TypeScript suppressions found!"
  exit 0
elif [ $TOTAL -lt 50 ]; then
  echo "✅ STATUS: GOOD - Few TypeScript suppressions ($TOTAL)"
  exit 0
elif [ $TOTAL -lt 200 ]; then
  echo "⚠️  STATUS: WARNING - Moderate TypeScript suppressions ($TOTAL)"
  exit 0
else
  echo "❌ STATUS: CRITICAL - Too many TypeScript suppressions ($TOTAL)"
  echo ""
  echo "🔴 Action Required:"
  echo "  1. Review files with @ts-nocheck"
  echo "  2. Add proper types and interfaces"
  echo "  3. Remove suppressions gradually"
  exit 1
fi
