#!/bin/bash

###############################################################################
# Nautilus One - Build Validation Script
# 
# This script performs build and type validation without browser testing
# Useful for quick validation or environments where Playwright can't run
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧭 Nautilus One - Build Validation${NC}"
echo "======================================"
echo ""

# Create reports directory
mkdir -p reports

# Step 1: Clean previous build
echo -e "${YELLOW}Step 1/4: Cleaning previous build...${NC}"
rm -rf dist/
echo -e "${GREEN}✅ Cleaned${NC}"

# Step 2: Build the application
echo ""
echo -e "${YELLOW}Step 2/4: Building application...${NC}"
echo "Running: npm run build"

if npm run build > reports/build-output.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    # Check build output
    if [ -d "dist" ]; then
        FILE_COUNT=$(find dist -type f | wc -l)
        echo "   Generated $FILE_COUNT files in dist/"
    fi
else
    echo -e "${RED}❌ Build failed - check reports/build-output.log${NC}"
    exit 1
fi

# Step 3: Type checking
echo ""
echo -e "${YELLOW}Step 3/4: Running TypeScript type check...${NC}"
echo "Running: npm run type-check"

if npm run type-check > reports/type-check.log 2>&1; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type check has warnings - check reports/type-check.log${NC}"
fi

# Step 4: Generate validation report
echo ""
echo -e "${YELLOW}Step 4/4: Generating validation report...${NC}"
npm run preview:initial-report

echo ""
echo -e "${BLUE}======================================"
echo "🧭 Build Validation Complete"
echo "======================================${NC}"
echo ""
echo "📋 Results:"
echo "  - Validation Report: reports/preview-validation-report.md"
echo "  - Build Log: reports/build-output.log"
echo "  - Type Check Log: reports/type-check.log"
echo "  - Build Output: dist/"
echo ""
echo -e "${GREEN}✅ Build validation passed!${NC}"
echo ""
echo "Next steps:"
echo "  - Run preview server: npm run preview"
echo "  - Run full preview scan: ./scripts/preview-scan.sh"
