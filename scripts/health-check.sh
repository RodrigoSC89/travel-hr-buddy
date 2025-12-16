#!/bin/bash

# ============================================
# Nautilus One - Health Check Script
# ============================================

set -e

echo "🏥 Nautilus One Health Check"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((CHECKS_WARNING++))
}

# 1. Check Node.js
echo -e "${BLUE}📦 Dependencies${NC}"
if command -v node &> /dev/null; then
    check_pass "Node.js $(node -v)"
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    check_pass "npm $(npm -v)"
else
    check_fail "npm not installed"
fi

# 2. Check package.json
echo ""
echo -e "${BLUE}📄 Project Files${NC}"
if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json missing"
fi

if [ -f "vite.config.ts" ]; then
    check_pass "vite.config.ts exists"
else
    check_fail "vite.config.ts missing"
fi

if [ -f "tsconfig.json" ]; then
    check_pass "tsconfig.json exists"
else
    check_fail "tsconfig.json missing"
fi

# 3. Check Supabase config
echo ""
echo -e "${BLUE}🔌 Supabase${NC}"
if [ -f "supabase/config.toml" ]; then
    check_pass "supabase/config.toml exists"
    FUNC_COUNT=$(ls -1 supabase/functions 2>/dev/null | wc -l)
    check_pass "$FUNC_COUNT Edge Functions found"
else
    check_fail "supabase/config.toml missing"
fi

# 4. Check src structure
echo ""
echo -e "${BLUE}📁 Source Structure${NC}"
if [ -d "src/modules" ]; then
    MODULE_COUNT=$(ls -1 src/modules 2>/dev/null | wc -l)
    check_pass "$MODULE_COUNT modules in src/modules"
else
    check_fail "src/modules directory missing"
fi

if [ -d "src/pages" ]; then
    PAGE_COUNT=$(find src/pages -name "*.tsx" 2>/dev/null | wc -l)
    check_pass "$PAGE_COUNT page components found"
else
    check_fail "src/pages directory missing"
fi

if [ -d "src/components" ]; then
    COMP_COUNT=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
    check_pass "$COMP_COUNT component files found"
else
    check_fail "src/components directory missing"
fi

# 5. Check node_modules
echo ""
echo -e "${BLUE}📚 Dependencies${NC}"
if [ -d "node_modules" ]; then
    check_pass "node_modules installed"
else
    check_warn "node_modules not found (run npm install)"
fi

# 6. Check build
echo ""
echo -e "${BLUE}🏗️  Build${NC}"
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    check_pass "Build exists ($BUILD_SIZE)"
else
    check_warn "No build found (run npm run build)"
fi

# 7. Check tests
echo ""
echo -e "${BLUE}🧪 Tests${NC}"
if [ -d "e2e" ]; then
    E2E_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l)
    check_pass "$E2E_COUNT E2E test files found"
else
    check_warn "No E2E tests directory"
fi

if [ -d "tests" ]; then
    TEST_COUNT=$(find tests -name "*.test.*" 2>/dev/null | wc -l)
    check_pass "$TEST_COUNT unit test files found"
else
    check_warn "No unit tests directory"
fi

# Summary
echo ""
echo "============================"
echo -e "${BLUE}📊 Summary${NC}"
echo "============================"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Health check passed!${NC}"
    exit 0
else
    echo -e "${RED}💔 Health check failed!${NC}"
    exit 1
fi
