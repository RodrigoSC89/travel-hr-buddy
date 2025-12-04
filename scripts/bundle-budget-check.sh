#!/bin/bash
# Bundle Budget Check Script
# Enforces bundle size limits for 2Mb connections

echo "📊 Bundle Budget Checker"
echo "========================"
echo ""

# Build if dist doesn't exist
if [ ! -d "dist" ]; then
  echo "⚙️ Building production bundle..."
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
fi

# Budget limits (in KB)
MAX_INITIAL_BUNDLE_GZIP=300    # 300KB gzipped - 1.2s @ 2Mb
MAX_SINGLE_CHUNK=500           # 500KB per chunk
MAX_TOTAL_PAGE=1000            # 1MB total

FAILED=0

echo "🔍 Checking bundle sizes..."
echo ""

# Check initial bundle (core-react + core-router + main)
INITIAL_JS=$(find dist/assets -name "core-react*.js" -o -name "core-router*.js" -o -name "index*.js" 2>/dev/null)

if [ -n "$INITIAL_JS" ]; then
  INITIAL_SIZE=0
  for file in $INITIAL_JS; do
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    INITIAL_SIZE=$((INITIAL_SIZE + size))
  done
  INITIAL_KB=$((INITIAL_SIZE / 1024))
  
  # Estimate gzipped (typically 30-40% of original)
  INITIAL_GZIP=$((INITIAL_KB * 35 / 100))
  
  echo "Initial Bundle: ${INITIAL_KB}KB (≈${INITIAL_GZIP}KB gzipped)"
  
  if [ $INITIAL_GZIP -gt $MAX_INITIAL_BUNDLE_GZIP ]; then
    echo "❌ FAILED: Initial bundle exceeds ${MAX_INITIAL_BUNDLE_GZIP}KB gzipped limit"
    FAILED=1
  else
    echo "✅ PASSED: Within initial bundle budget"
  fi
fi

echo ""

# Check for chunks > 500KB
echo "🔍 Checking for oversized chunks..."
LARGE_CHUNKS=$(find dist/assets -name "*.js" -type f -size +500k 2>/dev/null)

if [ -n "$LARGE_CHUNKS" ]; then
  echo "❌ FAILED: Found chunks > 500KB:"
  echo "$LARGE_CHUNKS" | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "   - $(basename "$file"): $size"
  done
  FAILED=1
else
  echo "✅ PASSED: No chunks exceed 500KB"
fi

echo ""

# Check total dist size
echo "🔍 Checking total bundle size..."
TOTAL_SIZE=$(du -sk dist | cut -f1)
TOTAL_MB=$((TOTAL_SIZE / 1024))

echo "Total dist size: ${TOTAL_SIZE}KB (${TOTAL_MB}MB)"

if [ $TOTAL_SIZE -gt $((MAX_TOTAL_PAGE * 10)) ]; then
  echo "⚠️  WARNING: Total bundle is large (${TOTAL_MB}MB)"
  echo "   Consider lazy loading more modules"
fi

echo ""

# Generate size report
echo "📋 Size Report by Category:"
echo "----------------------------"

categories=("core" "ui" "charts" "module" "pages" "vendors")
for cat in "${categories[@]}"; do
  files=$(find dist/assets -name "${cat}*.js" 2>/dev/null)
  if [ -n "$files" ]; then
    total=0
    count=0
    for f in $files; do
      size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
      total=$((total + size))
      count=$((count + 1))
    done
    total_kb=$((total / 1024))
    echo "  ${cat}: ${total_kb}KB (${count} files)"
  fi
done

echo ""

# Recommendations
echo "📝 Recommendations for 2Mb Connections:"
echo "========================================"
echo "1. Initial load should be < 300KB gzipped (1.2s download)"
echo "2. Each route chunk should be < 100KB gzipped"
echo "3. Images should use WebP/AVIF format"
echo "4. Enable Brotli compression on server"
echo "5. Use aggressive cache headers (1 year for versioned assets)"
echo ""

if [ $FAILED -eq 1 ]; then
  echo "❌ Bundle budget check FAILED"
  exit 1
else
  echo "✅ Bundle budget check PASSED"
  exit 0
fi
