#!/bin/bash
# ============================================
# PATCH 657 - Performance Budget Validation
# Validates production build against performance budgets
# ============================================

echo "🎯 NAUTILUS PERFORMANCE BUDGET CHECK"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Performance budgets (MVP targets)
MAX_JS_SIZE_KB=350        # Maximum JS bundle size (gzipped)
MAX_CSS_SIZE_KB=50        # Maximum CSS bundle size (gzipped)
MAX_HTML_SIZE_KB=20       # Maximum HTML size
MAX_CHUNKS=200            # Maximum number of chunks
TARGET_LCP_MS=2500        # Largest Contentful Paint target
TARGET_FID_MS=100         # First Input Delay target
TARGET_CLS=0.1            # Cumulative Layout Shift target

FAILED=0
WARNINGS=0

echo -e "${BLUE}📦 Building production bundle...${NC}"
echo ""

# Build the project
NODE_OPTIONS="--max-old-space-size=4096" npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# ============================================
# 1. BUNDLE SIZE ANALYSIS
# ============================================
echo -e "${BLUE}📊 Bundle Size Analysis${NC}"
echo "----------------------------------------"

if [ -d "dist" ]; then
  # Total dist size
  DIST_SIZE_MB=$(du -sm dist | cut -f1)
  DIST_SIZE_KB=$((DIST_SIZE_MB * 1024))
  
  echo "Total bundle size: ${DIST_SIZE_MB}MB"
  
  # JS files
  if ls dist/assets/*.js >/dev/null 2>&1; then
    JS_FILES=$(find dist/assets -name "*.js" -type f)
    JS_COUNT=$(echo "$JS_FILES" | wc -l)
    JS_TOTAL_KB=$(du -sk dist/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
    JS_TOTAL_MB=$((JS_TOTAL_KB / 1024))
    
    echo "JavaScript: ${JS_TOTAL_MB}MB (${JS_COUNT} files)"
    
    # Estimate gzipped size (typically ~30% of original)
    JS_GZIP_EST_KB=$((JS_TOTAL_KB * 30 / 100))
    
    if [ $JS_GZIP_EST_KB -gt $MAX_JS_SIZE_KB ]; then
      echo -e "  ${RED}⚠️  JS size ($JS_GZIP_EST_KB KB gzipped est.) exceeds budget ($MAX_JS_SIZE_KB KB)${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}✓${NC} JS within budget ($JS_GZIP_EST_KB KB est. < $MAX_JS_SIZE_KB KB)"
    fi
  fi
  
  # CSS files
  if ls dist/assets/*.css >/dev/null 2>&1; then
    CSS_TOTAL_KB=$(du -sk dist/assets/*.css 2>/dev/null | awk '{sum+=$1} END {print sum}')
    CSS_TOTAL_MB=$((CSS_TOTAL_KB / 1024))
    CSS_GZIP_EST_KB=$((CSS_TOTAL_KB * 30 / 100))
    
    echo "CSS: ${CSS_TOTAL_MB}MB"
    
    if [ $CSS_GZIP_EST_KB -gt $MAX_CSS_SIZE_KB ]; then
      echo -e "  ${RED}⚠️  CSS size ($CSS_GZIP_EST_KB KB gzipped est.) exceeds budget ($MAX_CSS_SIZE_KB KB)${NC}"
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "  ${GREEN}✓${NC} CSS within budget ($CSS_GZIP_EST_KB KB est. < $MAX_CSS_SIZE_KB KB)"
    fi
  fi
  
  # Chunk count
  CHUNK_COUNT=$(find dist/assets -name "*.js" -type f | wc -l)
  echo "Chunks: $CHUNK_COUNT files"
  
  if [ $CHUNK_COUNT -gt $MAX_CHUNKS ]; then
    echo -e "  ${YELLOW}⚠️  Chunk count ($CHUNK_COUNT) exceeds target ($MAX_CHUNKS)${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${GREEN}✓${NC} Chunk count within target"
  fi
  
else
  echo -e "${RED}❌ Dist folder not found${NC}"
  FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# 2. LARGEST FILES ANALYSIS
# ============================================
echo -e "${BLUE}📋 Largest Files (Top 10)${NC}"
echo "----------------------------------------"

if [ -d "dist/assets" ]; then
  find dist/assets -type f -exec ls -lh {} \; | \
    awk '{print $5 "\t" $9}' | \
    sort -hr | \
    head -10 | \
    while IFS=$'\t' read -r size file; do
      echo "  $size  $(basename $file)"
    done
else
  echo -e "${YELLOW}⚠️  Assets folder not found${NC}"
fi

echo ""

# ============================================
# 3. WEB VITALS TARGETS
# ============================================
echo -e "${BLUE}🎯 Web Vitals Targets${NC}"
echo "----------------------------------------"

echo "Target metrics (must validate with Lighthouse):"
echo ""
echo "  LCP (Largest Contentful Paint):"
echo -e "    Target: < ${TARGET_LCP_MS}ms ${GREEN}(Good)${NC}"
echo "    Poor: > 4000ms"
echo ""
echo "  FID (First Input Delay):"
echo -e "    Target: < ${TARGET_FID_MS}ms ${GREEN}(Good)${NC}"
echo "    Poor: > 300ms"
echo ""
echo "  CLS (Cumulative Layout Shift):"
echo -e "    Target: < ${TARGET_CLS} ${GREEN}(Good)${NC}"
echo "    Poor: > 0.25"
echo ""
echo -e "${YELLOW}💡 Run Lighthouse audit to validate these metrics${NC}"
echo "   Command: npx lighthouse http://localhost:4173 --view"

echo ""

# ============================================
# 4. OPTIMIZATION CHECKS
# ============================================
echo -e "${BLUE}⚡ Optimization Checks${NC}"
echo "----------------------------------------"

# Check for source maps in production
if ls dist/assets/*.map >/dev/null 2>&1; then
  MAP_COUNT=$(find dist/assets -name "*.map" | wc -l)
  echo -e "${YELLOW}⚠️  Found $MAP_COUNT source maps in production build${NC}"
  echo "   Consider disabling source maps for production"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓${NC} No source maps in production"
fi

# Check for console logs
CONSOLE_COUNT=$(grep -r "console\." dist/assets/*.js 2>/dev/null | grep -v "console.error" | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console statements in production${NC}"
  echo "   Vite should remove these automatically"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓${NC} No console statements found"
fi

# Check for minification
if grep -q "function " dist/assets/*.js 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Code appears minified"
else
  echo -e "${YELLOW}⚠️  Code may not be properly minified${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 5. PERFORMANCE SCORE
# ============================================
echo -e "${BLUE}📊 Performance Budget Score${NC}"
echo "----------------------------------------"

SCORE=100

# Deduct points for warnings
SCORE=$((SCORE - WARNINGS * 5))

# Deduct points for failures
SCORE=$((SCORE - FAILED * 20))

if [ $SCORE -ge 90 ]; then
  echo -e "Score: ${GREEN}$SCORE/100${NC} - Excellent ✨"
  STATUS="PASS"
elif [ $SCORE -ge 75 ]; then
  echo -e "Score: ${BLUE}$SCORE/100${NC} - Good 👍"
  STATUS="PASS"
elif [ $SCORE -ge 60 ]; then
  echo -e "Score: ${YELLOW}$SCORE/100${NC} - Acceptable ⚠️"
  STATUS="WARNING"
else
  echo -e "Score: ${RED}$SCORE/100${NC} - Needs Work 🔴"
  STATUS="FAIL"
fi

echo ""

# ============================================
# 6. SUMMARY & RECOMMENDATIONS
# ============================================
echo -e "${BLUE}📋 Summary${NC}"
echo "----------------------------------------"

echo "Warnings: $WARNINGS"
echo "Failures: $FAILED"
echo ""

if [ $WARNINGS -gt 0 ] || [ $FAILED -gt 0 ]; then
  echo -e "${YELLOW}💡 Recommendations:${NC}"
  [ $JS_GZIP_EST_KB -gt $MAX_JS_SIZE_KB ] && echo "  - Consider code splitting for large JS bundles"
  [ $CHUNK_COUNT -gt $MAX_CHUNKS ] && echo "  - Too many chunks may hurt performance, consider consolidation"
  [ $CONSOLE_COUNT -gt 0 ] && echo "  - Remove console statements from production"
  echo ""
fi

echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Run Lighthouse audit: npx lighthouse http://localhost:4173 --view"
echo "2. Validate Web Vitals in production"
echo "3. Monitor performance dashboards: /admin/performance"
echo ""

# Exit with appropriate code
if [ "$STATUS" = "FAIL" ]; then
  exit 1
elif [ "$STATUS" = "WARNING" ]; then
  exit 0
else
  exit 0
fi
