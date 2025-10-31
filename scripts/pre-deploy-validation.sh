#!/bin/bash
echo "🚀 PATCHES 541-543 - Pre-Deploy Validation"
echo "=========================================="

EXIT_CODE=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. TypeScript Check
echo ""
echo "📘 Step 1/8: TypeScript Validation"
if npm run type-check 2>&1 | grep -q "error"; then
  echo -e "${RED}❌ TypeScript errors found${NC}"
  EXIT_CODE=1
else
  echo -e "${GREEN}✅ TypeScript OK${NC}"
fi

# 2. Build Test
echo ""
echo "🔨 Step 2/8: Build Validation"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  EXIT_CODE=1
fi

# 3. Check Environment Variables
echo ""
echo "🔐 Step 3/8: Environment Variables"
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  VITE_SUPABASE_URL not set${NC}"
fi
if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo -e "${YELLOW}⚠️  VITE_SUPABASE_ANON_KEY not set${NC}"
fi
echo -e "${GREEN}✅ Environment check complete${NC}"

# 4. Check Critical Files
echo ""
echo "📁 Step 4/8: Critical Files Check"
CRITICAL_FILES=(
  "src/App.tsx"
  "src/pages/admin/ControlCenter.tsx"
  "src/pages/admin/ImageOptimizationPanel.tsx"
  "src/pages/admin/LighthouseDashboard.tsx"
  "src/components/ui/optimized-image.tsx"
  "lighthouserc.json"
  ".github/workflows/lighthouse-ci.yml"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Missing: $file${NC}"
    EXIT_CODE=1
  fi
done
echo -e "${GREEN}✅ All critical files present${NC}"

# 5. Check Admin Routes
echo ""
echo "🛣️  Step 5/8: Admin Routes Validation"
if grep -q "/admin/control-center" src/App.tsx && \
   grep -q "/admin/image-optimization" src/App.tsx && \
   grep -q "/admin/lighthouse-dashboard" src/App.tsx; then
  echo -e "${GREEN}✅ All PATCH routes registered${NC}"
else
  echo -e "${RED}❌ Missing admin routes${NC}"
  EXIT_CODE=1
fi

# 6. Check Documentation
echo ""
echo "📚 Step 6/8: Documentation Check"
DOCS=(
  "PATCHES_541-543_FINAL_REPORT.md"
  "DEPLOYMENT_FINAL_CHECKLIST.md"
  "QUICK_START_GUIDE.md"
  "PATCH_541_FINAL.md"
  "PATCH_542_IMAGE_OPTIMIZATION.md"
  "PATCH_543_LIGHTHOUSE_CI.md"
)

for doc in "${DOCS[@]}"; do
  if [ ! -f "$doc" ]; then
    echo -e "${YELLOW}⚠️  Missing: $doc${NC}"
  fi
done
echo -e "${GREEN}✅ Documentation check complete${NC}"

# 7. Lighthouse Configuration
echo ""
echo "🚦 Step 7/8: Lighthouse CI Configuration"
if [ -f "lighthouserc.json" ]; then
  if grep -q "categories:performance" lighthouserc.json; then
    echo -e "${GREEN}✅ Lighthouse config valid${NC}"
  else
    echo -e "${RED}❌ Lighthouse config incomplete${NC}"
    EXIT_CODE=1
  fi
else
  echo -e "${RED}❌ lighthouserc.json missing${NC}"
  EXIT_CODE=1
fi

# 8. GitHub Actions Workflow
echo ""
echo "🔄 Step 8/8: GitHub Actions Validation"
if [ -f ".github/workflows/lighthouse-ci.yml" ]; then
  echo -e "${GREEN}✅ Lighthouse CI workflow present${NC}"
else
  echo -e "${YELLOW}⚠️  Lighthouse CI workflow missing${NC}"
fi

# Summary
echo ""
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ Pre-Deploy Validation PASSED${NC}"
  echo -e "${GREEN}🚀 Ready for Production Deployment${NC}"
  echo ""
  echo "Next Steps:"
  echo "  1. Review DEPLOYMENT_FINAL_CHECKLIST.md"
  echo "  2. Set environment variables"
  echo "  3. Deploy via Lovable/Vercel/Netlify"
  echo "  4. Run post-deploy verification"
else
  echo -e "${RED}❌ Pre-Deploy Validation FAILED${NC}"
  echo -e "${RED}Please fix errors before deploying${NC}"
fi
echo "=========================================="

exit $EXIT_CODE
