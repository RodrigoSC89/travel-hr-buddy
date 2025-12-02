#!/bin/bash
# ============================================
# PATCH 655 - Asset Analysis Script
# Analyzes project assets and provides optimization recommendations
# ============================================

echo "🔍 NAUTILUS ASSET ANALYSIS"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Analyzing Assets...${NC}"
echo ""

# ============================================
# 1. IMAGE ANALYSIS
# ============================================
echo -e "${BLUE}🖼️  IMAGE ASSETS${NC}"
echo "----------------------------------------"

# Public images
echo "Public directory:"
if [ -d "public" ]; then
  find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" -o -name "*.gif" -o -name "*.webp" \) -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}'
  
  # Count by type
  PNG_COUNT=$(find public -name "*.png" | wc -l)
  JPG_COUNT=$(find public -name "*.jpg" -o -name "*.jpeg" | wc -l)
  SVG_COUNT=$(find public -name "*.svg" | wc -l)
  WEBP_COUNT=$(find public -name "*.webp" | wc -l)
  
  echo ""
  echo "  Summary:"
  echo "    PNG: $PNG_COUNT files"
  echo "    JPG: $JPG_COUNT files"
  echo "    SVG: $SVG_COUNT files"
  echo "    WebP: $WEBP_COUNT files"
else
  echo "  ⚠️  Public directory not found"
fi

echo ""

# Src assets
echo "Src/assets directory:"
if [ -d "src/assets" ]; then
  find src/assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" -o -name "*.gif" -o -name "*.webp" \) -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}'
else
  echo "  ℹ️  No src/assets directory"
fi

echo ""

# ============================================
# 2. FONT ANALYSIS
# ============================================
echo -e "${BLUE}🔤 FONT CONFIGURATION${NC}"
echo "----------------------------------------"

if [ -f "index.html" ]; then
  echo "Fonts loaded from index.html:"
  grep -o 'family=[^&]*' index.html | sed 's/family=/  - /' | sort -u
  
  echo ""
  echo "Font optimization:"
  if grep -q "preconnect.*fonts.googleapis.com" index.html; then
    echo -e "  ${GREEN}✓${NC} Preconnect configured"
  else
    echo -e "  ${RED}✗${NC} Missing preconnect"
  fi
  
  if grep -q "display=swap" index.html; then
    echo -e "  ${GREEN}✓${NC} Font-display: swap enabled"
  else
    echo -e "  ${YELLOW}⚠${NC}  Font-display: swap missing"
  fi
  
  if grep -q "crossorigin" index.html | grep -q "fonts"; then
    echo -e "  ${GREEN}✓${NC} Crossorigin attribute set"
  else
    echo -e "  ${YELLOW}⚠${NC}  Crossorigin attribute missing"
  fi
fi

echo ""

# ============================================
# 3. LAZY LOADING ANALYSIS
# ============================================
echo -e "${BLUE}⚡ LAZY LOADING${NC}"
echo "----------------------------------------"

# Check for lazy loading implementation
LAZY_COUNT=$(grep -r "loading=\"lazy\"" src/ 2>/dev/null | wc -l)
LAZY_IMPORT_COUNT=$(grep -r "React.lazy" src/ 2>/dev/null | wc -l)

echo "Image lazy loading:"
if [ $LAZY_COUNT -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} Found $LAZY_COUNT lazy-loaded images"
else
  echo -e "  ${YELLOW}⚠${NC}  No lazy-loaded images found"
fi

echo ""
echo "Component lazy loading:"
if [ $LAZY_IMPORT_COUNT -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} Found $LAZY_IMPORT_COUNT lazy-loaded components"
else
  echo -e "  ${YELLOW}⚠${NC}  No lazy-loaded components found"
fi

echo ""

# ============================================
# 4. PERFORMANCE RECOMMENDATIONS
# ============================================
echo -e "${BLUE}💡 OPTIMIZATION RECOMMENDATIONS${NC}"
echo "----------------------------------------"

RECOMMENDATIONS=0

# Check for large images
if [ -d "public" ] || [ -d "src/assets" ]; then
  LARGE_IMAGES=$(find public src/assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +500k 2>/dev/null | wc -l)
  if [ $LARGE_IMAGES -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC}  Found $LARGE_IMAGES images larger than 500KB"
    echo "    → Consider converting to WebP/AVIF format"
    echo "    → Use image compression tools (e.g., tinypng.com, squoosh.app)"
    RECOMMENDATIONS=$((RECOMMENDATIONS + 1))
    echo ""
  fi
fi

# Check for PNG that could be WebP
if [ $PNG_COUNT -gt 0 ] && [ $WEBP_COUNT -eq 0 ]; then
  echo -e "${YELLOW}⚠${NC}  Found $PNG_COUNT PNG files but no WebP alternatives"
  echo "    → Convert PNGs to WebP for ~30% size reduction"
  echo "    → Keep PNG as fallback for older browsers"
  RECOMMENDATIONS=$((RECOMMENDATIONS + 1))
  echo ""
fi

# Check for preload
if [ -f "index.html" ]; then
  PRELOAD_COUNT=$(grep -c "rel=\"preload\"" index.html 2>/dev/null || echo "0")
  if [ $PRELOAD_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC}  No critical resources preloaded"
    echo "    → Add preload for hero images or critical fonts"
    echo "    → Example: <link rel=\"preload\" as=\"image\" href=\"/hero.webp\">"
    RECOMMENDATIONS=$((RECOMMENDATIONS + 1))
    echo ""
  fi
fi

# Font subsetting
if grep -q "family=Inter:wght" index.html 2>/dev/null; then
  FONT_WEIGHTS=$(grep -o 'family=Inter:wght@[^&]*' index.html | sed 's/.*@//')
  WEIGHT_COUNT=$(echo $FONT_WEIGHTS | tr ';' '\n' | wc -l)
  if [ $WEIGHT_COUNT -gt 4 ]; then
    echo -e "${YELLOW}⚠${NC}  Loading $WEIGHT_COUNT font weights"
    echo "    → Consider reducing to 3-4 most used weights"
    echo "    → Current: $FONT_WEIGHTS"
    RECOMMENDATIONS=$((RECOMMENDATIONS + 1))
    echo ""
  fi
fi

# SVG optimization
if [ $SVG_COUNT -gt 0 ]; then
  echo -e "${BLUE}ℹ${NC}  Found $SVG_COUNT SVG files"
  echo "    → Ensure SVGs are optimized with SVGO"
  echo "    → Command: npx svgo -f public/icons -o public/icons"
  echo ""
fi

if [ $RECOMMENDATIONS -eq 0 ]; then
  echo -e "${GREEN}✓${NC} No critical optimization issues found!"
fi

echo ""

# ============================================
# 5. SUMMARY SCORE
# ============================================
echo -e "${BLUE}📊 ASSET OPTIMIZATION SCORE${NC}"
echo "----------------------------------------"

SCORE=100
[ $LARGE_IMAGES -gt 0 ] && SCORE=$((SCORE - 15))
[ $PNG_COUNT -gt 0 ] && [ $WEBP_COUNT -eq 0 ] && SCORE=$((SCORE - 10))
[ $PRELOAD_COUNT -eq 0 ] && SCORE=$((SCORE - 10))
[ $LAZY_COUNT -eq 0 ] && SCORE=$((SCORE - 5))

if [ $SCORE -ge 90 ]; then
  echo -e "Score: ${GREEN}$SCORE/100${NC} - Excellent ✨"
elif [ $SCORE -ge 75 ]; then
  echo -e "Score: ${BLUE}$SCORE/100${NC} - Good 👍"
elif [ $SCORE -ge 60 ]; then
  echo -e "Score: ${YELLOW}$SCORE/100${NC} - Needs Improvement ⚠️"
else
  echo -e "Score: ${RED}$SCORE/100${NC} - Critical Issues 🔴"
fi

echo ""

# ============================================
# 6. NEXT STEPS
# ============================================
echo -e "${BLUE}🚀 NEXT STEPS${NC}"
echo "----------------------------------------"
echo "1. Convert images to WebP format"
echo "2. Add preload for critical assets"
echo "3. Implement lazy loading for below-fold images"
echo "4. Optimize SVGs with SVGO"
echo "5. Run Lighthouse audit for validation"
echo ""
echo "For more details, see: docs/ASSET-OPTIMIZATION-REPORT.md"
echo ""

exit 0
