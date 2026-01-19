#!/bin/bash

# ============================================
# Nauti One - Production Health Check
# ============================================

set -e

echo "🏥 Nauti One Production Health Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PRODUCTION_URL="https://travel-hr-buddy.lovable.app"
PREVIEW_URL="https://id-preview--ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovable.app"
SUPABASE_URL="https://vnbptmixvwropvanyhdb.supabase.co"

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN++))
}

# 1. Production URL Check
echo "📍 Checking Production URL..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    check_pass "Production site is live (HTTP $HTTP_STATUS)"
else
    check_warn "Production returned HTTP $HTTP_STATUS"
fi

# 2. Preview URL Check
echo "📍 Checking Preview URL..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    check_pass "Preview site is live (HTTP $HTTP_STATUS)"
else
    check_warn "Preview returned HTTP $HTTP_STATUS"
fi

# 3. Supabase Health Check
echo "📍 Checking Supabase..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "401" ]; then
    check_pass "Supabase API is responding (HTTP $HTTP_STATUS)"
else
    check_fail "Supabase API not responding (HTTP $HTTP_STATUS)"
fi

# 4. SSL Certificate Check
echo "📍 Checking SSL Certificate..."
if curl -s --head "$PRODUCTION_URL" | grep -q "HTTP/2"; then
    check_pass "SSL/HTTP2 enabled"
else
    check_warn "SSL check inconclusive"
fi

# 5. Response Time Check
echo "📍 Checking Response Time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$PRODUCTION_URL" 2>/dev/null || echo "99")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "9999")
if (( $(echo "$RESPONSE_TIME < 3" | bc -l 2>/dev/null || echo 0) )); then
    check_pass "Response time: ${RESPONSE_TIME}s"
else
    check_warn "Response time: ${RESPONSE_TIME}s (slow)"
fi

# 6. Build Check
echo "📍 Checking Build..."
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
    check_pass "Build exists ($BUILD_SIZE)"
else
    check_warn "No dist/ directory (run npm run build)"
fi

# 7. Dependencies Check
echo "📍 Checking Dependencies..."
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "node_modules not found"
fi

# 8. Edge Functions Check
echo "📍 Checking Edge Functions..."
EDGE_COUNT=$(find supabase/functions -maxdepth 1 -type d 2>/dev/null | wc -l)
if [ "$EDGE_COUNT" -gt 100 ]; then
    check_pass "Edge functions: $((EDGE_COUNT - 1)) configured"
else
    check_warn "Edge functions: $((EDGE_COUNT - 1)) (expected 300+)"
fi

# Summary
echo ""
echo "======================================"
echo "📊 HEALTH CHECK SUMMARY"
echo "======================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ System is HEALTHY${NC}"
    exit 0
else
    echo -e "${RED}❌ System has issues${NC}"
    exit 1
fi
