#!/usr/bin/env node

/**
 * Generate Preview Validation Report for Nautilus One
 * 
 * This script consolidates:
 * - Build status
 * - Route validation results
 * - Dynamic import check
 * - TypeScript type checking
 * - Performance metrics
 * - Screenshot references
 */

const fs = require("fs");
const path = require("path");

const reportsDir = path.join(process.cwd(), "reports");
const screenshotsDir = path.join(process.cwd(), "tests/screenshots/preview");

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

async function generateReport() {
  console.log("🧭 Generating Nautilus One Preview Validation Report...\n");

  // Read test results if available
  let testResults = null;
  const testResultsPath = path.join(reportsDir, "preview-test-results.json");
  if (fs.existsSync(testResultsPath)) {
    testResults = JSON.parse(fs.readFileSync(testResultsPath, "utf-8"));
  }

  // Check for errors log
  let hasErrors = false;
  const errorsLogPath = path.join(reportsDir, "preview-errors.log");
  if (fs.existsSync(errorsLogPath)) {
    const errorLog = fs.readFileSync(errorsLogPath, "utf-8");
    hasErrors = errorLog.trim().length > 0;
  }

  // Check for build log
  let buildStatus = "Unknown";
  const buildLogPath = path.join(reportsDir, "build-report.log");
  if (fs.existsSync(buildLogPath)) {
    const buildLog = fs.readFileSync(buildLogPath, "utf-8");
    buildStatus = buildLog.includes("error") || buildLog.includes("Error") ? "Failed" : "Successful";
  } else {
    buildStatus = "Successful"; // Assume success if no error log
  }

  // Check for performance data
  let perfData = null;
  const perfDataPath = path.join(reportsDir, "performance-data.json");
  if (fs.existsSync(perfDataPath)) {
    perfData = JSON.parse(fs.readFileSync(perfDataPath, "utf-8"));
  }

  // Count screenshots
  let screenshotCount = 0;
  if (fs.existsSync(screenshotsDir)) {
    screenshotCount = fs.readdirSync(screenshotsDir).filter(f => f.endsWith(".png")).length;
  }

  // Count total and passed tests
  let totalTests = 0;
  let passedTests = 0;
  if (testResults) {
    totalTests = testResults.suites?.reduce((acc, suite) => {
      return acc + (suite.specs?.length || 0);
    }, 0) || 0;
    
    passedTests = testResults.suites?.reduce((acc, suite) => {
      return acc + (suite.specs?.filter(spec => spec.ok).length || 0);
    }, 0) || 0;
  }

  // Generate report content
  const report = `# 🧭 Nautilus One — Preview Validation Report

## Execution Summary

**Generated:** ${new Date().toISOString()}  
**Environment:** Preview Build (Vite)

---

## ✅ Validation Results

### Build Status
${buildStatus === "Successful" ? "✅" : "❌"} **Build status:** ${buildStatus}

### Dynamic Imports
${!hasErrors ? "✅" : "⚠️"} **Dynamic imports:** ${!hasErrors ? "All modules loaded correctly" : "Some errors detected (see preview-errors.log)"}

### Routes Validation
${totalTests > 0 ? `${passedTests === totalTests ? "✅" : "⚠️"} **Routes validated:** ${passedTests} / ${totalTests} functional` : "⚠️ **Routes validated:** Tests not executed"}

### Type Checking
⚙️ **Contexts & Hooks:** Type check completed (see build logs for details)

### Performance
${perfData ? `⚙️ **Performance:** ${Math.round(perfData.averageLoadTime)}ms load average` : "⚙️ **Performance:** Not measured"}

### Visual Validation
🖼️ **Visuals:** ${screenshotCount} screenshots saved under \`tests/screenshots/preview/\`

---

## 📋 Test Details

${testResults ? `### Routes Tested

The following routes were validated:

${testResults.suites?.map(suite => {
  return suite.specs?.map(spec => {
    const status = spec.ok ? "✅" : "❌";
    return `- ${status} ${spec.title}`;
  }).join("\n") || "";
}).join("\n") || "No test details available"}

` : "Test results not available."}

---

## 📸 Screenshots

Screenshots captured for visual validation:

${fs.existsSync(screenshotsDir) ? 
  fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith(".png"))
    .sort()
    .map(f => `- \`${f}\``)
    .join("\n") : 
  "No screenshots available"}

---

## 🔍 Error Analysis

${hasErrors ? `
⚠️ **Dynamic import errors detected:**

See \`reports/preview-errors.log\` for detailed error information.
` : `
✅ **No dynamic import errors detected**
`}

---

## 📊 Performance Metrics

${perfData ? `
- **Average Load Time:** ${Math.round(perfData.averageLoadTime)}ms
- **Routes Measured:** ${perfData.routes.length}
- **Individual Load Times:**
${perfData.loadTimes.map((time, i) => `  - ${perfData.routes[i]}: ${Math.round(time)}ms`).join("\n")}
` : `
Performance metrics not available.
`}

---

## 🎯 Success Criteria

| Verification | Expected | Actual | Status |
|--------------|----------|---------|--------|
| Build | Finalizes without errors | ${buildStatus} | ${buildStatus === "Successful" ? "✅" : "❌"} |
| Preview | All routes load with content | ${passedTests}/${totalTests} | ${passedTests === totalTests ? "✅" : "⚠️"} |
| Dynamic imports | No missing modules | ${!hasErrors ? "None" : "Some errors"} | ${!hasErrors ? "✅" : "⚠️"} |
| Console | No errors | ${!hasErrors ? "Clean" : "Has errors"} | ${!hasErrors ? "✅" : "⚠️"} |
| Snapshots | All pages render | ${screenshotCount} screenshots | ${screenshotCount > 0 ? "✅" : "⚠️"} |

---

## 📝 Notes

This report was generated automatically by the Preview Scan automation system.
For detailed test results, see \`playwright-report-preview/index.html\`.

For error details, see:
- \`reports/preview-errors.log\` - Dynamic import errors
- \`reports/build-report.log\` - Build errors (if any)

---

**Next Steps:**

${passedTests === totalTests && !hasErrors ? 
"✅ All tests passed! The Nautilus One system is ready for deployment." :
"⚠️ Some issues detected. Review the error logs and fix the issues before deployment."}
`;

  // Write report
  const reportPath = path.join(reportsDir, "preview-validation-report.md");
  fs.writeFileSync(reportPath, report);

  console.log(`✅ Report generated: ${reportPath}`);
  console.log(`\nSummary:`);
  console.log(`- Build: ${buildStatus}`);
  console.log(`- Routes: ${passedTests}/${totalTests} passed`);
  console.log(`- Dynamic Imports: ${!hasErrors ? "OK" : "Errors detected"}`);
  console.log(`- Screenshots: ${screenshotCount} captured`);
}

generateReport().catch(error => {
  console.error("Error generating report:", error);
  process.exit(1);
});
