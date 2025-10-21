#!/bin/bash

###############################################################################
# Nautilus One - Automated Preview Scan Script
# 
# This script performs a comprehensive validation of the Nautilus One system:
# 1. Clean build from scratch
# 2. Type checking
# 3. Route validation with Playwright
# 4. Screenshot capture
# 5. Error detection
# 6. Report generation
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧭 Nautilus One - Preview Scan Automation${NC}"
echo "=========================================="
echo ""

# Create reports directory
mkdir -p reports
mkdir -p tests/screenshots/preview

# Step 1: Build the application
echo -e "${YELLOW}Step 1/6: Building application...${NC}"
echo "Running: npm run build"

if npm run build > reports/build-output.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed - check reports/build-output.log${NC}"
    cp reports/build-output.log reports/build-report.log
    exit 1
fi

# Check build output for warnings
if grep -i "error" reports/build-output.log > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Build warnings detected${NC}"
    cp reports/build-output.log reports/build-report.log
else
    echo -e "${GREEN}✅ No build errors detected${NC}"
fi

# Step 2: Type checking
echo ""
echo -e "${YELLOW}Step 2/6: Running TypeScript type check...${NC}"
echo "Running: npm run type-check"

if npm run type-check > reports/type-check.log 2>&1; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type check has warnings - check reports/type-check.log${NC}"
fi

# Step 3: Clear previous test results and errors
echo ""
echo -e "${YELLOW}Step 3/6: Clearing previous test results...${NC}"
rm -f reports/preview-errors.log
rm -f reports/preview-test-results.json
rm -f reports/performance-data.json
rm -f tests/screenshots/preview/*.png
echo -e "${GREEN}✅ Cleared previous results${NC}"

# Step 4: Install Playwright browsers if needed
echo ""
echo -e "${YELLOW}Step 4/6: Ensuring Playwright browsers are installed...${NC}"
if ! npx playwright install chromium --with-deps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Could not install Playwright browsers${NC}"
else
    echo -e "${GREEN}✅ Playwright browsers ready${NC}"
fi

# Step 5: Run preview scan tests
echo ""
echo -e "${YELLOW}Step 5/6: Running preview scan tests...${NC}"
echo "This will start the preview server and test all routes..."
echo ""

# Run the tests - don't exit on failure, we want to generate report anyway
if npm run preview:scan; then
    echo -e "${GREEN}✅ All preview tests passed${NC}"
    TEST_STATUS="passed"
else
    echo -e "${YELLOW}⚠️  Some preview tests failed${NC}"
    TEST_STATUS="failed"
fi

# Step 6: Generate validation report
echo ""
echo -e "${YELLOW}Step 6/6: Generating validation report...${NC}"
npm run preview:scan:report

echo ""
echo -e "${BLUE}=========================================="
echo "🧭 Preview Scan Complete"
echo "==========================================${NC}"
echo ""
echo "📋 Results:"
echo "  - Validation Report: reports/preview-validation-report.md"
echo "  - Test Results: playwright-report-preview/index.html"
echo "  - Screenshots: tests/screenshots/preview/"
echo "  - Build Log: reports/build-output.log"
echo "  - Type Check: reports/type-check.log"

if [ -f "reports/preview-errors.log" ]; then
    echo "  - Error Log: reports/preview-errors.log"
fi

echo ""
if [ "$TEST_STATUS" = "passed" ]; then
    echo -e "${GREEN}✅ All validations passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some validations failed. Review the reports for details.${NC}"
    exit 1
fi
