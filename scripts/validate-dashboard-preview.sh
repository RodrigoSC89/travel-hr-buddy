#!/bin/bash

###############################################################################
# Nautilus One - Dashboard Preview Validation
# 
# Validates that the dashboard loads correctly in Lovable Preview:
# - No freezing or white screen
# - Render time < 2000ms
# - Memory usage < 500MB
# - No render loops
# - No module load failures
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎯 Nautilus One - Dashboard Preview Validation${NC}"
echo "=============================================="
echo ""
echo "Target: /dashboard route"
echo "Expected: < 2000ms render, < 500MB memory, no errors"
echo ""

# Create reports directory
mkdir -p diagnostics/dashboard-validation

# Step 1: Build verification
echo -e "${YELLOW}[1/5] Verifying build...${NC}"
if [ ! -d "dist" ]; then
  echo "Building application..."
  npm run build > diagnostics/dashboard-validation/build.log 2>&1
  echo -e "${GREEN}✅ Build completed${NC}"
else
  echo -e "${GREEN}✅ Build already exists${NC}"
fi

# Step 2: Install Playwright if needed
echo ""
echo -e "${YELLOW}[2/5] Preparing test environment...${NC}"
npx playwright install chromium --with-deps > /dev/null 2>&1
echo -e "${GREEN}✅ Test environment ready${NC}"

# Step 3: Create performance test
echo ""
echo -e "${YELLOW}[3/5] Creating dashboard performance test...${NC}"

cat > e2e/dashboard-validation.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test.describe('Dashboard Preview Validation', () => {
  test('Dashboard loads without freezing', async ({ page }) => {
    const startTime = Date.now();
    
    // Enable performance monitoring
    await page.goto('/dashboard', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Check for render
    await expect(page.locator('main, [role="main"], body')).toBeVisible({ timeout: 5000 });
    
    // Verify render time
    console.log(`Dashboard render time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  test('No console errors during load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    console.log(`Console errors detected: ${errors.length}`);
    expect(errors).toHaveLength(0);
  });

  test('Memory usage remains stable', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Wait for initial render
    await page.waitForTimeout(1000);
    
    // Get memory metrics
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        };
      }
      return null;
    });
    
    if (metrics) {
      const usedMB = metrics.usedJSHeapSize / (1024 * 1024);
      console.log(`Memory usage: ${usedMB.toFixed(2)}MB`);
      expect(usedMB).toBeLessThan(500);
    }
  });

  test('No infinite render loops', async ({ page }) => {
    const renderCounts: { [key: string]: number } = {};
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('render')) {
        renderCounts[text] = (renderCounts[text] || 0) + 1;
      }
    });
    
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Check if any component rendered more than 10 times
    const excessiveRenders = Object.entries(renderCounts).filter(
      ([_, count]) => count > 10
    );
    
    console.log(`Render loop check: ${excessiveRenders.length} excessive renders detected`);
    expect(excessiveRenders).toHaveLength(0);
  });

  test('All critical modules load', async ({ page }) => {
    const failedModules: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Failed to load')) {
        failedModules.push(msg.text());
      }
    });
    
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    console.log(`Failed module loads: ${failedModules.length}`);
    expect(failedModules).toHaveLength(0);
  });
});
EOF

echo -e "${GREEN}✅ Test created${NC}"

# Step 4: Run validation tests
echo ""
echo -e "${YELLOW}[4/5] Running dashboard validation tests...${NC}"
echo ""

if npx playwright test e2e/dashboard-validation.spec.ts --config=preview-scan.config.ts --reporter=list,json:diagnostics/dashboard-validation/results.json; then
  TEST_PASSED=true
  echo ""
  echo -e "${GREEN}✅ All validation tests passed${NC}"
else
  TEST_PASSED=false
  echo ""
  echo -e "${RED}❌ Some validation tests failed${NC}"
fi

# Step 5: Generate validation report
echo ""
echo -e "${YELLOW}[5/5] Generating validation report...${NC}"

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

cat > diagnostics/dashboard-validation/report.md << EOF
# 🎯 Dashboard Preview Validation Report

**Generated:** ${TIMESTAMP}  
**Target Route:** \`/dashboard\`  
**Status:** $(if [ "$TEST_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

---

## Validation Criteria

| Criterion | Target | Status |
|-----------|--------|--------|
| Preview loads without freezing | ✓ | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |
| No console errors | 0 errors | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |
| Memory usage | < 500MB | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |
| Render time | < 2000ms | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |
| No render loops | No loops | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |
| All modules load | No failures | $(if [ "$TEST_PASSED" = true ]; then echo "✅"; else echo "❓"; fi) |

---

## Test Results

Detailed test results available in:
- JSON: \`diagnostics/dashboard-validation/results.json\`
- HTML: \`playwright-report-preview/index.html\`
- Build log: \`diagnostics/dashboard-validation/build.log\`

---

## Next Steps

$(if [ "$TEST_PASSED" = true ]; then
  echo "✅ Dashboard is ready for deployment to Lovable Preview"
  echo ""
  echo "The dashboard passes all validation criteria:"
  echo "- Loads without freezing"
  echo "- No console errors detected"
  echo "- Memory usage within limits"
  echo "- Render time acceptable"
  echo "- No infinite loops"
  echo "- All modules load successfully"
else
  echo "⚠️ Dashboard validation failed - review test results"
  echo ""
  echo "Check the following:"
  echo "1. Review console errors in playwright report"
  echo "2. Check memory usage metrics"
  echo "3. Verify render time measurements"
  echo "4. Inspect failed module loads"
  echo "5. Review build log for warnings"
fi)

---

*Generated by Dashboard Preview Validation System*
EOF

echo -e "${GREEN}✅ Report generated${NC}"

# Display results
echo ""
echo -e "${BLUE}=============================================="
echo "🎯 Validation Complete"
echo "==============================================${NC}"
echo ""
echo "📋 Results:"
echo "  - Report: diagnostics/dashboard-validation/report.md"
echo "  - Test Results: diagnostics/dashboard-validation/results.json"
echo "  - HTML Report: playwright-report-preview/index.html"
echo "  - Build Log: diagnostics/dashboard-validation/build.log"
echo ""

# Show report
cat diagnostics/dashboard-validation/report.md

echo ""
if [ "$TEST_PASSED" = true ]; then
  echo -e "${GREEN}✅ Dashboard validation PASSED!${NC}"
  exit 0
else
  echo -e "${RED}❌ Dashboard validation FAILED - review reports for details${NC}"
  exit 1
fi
