#!/bin/bash
# CI Performance Gate - Validates build meets performance budgets for 2Mb connections
# PATCH: Audit and Optimization Plan 2025

set -e

echo "🚀 CI Performance Gate"
echo "======================"
echo ""

# Build if needed
if [ ! -d "dist" ]; then
  echo "⚙️ Building production bundle..."
  npm run build
fi

FAILED=0
WARNINGS=0

# ============================================
# 1. Bundle Size Checks
# ============================================
echo "📦 1. Bundle Size Analysis"
echo "--------------------------"

# Maximum sizes (in KB, gzipped estimates at 35%)
MAX_INITIAL_JS_GZIP=250     # 250KB gzipped initial JS
MAX_CHUNK_SIZE=400          # 400KB per chunk (raw)
MAX_CSS_GZIP=40             # 40KB gzipped CSS
MAX_TOTAL_ASSETS=2500       # 2.5MB total

# Check initial bundle
INITIAL_JS=$(find dist/assets -name "core-react*.js" -o -name "core-router*.js" -o -name "index*.js" 2>/dev/null)
if [ -n "$INITIAL_JS" ]; then
  INITIAL_SIZE=0
  for file in $INITIAL_JS; do
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    INITIAL_SIZE=$((INITIAL_SIZE + size))
  done
  INITIAL_KB=$((INITIAL_SIZE / 1024))
  INITIAL_GZIP=$((INITIAL_KB * 35 / 100))
  
  echo "  Initial JS: ${INITIAL_KB}KB (≈${INITIAL_GZIP}KB gzipped)"
  
  if [ $INITIAL_GZIP -gt $MAX_INITIAL_JS_GZIP ]; then
    echo "  ❌ FAILED: Exceeds ${MAX_INITIAL_JS_GZIP}KB gzipped limit"
    FAILED=1
  else
    echo "  ✅ PASSED"
  fi
fi

# Check for oversized chunks
echo ""
echo "  Checking chunk sizes..."
LARGE_CHUNKS=$(find dist/assets -name "*.js" -type f -size +${MAX_CHUNK_SIZE}k 2>/dev/null)
if [ -n "$LARGE_CHUNKS" ]; then
  echo "  ⚠️  WARNING: Chunks exceeding ${MAX_CHUNK_SIZE}KB:"
  echo "$LARGE_CHUNKS" | while read file; do
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    echo "     - $(basename "$file"): $size"
  done
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✅ No oversized chunks"
fi

# Check CSS size
CSS_SIZE=$(find dist/assets -name "*.css" -type f -exec cat {} \; 2>/dev/null | wc -c)
CSS_KB=$((CSS_SIZE / 1024))
CSS_GZIP=$((CSS_KB * 35 / 100))
echo ""
echo "  CSS: ${CSS_KB}KB (≈${CSS_GZIP}KB gzipped)"
if [ $CSS_GZIP -gt $MAX_CSS_GZIP ]; then
  echo "  ⚠️  WARNING: CSS exceeds ${MAX_CSS_GZIP}KB gzipped"
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✅ PASSED"
fi

# ============================================
# 2. Heavy Dependencies Check
# ============================================
echo ""
echo "🔍 2. Heavy Dependencies Analysis"
echo "----------------------------------"

HEAVY_DEPS=("three" "mapbox" "tensorflow" "tiptap" "firebase" "chart.js" "recharts")
echo "  Checking for static imports of heavy libs..."

for dep in "${HEAVY_DEPS[@]}"; do
  # Check for static imports in source (not dynamic)
  STATIC_IMPORTS=$(grep -r "^import.*from.*['\"].*${dep}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "lazy\|dynamic" | head -5)
  if [ -n "$STATIC_IMPORTS" ]; then
    echo "  ⚠️  Static import of '${dep}' found:"
    echo "$STATIC_IMPORTS" | while read line; do
      echo "     $line"
    done
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo "  ✅ Check complete"

# ============================================
# 3. Critical Route Analysis
# ============================================
echo ""
echo "📊 3. Route Bundle Sizes"
echo "------------------------"

declare -A ROUTE_CHUNKS
ROUTE_CHUNKS["pages-main"]="Main pages"
ROUTE_CHUNKS["pages-admin"]="Admin pages"
ROUTE_CHUNKS["module-travel"]="Travel module"
ROUTE_CHUNKS["module-hr"]="HR module"
ROUTE_CHUNKS["module-docs"]="Docs module"

for chunk in "${!ROUTE_CHUNKS[@]}"; do
  CHUNK_FILE=$(find dist/assets -name "${chunk}*.js" 2>/dev/null | head -1)
  if [ -n "$CHUNK_FILE" ]; then
    size=$(stat -f%z "$CHUNK_FILE" 2>/dev/null || stat -c%s "$CHUNK_FILE" 2>/dev/null)
    size_kb=$((size / 1024))
    echo "  ${ROUTE_CHUNKS[$chunk]}: ${size_kb}KB"
  fi
done

# ============================================
# 4. Asset Optimization Check
# ============================================
echo ""
echo "🖼️  4. Asset Optimization"
echo "-------------------------"

# Check for unoptimized images
UNOPT_IMAGES=$(find public src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +100k 2>/dev/null)
if [ -n "$UNOPT_IMAGES" ]; then
  echo "  ⚠️  Large images (>100KB) found:"
  echo "$UNOPT_IMAGES" | while read file; do
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    echo "     - $file: $size"
  done
  WARNINGS=$((WARNINGS + 1))
else
  echo "  ✅ No large unoptimized images"
fi

# Check for WebP/AVIF presence
WEBP_COUNT=$(find dist public src -name "*.webp" 2>/dev/null | wc -l)
AVIF_COUNT=$(find dist public src -name "*.avif" 2>/dev/null | wc -l)
echo "  WebP images: $WEBP_COUNT"
echo "  AVIF images: $AVIF_COUNT"

# ============================================
# 5. Summary
# ============================================
echo ""
echo "📋 Summary"
echo "==========="
echo "  Errors: $FAILED"
echo "  Warnings: $WARNINGS"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "❌ Performance gate FAILED"
  echo "   Fix the errors above before deploying."
  exit 1
elif [ $WARNINGS -gt 3 ]; then
  echo "⚠️  Performance gate PASSED with warnings"
  echo "   Consider addressing the warnings for better 2Mb performance."
  exit 0
else
  echo "✅ Performance gate PASSED"
  exit 0
fi
