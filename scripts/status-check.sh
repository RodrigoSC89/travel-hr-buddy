#!/bin/bash

###############################################################################
# Nautilus One - Quick Status Check
# 
# Quick check of build and validation status
###############################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧭 Nautilus One - Status Check${NC}"
echo "================================"
echo ""

# Check if build exists
if [ -d "dist" ]; then
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${GREEN}✅ Build exists:${NC} $FILE_COUNT files in dist/"
else
    echo -e "${RED}❌ No build found${NC} - run: npm run build"
fi

# Check if validation report exists
if [ -f "reports/preview-validation-report.md" ]; then
    REPORT_DATE=$(grep "Generated:" reports/preview-validation-report.md | cut -d: -f2- | xargs)
    echo -e "${GREEN}✅ Validation report exists${NC}"
    echo "   Generated: $REPORT_DATE"
else
    echo -e "${YELLOW}⚠️  No validation report${NC} - run: npm run preview:initial-report"
fi

# Check for error logs
if [ -f "reports/preview-errors.log" ]; then
    ERROR_COUNT=$(wc -l < reports/preview-errors.log)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Preview errors found:${NC} $ERROR_COUNT lines in error log"
    else
        echo -e "${GREEN}✅ No preview errors${NC}"
    fi
else
    echo -e "${GREEN}✅ No preview errors${NC}"
fi

# Check build log
if [ -f "reports/build-output.log" ]; then
    if grep -q "built in" reports/build-output.log; then
        BUILD_TIME=$(grep "built in" reports/build-output.log | grep -oP '\d+\.\d+s')
        echo -e "${GREEN}✅ Last build successful${NC} (${BUILD_TIME})"
    else
        echo -e "${YELLOW}⚠️  Build log found but no success message${NC}"
    fi
fi

# Check type check log
if [ -f "reports/type-check.log" ]; then
    if grep -q "error" reports/type-check.log; then
        echo -e "${RED}❌ Type check failed${NC} - check: reports/type-check.log"
    else
        echo -e "${GREEN}✅ Type check passed${NC}"
    fi
fi

# Check screenshots
if [ -d "tests/screenshots/preview" ]; then
    SCREENSHOT_COUNT=$(find tests/screenshots/preview -name "*.png" 2>/dev/null | wc -l)
    if [ "$SCREENSHOT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Screenshots captured:${NC} $SCREENSHOT_COUNT"
    else
        echo -e "${YELLOW}⚠️  No screenshots yet${NC} - run: npm run preview:scan"
    fi
fi

echo ""
echo "================================"
echo -e "${BLUE}Quick Commands:${NC}"
echo "  npm run validate:build      - Run build validation"
echo "  npm run preview             - Start preview server"
echo "  npm run preview:scan        - Run preview tests"
echo "  ./scripts/preview-scan.sh   - Full automated scan"
echo ""
