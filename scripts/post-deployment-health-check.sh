#!/bin/bash
# ============================================
# NAUTI ONE v4.0 - POST-DEPLOYMENT HEALTH CHECK
# Fase 9-10: Production Validation Script
# ============================================

set -e

echo "🏥 NAUTI ONE - POST-DEPLOYMENT HEALTH CHECK"
echo "=============================================="
echo "Date: $(date)"
echo ""

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://travel-hr-buddy.lovable.app}"
PREVIEW_URL="${PREVIEW_URL:-https://id-preview--ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovable.app}"
TARGET_URL="${1:-$PREVIEW_URL}"

echo "🎯 Target: $TARGET_URL"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️ WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️ INFO${NC}: $1"
}

# ============================================
# 1. CONNECTIVITY TESTS
# ============================================
echo ""
echo "📋 1. CONNECTIVITY TESTS"
echo "----------------------------------------"

# Test main page
if curl -sf "$TARGET_URL" > /dev/null 2>&1; then
    pass "Main page reachable"
else
    fail "Main page unreachable"
fi

# Test with timeout
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$TARGET_URL" 2>/dev/null || echo "999")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")
info "Response time: ${RESPONSE_MS}ms"

if (( $(echo "$RESPONSE_TIME < 3" | bc -l 2>/dev/null || echo 0) )); then
    pass "Response time < 3s"
else
    warn "Response time > 3s (${RESPONSE_TIME}s)"
fi

# ============================================
# 2. HTTP STATUS CHECKS
# ============================================
echo ""
echo "📋 2. HTTP STATUS CHECKS"
echo "----------------------------------------"

# Check main page status
HTTP_STATUS=$(curl -o /dev/null -s -w '%{http_code}' "$TARGET_URL" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" == "200" ]; then
    pass "HTTP 200 OK"
else
    fail "HTTP status: $HTTP_STATUS"
fi

# Check for HTTPS redirect
if [[ "$TARGET_URL" == https://* ]]; then
    pass "HTTPS enabled"
else
    warn "Not using HTTPS"
fi

# ============================================
# 3. CRITICAL ROUTES
# ============================================
echo ""
echo "📋 3. CRITICAL ROUTES"
echo "----------------------------------------"

ROUTES=(
    "/auth"
    "/central-comando/visao-geral"
)

for route in "${ROUTES[@]}"; do
    STATUS=$(curl -o /dev/null -s -w '%{http_code}' "${TARGET_URL}${route}" 2>/dev/null || echo "000")
    if [ "$STATUS" == "200" ] || [ "$STATUS" == "302" ] || [ "$STATUS" == "301" ]; then
        pass "Route $route ($STATUS)"
    else
        warn "Route $route returned $STATUS"
    fi
done

# ============================================
# 4. SSL CERTIFICATE
# ============================================
echo ""
echo "📋 4. SSL CERTIFICATE"
echo "----------------------------------------"

if [[ "$TARGET_URL" == https://* ]]; then
    DOMAIN=$(echo "$TARGET_URL" | sed 's|https://||' | sed 's|/.*||')
    
    # Check SSL expiry (basic check)
    if echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        pass "SSL certificate valid"
    else
        warn "Could not verify SSL certificate"
    fi
else
    warn "HTTPS not configured"
fi

# ============================================
# 5. PERFORMANCE BASELINE
# ============================================
echo ""
echo "📋 5. PERFORMANCE BASELINE"
echo "----------------------------------------"

# Multiple requests for average
TOTAL_TIME=0
REQUESTS=3

for i in $(seq 1 $REQUESTS); do
    TIME=$(curl -o /dev/null -s -w '%{time_total}' "$TARGET_URL" 2>/dev/null || echo "0")
    TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc 2>/dev/null || echo "0")
done

AVG_TIME=$(echo "scale=3; $TOTAL_TIME / $REQUESTS" | bc 2>/dev/null || echo "0")
info "Average response time: ${AVG_TIME}s (${REQUESTS} requests)"

if (( $(echo "$AVG_TIME < 2" | bc -l 2>/dev/null || echo 0) )); then
    pass "Average response time < 2s"
else
    warn "Average response time >= 2s"
fi

# ============================================
# 6. CONTENT VALIDATION
# ============================================
echo ""
echo "📋 6. CONTENT VALIDATION"
echo "----------------------------------------"

# Check for Nauti/Nautilus branding
CONTENT=$(curl -s "$TARGET_URL" 2>/dev/null || echo "")

if echo "$CONTENT" | grep -qi "nauti\|nautilus"; then
    pass "Branding present"
else
    warn "Branding not detected in HTML"
fi

# Check for React root
if echo "$CONTENT" | grep -q 'id="root"'; then
    pass "React root element present"
else
    warn "React root not found"
fi

# ============================================
# 7. HEADERS CHECK
# ============================================
echo ""
echo "📋 7. SECURITY HEADERS"
echo "----------------------------------------"

HEADERS=$(curl -sI "$TARGET_URL" 2>/dev/null || echo "")

# Check common security headers
if echo "$HEADERS" | grep -qi "x-frame-options\|x-content-type-options\|content-security-policy"; then
    pass "Security headers present"
else
    warn "Some security headers may be missing"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "============================================"
echo "📊 POST-DEPLOYMENT HEALTH CHECK SUMMARY"
echo "============================================"
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SCORE=$((PASSED * 100 / TOTAL))
    echo "Health Score: $SCORE%"
else
    SCORE=0
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ HEALTH CHECK PASSED${NC}"
    echo "Production deployment is healthy!"
    echo ""
    echo "🎉 NAUTI ONE is LIVE and operational!"
    exit 0
else
    echo -e "${RED}❌ HEALTH CHECK FAILED${NC}"
    echo "Please investigate failed checks."
    exit 1
fi
