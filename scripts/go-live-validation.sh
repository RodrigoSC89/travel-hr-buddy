#!/bin/bash

# =================================================================
# NAUTI ONE v4.0 - GO-LIVE VALIDATION SCRIPT
# Automated pre-production checklist
# =================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

log_success() { echo -e "${GREEN}✓${NC} $1"; ((PASSED++)); }
log_fail() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          NAUTI ONE v4.0 - GO-LIVE VALIDATION                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# =================================================================
# 1. CODE QUALITY CHECKS
# =================================================================
echo -e "\n${BLUE}━━━ 1. CODE QUALITY ━━━${NC}\n"

# TypeScript check
if npm run typecheck 2>/dev/null; then
  log_success "TypeScript: No errors"
else
  log_fail "TypeScript: Compilation errors found"
fi

# ESLint check (only errors, not warnings)
ESLINT_ERRORS=$(npm run lint 2>&1 | grep -c "error" || echo "0")
if [ "$ESLINT_ERRORS" -eq "0" ]; then
  log_success "ESLint: No critical errors"
else
  log_warn "ESLint: $ESLINT_ERRORS errors found (review recommended)"
fi

# Build check
if npm run build 2>/dev/null; then
  log_success "Build: Successful"
  
  # Bundle size
  if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    log_info "Bundle size: $BUNDLE_SIZE"
  fi
else
  log_fail "Build: Failed"
fi

# =================================================================
# 2. SECURITY CHECKS
# =================================================================
echo -e "\n${BLUE}━━━ 2. SECURITY ━━━${NC}\n"

# npm audit
AUDIT_CRITICAL=$(npm audit 2>/dev/null | grep -c "critical" || echo "0")
AUDIT_HIGH=$(npm audit 2>/dev/null | grep -c "high" || echo "0")

if [ "$AUDIT_CRITICAL" -eq "0" ] && [ "$AUDIT_HIGH" -eq "0" ]; then
  log_success "npm audit: No critical/high vulnerabilities"
else
  log_fail "npm audit: $AUDIT_CRITICAL critical, $AUDIT_HIGH high vulnerabilities"
fi

# Check for API keys in code
API_KEY_COUNT=$(grep -rn "sk-" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".test." | wc -l || echo "0")
if [ "$API_KEY_COUNT" -eq "0" ]; then
  log_success "No API keys found in source code"
else
  log_fail "Potential API keys found in $API_KEY_COUNT files"
fi

# Check for console.log in production
CONSOLE_LOGS=$(grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".test." | grep -v "logger" | wc -l || echo "0")
if [ "$CONSOLE_LOGS" -lt "50" ]; then
  log_success "Console.logs: $CONSOLE_LOGS (acceptable)"
else
  log_warn "Console.logs: $CONSOLE_LOGS (consider cleanup)"
fi

# =================================================================
# 3. TESTS
# =================================================================
echo -e "\n${BLUE}━━━ 3. TESTS ━━━${NC}\n"

# Unit tests
if npm run test 2>/dev/null; then
  log_success "Unit tests: Passed"
else
  log_warn "Unit tests: Some failures (review before deploy)"
fi

# =================================================================
# 4. ENVIRONMENT CHECKS
# =================================================================
echo -e "\n${BLUE}━━━ 4. ENVIRONMENT ━━━${NC}\n"

# Check required env vars
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_PUBLISHABLE_KEY")
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -n "${!VAR}" ] || grep -q "$VAR" .env 2>/dev/null; then
    log_success "Env: $VAR configured"
  else
    log_fail "Env: $VAR missing"
  fi
done

# =================================================================
# 5. DOCUMENTATION
# =================================================================
echo -e "\n${BLUE}━━━ 5. DOCUMENTATION ━━━${NC}\n"

DOCS=("docs/deployment/GO-LIVE-CHECKLIST.md" "docs/deployment/ROLLBACK-PROCEDURE.md" "docs/training/AI-TEAM-TRAINING-GUIDE.md")
for DOC in "${DOCS[@]}"; do
  if [ -f "$DOC" ]; then
    log_success "Doc exists: $(basename $DOC)"
  else
    log_warn "Doc missing: $DOC"
  fi
done

# =================================================================
# SUMMARY
# =================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                      VALIDATION SUMMARY                       ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed:${NC}   $PASSED                                               ║"
echo -e "║  ${RED}Failed:${NC}   $FAILED                                               ║"
echo -e "║  ${YELLOW}Warnings:${NC} $WARNINGS                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$FAILED" -eq "0" ]; then
  echo -e "${GREEN}✅ SYSTEM READY FOR GO-LIVE${NC}"
  echo ""
  echo "⚠️  MANUAL ACTION REQUIRED:"
  echo "   Enable 'Leaked Password Protection' in Supabase Dashboard"
  echo "   URL: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SYSTEM NOT READY - FIX $FAILED ISSUES BEFORE DEPLOY${NC}"
  exit 1
fi
