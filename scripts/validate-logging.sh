#!/bin/bash

# ============================================
# Logging Validation Script
# Checks for console.log/error/warn usage
# ============================================

echo "📝 Logging Validation Report"
echo "============================"
echo ""

# Count console statements (excluding logger.ts and error-tracker.ts)
CONSOLE_LOG=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "src/lib/logger.ts" | \
  grep -v "src/lib/error-tracker.ts" | \
  grep -v "// eslint-disable-next-line no-console" | wc -l)

CONSOLE_ERROR=$(grep -r "console\.error" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "src/lib/logger.ts" | \
  grep -v "src/lib/error-tracker.ts" | \
  grep -v "// eslint-disable-next-line no-console" | wc -l)

CONSOLE_WARN=$(grep -r "console\.warn" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "src/lib/logger.ts" | \
  grep -v "src/lib/error-tracker.ts" | \
  grep -v "// eslint-disable-next-line no-console" | wc -l)

CONSOLE_INFO=$(grep -r "console\.info" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "src/lib/logger.ts" | \
  grep -v "src/lib/error-tracker.ts" | wc -l)

TOTAL=$((CONSOLE_LOG + CONSOLE_ERROR + CONSOLE_WARN + CONSOLE_INFO))

echo "📊 Summary:"
echo "  console.log:   $CONSOLE_LOG occurrences"
echo "  console.error: $CONSOLE_ERROR occurrences"
echo "  console.warn:  $CONSOLE_WARN occurrences"
echo "  console.info:  $CONSOLE_INFO occurrences"
echo "  ──────────────────────────────"
echo "  TOTAL:         $TOTAL occurrences"
echo ""

# Status
if [ $TOTAL -eq 0 ]; then
  echo "✅ STATUS: EXCELLENT - All logging uses centralized logger!"
  exit 0
elif [ $TOTAL -lt 50 ]; then
  echo "✅ STATUS: GOOD - Few console statements ($TOTAL)"
  exit 0
elif [ $TOTAL -lt 200 ]; then
  echo "⚠️  STATUS: WARNING - Moderate console usage ($TOTAL)"
  echo ""
  echo "💡 Recommendation:"
  echo "  Replace console.* with logger from @/lib/logger"
  exit 0
else
  echo "❌ STATUS: CRITICAL - Excessive console usage ($TOTAL)"
  echo ""
  echo "🔴 Action Required:"
  echo "  1. Replace console.log with logger.info/logger.debug"
  echo "  2. Replace console.error with logger.error"
  echo "  3. Replace console.warn with logger.warn"
  echo "  4. Import: import { logger } from '@/lib/logger'"
  exit 1
fi
