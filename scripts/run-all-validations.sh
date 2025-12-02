#!/bin/bash

# ============================================
# Master Validation Script
# Runs all validation checks
# ============================================

echo "🚀 Running Complete Validation Suite"
echo "====================================="
echo ""

FAILED=0

# Make scripts executable
chmod +x scripts/validate-typescript.sh
chmod +x scripts/validate-logging.sh
chmod +x scripts/validate-hooks.sh
chmod +x scripts/validate-routes.sh
chmod +x scripts/performance-budget-check.sh

echo "┌─────────────────────────────────────┐"
echo "│  1. TypeScript Validation           │"
echo "└─────────────────────────────────────┘"
bash scripts/validate-typescript.sh
if [ $? -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi
echo ""

echo "┌─────────────────────────────────────┐"
echo "│  2. Logging Validation              │"
echo "└─────────────────────────────────────┘"
bash scripts/validate-logging.sh
if [ $? -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi
echo ""

echo "┌─────────────────────────────────────┐"
echo "│  3. React Hooks Validation          │"
echo "└─────────────────────────────────────┘"
bash scripts/validate-hooks.sh
if [ $? -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi
echo ""

echo "┌─────────────────────────────────────┐"
echo "│  4. Routes Validation               │"
echo "└─────────────────────────────────────┘"
bash scripts/validate-routes.sh
if [ $? -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi
echo ""

echo "┌─────────────────────────────────────┐"
echo "│  5. Performance Budget Check        │"
echo "└─────────────────────────────────────┘"
bash scripts/performance-budget-check.sh
if [ $? -ne 0 ]; then
  FAILED=$((FAILED + 1))
fi
echo ""

echo "═══════════════════════════════════════"
echo "📊 VALIDATION SUITE RESULTS"
echo "═══════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED!"
  echo ""
  echo "🎉 Repository is production-ready!"
  exit 0
elif [ $FAILED -eq 1 ]; then
  echo "⚠️  1 CHECK FAILED"
  echo ""
  echo "Review the failed check and fix issues before deploying."
  exit 1
else
  echo "❌ $FAILED CHECKS FAILED"
  echo ""
  echo "🔴 CRITICAL: Multiple validation failures detected!"
  echo "   Do not deploy to production until all checks pass."
  exit 1
fi
