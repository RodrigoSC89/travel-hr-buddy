#!/bin/bash
# Final verification script for PATCH 496-497

echo "🔍 PATCH 496-497 Final Verification"
echo "===================================="
echo ""

ERRORS=0

# Test 1: Type check
echo "✓ Test 1: TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
  echo "  ✅ PASS: Type check successful"
else
  echo "  ❌ FAIL: Type check failed"
  ERRORS=$((ERRORS + 1))
fi

# Test 2: Build
echo "✓ Test 2: Production build..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "  ✅ PASS: Build artifacts present"
else
  echo "  ❌ FAIL: Build artifacts missing"
  ERRORS=$((ERRORS + 1))
fi

# Test 3: Critical files
echo "✓ Test 3: Critical files exist..."
CRITICAL_FILES=(
  "src/pages/Dashboard.tsx"
  "src/pages/Index.tsx"
  "src/modules/mission-engine/services/mission-service.ts"
)
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test 4: Diagnostic scripts
echo "✓ Test 4: Diagnostic scripts exist..."
SCRIPTS=(
  "diagnostics/full-diagnostic.sh"
  "diagnostics/preview-validation.sh"
  "diagnostics/analyze-nocheck.sh"
)
for script in "${SCRIPTS[@]}"; do
  if [ -x "$script" ]; then
    echo "  ✅ $script"
  else
    echo "  ❌ $script missing or not executable"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test 5: Documentation
echo "✓ Test 5: Documentation exists..."
DOCS=(
  "diagnostics/README.md"
  "diagnostics/QUICKREF.md"
  "diagnostics/SUMMARY.md"
)
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test 6: Mission service fix
echo "✓ Test 6: Mission service duplicate removed..."
DUPLICATE_COUNT=$(grep -c "async createMission" src/modules/mission-engine/services/mission-service.ts 2>/dev/null || echo "0")
if [ "$DUPLICATE_COUNT" -eq "1" ]; then
  echo "  ✅ PASS: Only one createMission method"
else
  echo "  ❌ FAIL: Found $DUPLICATE_COUNT createMission methods (expected 1)"
  ERRORS=$((ERRORS + 1))
fi

# Test 7: @ts-nocheck in mission-service
echo "✓ Test 7: @ts-nocheck removed from mission-service..."
if grep -q "@ts-nocheck" src/modules/mission-engine/services/mission-service.ts 2>/dev/null; then
  echo "  ❌ FAIL: @ts-nocheck still present"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ PASS: @ts-nocheck removed"
fi

echo ""
echo "===================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ ALL TESTS PASSED ($ERRORS errors)"
  echo "🎉 PATCH 496-497 VERIFIED SUCCESSFULLY"
  exit 0
else
  echo "❌ TESTS FAILED ($ERRORS errors)"
  echo "⚠️  Please review the failures above"
  exit 1
fi
