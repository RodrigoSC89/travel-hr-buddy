#!/bin/bash
# ============================================
# PATCH 658 - Route Validation Script
# Validates that all routes referenced in code are properly registered
# ============================================

echo "🔍 NAUTILUS ROUTE VALIDATION"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BROKEN_ROUTES=0
WARNINGS=0

echo -e "${BLUE}📊 Analyzing Routes...${NC}"
echo ""

# ============================================
# 1. EXTRACT ROUTES FROM MODULE REGISTRY
# ============================================
echo -e "${BLUE}🗂️  Registered Routes in MODULE_REGISTRY${NC}"
echo "----------------------------------------"

# Extract routes from registry (simple grep approach)
REGISTERED_ROUTES=$(grep 'route: "/' src/modules/registry.ts | sed 's/.*route: "\([^"]*\)".*/\1/' | sort -u)
REGISTERED_COUNT=$(echo "$REGISTERED_ROUTES" | wc -l)

echo "Found $REGISTERED_COUNT registered routes:"
echo "$REGISTERED_ROUTES" | head -20
echo ""

# ============================================
# 2. EXTRACT ROUTES FROM CODE
# ============================================
echo -e "${BLUE}🔗 Routes Referenced in Code${NC}"
echo "----------------------------------------"

# Find all Link to="/..." and navigate("/...")
LINKED_ROUTES=$(grep -r 'to="/' src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | \
  sed 's/.*to="\([^"]*\)".*/\1/' | \
  grep -v 'className\|onClick\|{' | \
  sort -u)

NAVIGATE_ROUTES=$(grep -r 'navigate("/' src/ --include="*.tsx" --include="*.ts" 2>/dev/null | \
  sed 's/.*navigate("\([^"]*\)").*/\1/' | \
  grep -v 'template\|${' | \
  sort -u)

# Combine and deduplicate
REFERENCED_ROUTES=$(echo -e "$LINKED_ROUTES\n$NAVIGATE_ROUTES" | sort -u | grep -v '^$')
REFERENCED_COUNT=$(echo "$REFERENCED_ROUTES" | wc -l)

echo "Found $REFERENCED_COUNT routes referenced in code"
echo ""

# ============================================
# 3. COMPARE AND FIND BROKEN ROUTES
# ============================================
echo -e "${BLUE}🚨 Broken Routes Analysis${NC}"
echo "----------------------------------------"

echo "Checking for unregistered routes..."
echo ""

# Check each referenced route against registered routes
while IFS= read -r route; do
  # Skip empty or special routes
  if [ -z "$route" ] || [[ "$route" =~ \$ ]] || [[ "$route" =~ \{ ]]; then
    continue
  fi
  
  # Check if route is registered (exact match or parent route)
  IS_REGISTERED=false
  
  # Check exact match
  if echo "$REGISTERED_ROUTES" | grep -q "^${route}$"; then
    IS_REGISTERED=true
  fi
  
  # Check if it's an admin/* route (handled by admin component)
  if [[ "$route" == "/admin" ]] || [[ "$route" == "/admin/"* ]]; then
    # Admin routes are handled by Admin.tsx which has wildcard routing
    IS_REGISTERED=true
  fi
  
  # Check if it's auth route (handled separately)
  if [[ "$route" == "/auth"* ]] || [[ "$route" == "/unauthorized" ]]; then
    IS_REGISTERED=true
  fi
  
  # Check if it's health or core route
  if [[ "$route" == "/health" ]] || [[ "$route" == "/settings" ]]; then
    IS_REGISTERED=true
  fi
  
  if [ "$IS_REGISTERED" = false ]; then
    echo -e "${RED}❌ BROKEN:${NC} $route"
    
    # Find where it's referenced
    REFERENCES=$(grep -r "\"$route\"" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | head -3)
    echo "   Referenced in:"
    echo "$REFERENCES" | sed 's/^/     /'
    echo ""
    
    BROKEN_ROUTES=$((BROKEN_ROUTES + 1))
  fi
done <<< "$REFERENCED_ROUTES"

if [ $BROKEN_ROUTES -eq 0 ]; then
  echo -e "${GREEN}✅ No broken routes detected!${NC}"
else
  echo -e "${RED}Found $BROKEN_ROUTES broken routes!${NC}"
fi

echo ""

# ============================================
# 4. CHECK FOR ORPHANED ROUTES
# ============================================
echo -e "${BLUE}👻 Orphaned Routes (Registered but not used)${NC}"
echo "----------------------------------------"

ORPHANED=0

while IFS= read -r route; do
  if [ -z "$route" ]; then
    continue
  fi
  
  # Check if route is referenced in code
  if ! grep -rq "\"$route\"" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  ORPHANED:${NC} $route"
    ORPHANED=$((ORPHANED + 1))
  fi
done <<< "$REGISTERED_ROUTES"

if [ $ORPHANED -eq 0 ]; then
  echo -e "${GREEN}✅ No orphaned routes${NC}"
else
  echo -e "${YELLOW}Found $ORPHANED orphaned routes (registered but not used)${NC}"
  echo "These routes may be valid but not yet linked in UI"
fi

echo ""

# ============================================
# 5. VALIDATION SCORE
# ============================================
echo -e "${BLUE}📊 Route Validation Score${NC}"
echo "----------------------------------------"

SCORE=100
SCORE=$((SCORE - BROKEN_ROUTES * 5))
SCORE=$((SCORE - ORPHANED * 2))

if [ $SCORE -ge 95 ]; then
  echo -e "Score: ${GREEN}$SCORE/100${NC} - Excellent ✨"
  STATUS="PASS"
elif [ $SCORE -ge 80 ]; then
  echo -e "Score: ${BLUE}$SCORE/100${NC} - Good 👍"
  STATUS="PASS"
elif [ $SCORE -ge 60 ]; then
  echo -e "Score: ${YELLOW}$SCORE/100${NC} - Needs Improvement ⚠️"
  STATUS="WARNING"
else
  echo -e "Score: ${RED}$SCORE/100${NC} - Critical Issues 🔴"
  STATUS="FAIL"
fi

echo ""
echo "Summary:"
echo "  Registered routes: $REGISTERED_COUNT"
echo "  Referenced routes: $REFERENCED_COUNT"
echo "  Broken routes: $BROKEN_ROUTES"
echo "  Orphaned routes: $ORPHANED"
echo ""

if [ "$STATUS" = "FAIL" ]; then
  echo -e "${RED}❌ Route validation FAILED${NC}"
  echo "Please fix broken routes before deployment!"
  exit 1
elif [ "$STATUS" = "WARNING" ]; then
  echo -e "${YELLOW}⚠️  Route validation has warnings${NC}"
  echo "Consider fixing issues before deployment"
  exit 0
else
  echo -e "${GREEN}✅ Route validation PASSED${NC}"
  exit 0
fi
