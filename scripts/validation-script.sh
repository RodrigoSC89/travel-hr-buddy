#!/bin/bash

# ============================================
# NAUTILUS ONE - PRODUCTION VALIDATION SCRIPT
# ============================================
# Version: 3.2.0
# Last Updated: 2025-01-04

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPORT_FILE="validation-report-$(date +%Y%m%d-%H%M%S).md"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NAUTILUS ONE - PRODUCTION VALIDATION        ║${NC}"
echo -e "${BLUE}║  Version 3.2.0                                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# 📊 Nautilus One - Validation Report
**Generated:** $(date)
**Version:** v3.2.0

---

EOF

# ============================================
# PHASE 1: CODE AUDIT
# ============================================
echo -e "${YELLOW}▶ PHASE 1: CODE AUDIT${NC}"
echo "" >> "$REPORT_FILE"
echo "## 🔍 Phase 1: Code Audit" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# TypeScript Check
echo -n "  Checking TypeScript... "
if npm run typecheck 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] TypeScript: No errors" >> "$REPORT_FILE"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "- [ ] TypeScript: Errors found" >> "$REPORT_FILE"
fi

# Build Check
echo -n "  Building project... "
if npm run build 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] Build: Successful" >> "$REPORT_FILE"
    
    # Bundle size check
    BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    echo "- Bundle size: $BUNDLE_SIZE" >> "$REPORT_FILE"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "- [ ] Build: Failed" >> "$REPORT_FILE"
fi

# Lint Check
echo -n "  Running ESLint... "
if npm run lint 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] Linting: No issues" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ WARNINGS${NC}"
    echo "- [ ] Linting: Warnings found" >> "$REPORT_FILE"
fi

# Test Check
echo -n "  Running tests... "
if npm run test 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] Tests: All passing" >> "$REPORT_FILE"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "- [ ] Tests: Some failing" >> "$REPORT_FILE"
fi

# Security Check
echo -n "  Running security audit... "
AUDIT_RESULT=$(npm audit --json 2>/dev/null || true)
CRITICAL=$(echo "$AUDIT_RESULT" | grep -o '"critical":[0-9]*' | cut -d: -f2 || echo "0")
HIGH=$(echo "$AUDIT_RESULT" | grep -o '"high":[0-9]*' | cut -d: -f2 || echo "0")

if [ "$CRITICAL" == "0" ] && [ "$HIGH" == "0" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] Security: 0 critical/high vulnerabilities" >> "$REPORT_FILE"
else
    echo -e "${RED}✗ FAIL (Critical: $CRITICAL, High: $HIGH)${NC}"
    echo "- [ ] Security: Critical: $CRITICAL, High: $HIGH" >> "$REPORT_FILE"
fi

echo ""

# ============================================
# PHASE 2: PERFORMANCE CHECK
# ============================================
echo -e "${YELLOW}▶ PHASE 2: PERFORMANCE CHECK${NC}"
echo "" >> "$REPORT_FILE"
echo "## ⚡ Phase 2: Performance" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check if Lighthouse is available
echo -n "  Checking Lighthouse availability... "
if command -v lighthouse &> /dev/null; then
    echo -e "${GREEN}✓ Available${NC}"
    echo "- [x] Lighthouse CLI: Available" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "- [ ] Lighthouse CLI: Not installed (npm i -g lighthouse)" >> "$REPORT_FILE"
fi

# Bundle analysis
echo -n "  Analyzing bundle size... "
if [ -d "dist" ]; then
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    JS_SIZE=$(find dist -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
    echo -e "${GREEN}Done${NC}"
    echo "- Total Bundle: $TOTAL_SIZE" >> "$REPORT_FILE"
    echo "- JavaScript: $JS_SIZE" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ No dist folder${NC}"
    echo "- [ ] Bundle: Run 'npm run build' first" >> "$REPORT_FILE"
fi

echo ""

# ============================================
# PHASE 3: SECURITY SCAN
# ============================================
echo -e "${YELLOW}▶ PHASE 3: SECURITY SCAN${NC}"
echo "" >> "$REPORT_FILE"
echo "## 🔒 Phase 3: Security" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for .env files
echo -n "  Checking for exposed secrets... "
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}✗ FAIL - .env files tracked${NC}"
    echo "- [ ] Secrets: .env files in git" >> "$REPORT_FILE"
else
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] Secrets: No .env files tracked" >> "$REPORT_FILE"
fi

# Check .gitignore
echo -n "  Checking .gitignore... "
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "- [x] .gitignore: Properly configured" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "- [ ] .gitignore: Add .env entries" >> "$REPORT_FILE"
fi

# Snyk check
echo -n "  Checking Snyk availability... "
if command -v snyk &> /dev/null; then
    echo -e "${GREEN}✓ Available${NC}"
    echo "- [x] Snyk: Available for deep scan" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "- [ ] Snyk: Not installed (npm i -g snyk)" >> "$REPORT_FILE"
fi

echo ""

# ============================================
# PHASE 4: DOCUMENTATION CHECK
# ============================================
echo -e "${YELLOW}▶ PHASE 4: DOCUMENTATION${NC}"
echo "" >> "$REPORT_FILE"
echo "## 📚 Phase 4: Documentation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check README
echo -n "  Checking README... "
if [ -f "README.md" ]; then
    README_LINES=$(wc -l < README.md)
    echo -e "${GREEN}✓ Exists ($README_LINES lines)${NC}"
    echo "- [x] README.md: $README_LINES lines" >> "$REPORT_FILE"
else
    echo -e "${RED}✗ Missing${NC}"
    echo "- [ ] README.md: Missing" >> "$REPORT_FILE"
fi

# Check docs folder
echo -n "  Checking docs folder... "
if [ -d "docs" ]; then
    DOC_COUNT=$(find docs -name "*.md" | wc -l)
    echo -e "${GREEN}✓ Exists ($DOC_COUNT files)${NC}"
    echo "- [x] Docs folder: $DOC_COUNT markdown files" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Missing${NC}"
    echo "- [ ] Docs folder: Not found" >> "$REPORT_FILE"
fi

# Check Storybook
echo -n "  Checking Storybook... "
if [ -d "src/stories" ]; then
    STORY_COUNT=$(find src/stories -name "*.stories.tsx" | wc -l)
    echo -e "${GREEN}✓ Exists ($STORY_COUNT stories)${NC}"
    echo "- [x] Storybook: $STORY_COUNT component stories" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ Missing${NC}"
    echo "- [ ] Storybook: Not configured" >> "$REPORT_FILE"
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    SUMMARY                     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## ✅ Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Report generated at: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Next Steps" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. Fix any failing checks above" >> "$REPORT_FILE"
echo "2. Run \`npm audit fix\` for security issues" >> "$REPORT_FILE"
echo "3. Run Lighthouse for performance metrics" >> "$REPORT_FILE"
echo "4. Complete UX/UI manual testing" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "*Nautilus One v3.2.0 - Production Validation*" >> "$REPORT_FILE"

echo ""
echo -e "${GREEN}✓ Report saved to: $REPORT_FILE${NC}"
echo ""
echo -e "Run ${YELLOW}cat $REPORT_FILE${NC} to view the full report"
echo ""
