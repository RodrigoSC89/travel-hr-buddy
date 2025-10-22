#!/bin/bash
# PATCH_25.2 Verification Script
# This script verifies that all PATCH_25.2 changes are properly implemented

echo "🔍 PATCH_25.2 Verification Script"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for checks
total_checks=0
passed_checks=0

# Function to check and report
check() {
  total_checks=$((total_checks + 1))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    passed_checks=$((passed_checks + 1))
  else
    echo -e "${RED}✗${NC} $2"
  fi
}

# 1. Check vercel.json exists and has required fields
echo "📋 Checking vercel.json..."
if [ -f "vercel.json" ]; then
  grep -q '"version": 2' vercel.json
  check $? "vercel.json has version 2"
  
  grep -q '"builds"' vercel.json
  check $? "vercel.json has builds configuration"
  
  grep -q '"@vercel/static"' vercel.json
  check $? "vercel.json uses @vercel/static"
  
  grep -q '"env"' vercel.json
  check $? "vercel.json has env section"
  
  grep -q 'VITE_APP_URL' vercel.json
  check $? "vercel.json has VITE_APP_URL"
  
  grep -q 'VITE_ENABLE_SAFE_LAZY_IMPORT' vercel.json
  check $? "vercel.json has VITE_ENABLE_SAFE_LAZY_IMPORT"
else
  check 1 "vercel.json exists"
fi
echo ""

# 2. Check fix script exists and is executable
echo "🛠️ Checking fix-vercel-preview.sh..."
if [ -f "scripts/fix-vercel-preview.sh" ]; then
  check 0 "scripts/fix-vercel-preview.sh exists"
  
  if [ -x "scripts/fix-vercel-preview.sh" ]; then
    check 0 "scripts/fix-vercel-preview.sh is executable"
  else
    check 1 "scripts/fix-vercel-preview.sh is executable"
  fi
  
  # Check script has required sections
  grep -q "Limpeza completa" scripts/fix-vercel-preview.sh
  check $? "Script has cache cleaning section"
  
  grep -q "Verifica variáveis" scripts/fix-vercel-preview.sh
  check $? "Script has env var verification"
  
  grep -q "npm install" scripts/fix-vercel-preview.sh
  check $? "Script has dependency installation"
  
  grep -q "npm run build" scripts/fix-vercel-preview.sh
  check $? "Script has build command"
else
  check 1 "scripts/fix-vercel-preview.sh exists"
fi
echo ""

# 3. Check vite.config.ts has required configurations
echo "⚙️ Checking vite.config.ts..."
if [ -f "vite.config.ts" ]; then
  check 0 "vite.config.ts exists"
  
  grep -q 'include.*mqtt' vite.config.ts
  check $? "vite.config.ts has mqtt in optimizeDeps"
  
  grep -q '@supabase/supabase-js' vite.config.ts
  check $? "vite.config.ts has @supabase/supabase-js in optimizeDeps"
  
  grep -q 'react-router-dom' vite.config.ts
  check $? "vite.config.ts has react-router-dom in optimizeDeps"
  
  grep -q 'hmr.*overlay.*false' vite.config.ts
  check $? "vite.config.ts has HMR overlay disabled"
  
  grep -q 'LOVABLE_FULL_PREVIEW' vite.config.ts
  check $? "vite.config.ts has LOVABLE_FULL_PREVIEW defined"
else
  check 1 "vite.config.ts exists"
fi
echo ""

# 4. Check documentation files exist
echo "📚 Checking documentation..."
if [ -f "PATCH_25.2_IMPLEMENTATION_COMPLETE.md" ]; then
  check 0 "PATCH_25.2_IMPLEMENTATION_COMPLETE.md exists"
else
  check 1 "PATCH_25.2_IMPLEMENTATION_COMPLETE.md exists"
fi

if [ -f "PATCH_25.2_QUICKREF.md" ]; then
  check 0 "PATCH_25.2_QUICKREF.md exists"
else
  check 1 "PATCH_25.2_QUICKREF.md exists"
fi

if [ -f "PATCH_25.2_VISUAL_SUMMARY.md" ]; then
  check 0 "PATCH_25.2_VISUAL_SUMMARY.md exists"
else
  check 1 "PATCH_25.2_VISUAL_SUMMARY.md exists"
fi
echo ""

# 5. Check build directory and files
echo "🏗️ Checking build output..."
if [ -d "dist" ]; then
  check 0 "dist directory exists"
  
  if [ -f "dist/index.html" ]; then
    check 0 "dist/index.html exists"
  else
    check 1 "dist/index.html exists"
  fi
  
  if [ -d "dist/assets" ]; then
    check 0 "dist/assets directory exists"
  else
    check 1 "dist/assets directory exists"
  fi
else
  check 1 "dist directory exists"
  echo -e "${YELLOW}  Note: Run 'npm run build' to generate dist folder${NC}"
fi
echo ""

# 6. Check package.json has required scripts
echo "📦 Checking package.json..."
if [ -f "package.json" ]; then
  check 0 "package.json exists"
  
  grep -q '"build".*vite build' package.json
  check $? "package.json has build script"
  
  grep -q '"preview"' package.json
  check $? "package.json has preview script"
else
  check 1 "package.json exists"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="
echo -e "Total checks: ${total_checks}"
echo -e "Passed: ${GREEN}${passed_checks}${NC}"
echo -e "Failed: ${RED}$((total_checks - passed_checks))${NC}"
echo ""

if [ $passed_checks -eq $total_checks ]; then
  echo -e "${GREEN}✅ All checks passed! PATCH_25.2 is properly implemented.${NC}"
  echo ""
  echo "🚀 Next steps:"
  echo "  1. Configure environment variables in Vercel dashboard"
  echo "  2. Run: bash scripts/fix-vercel-preview.sh"
  echo "  3. Deploy to Vercel"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review the implementation.${NC}"
  echo ""
  echo "📖 For help, see:"
  echo "  - PATCH_25.2_IMPLEMENTATION_COMPLETE.md"
  echo "  - PATCH_25.2_QUICKREF.md"
  exit 1
fi
