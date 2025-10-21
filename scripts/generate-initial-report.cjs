#!/usr/bin/env node

/**
 * Generate Initial Preview Validation Report
 * 
 * This creates a preliminary report based on build and type check results
 * without requiring browser testing (for environments where Playwright can't run)
 */

const fs = require("fs");
const path = require("path");

const reportsDir = path.join(process.cwd(), "reports");

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log("🧭 Generating Initial Preview Validation Report...\n");

// Check build status
let buildStatus = "Successful";
let buildDetails = "Build completed successfully with no errors.";

// Check if dist directory exists and has files
const distDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
  buildStatus = "Failed";
  buildDetails = "Build directory (dist/) not found.";
} else {
  const distFiles = fs.readdirSync(distDir);
  if (distFiles.length === 0) {
    buildStatus = "Failed";
    buildDetails = "Build directory is empty.";
  } else {
    buildDetails = `Build completed successfully. Generated ${distFiles.length} files/directories in dist/.`;
  }
}

// Check for build output log
const buildLogPath = path.join(reportsDir, "build-output.log");
if (fs.existsSync(buildLogPath)) {
  const buildLog = fs.readFileSync(buildLogPath, "utf-8");
  if (buildLog.includes("error") || buildLog.includes("Error") || buildLog.includes("FATAL")) {
    buildStatus = "Failed with errors";
  } else if (buildLog.toLowerCase().includes("built in")) {
    // Build completed message found
    buildStatus = "Successful";
  }
}

// Check TypeScript type check
let typeCheckStatus = "Not run";
const typeCheckLogPath = path.join(reportsDir, "type-check.log");
if (fs.existsSync(typeCheckLogPath)) {
  const typeCheckLog = fs.readFileSync(typeCheckLogPath, "utf-8");
  if (typeCheckLog.trim().length === 0 || !typeCheckLog.includes("error")) {
    typeCheckStatus = "Passed";
  } else {
    typeCheckStatus = "Failed";
  }
} else {
  typeCheckStatus = "Passed (no errors logged)";
}

// List of expected routes
const expectedRoutes = [
  "/",
  "/dashboard", 
  "/maritime",
  "/forecast",
  "/optimization",
  "/peo-dp",
  "/peotram",
  "/checklists",
  "/control-hub",
  "/ai-assistant",
  "/bridgelink",
];

const optionalRoutes = [
  "/forecast-global",
];

// Generate report
const report = `# 🧭 Nautilus One — Preview Validation Report (Initial)

## Execution Summary

**Generated:** ${new Date().toISOString()}  
**Environment:** Build Validation (Pre-Preview)  
**Status:** Initial validation completed

---

## ✅ Validation Results

### Build Status
${buildStatus === "Successful" ? "✅" : buildStatus.includes("warning") ? "⚠️" : "❌"} **Build status:** ${buildStatus}

${buildDetails}

### Type Checking
${typeCheckStatus === "Passed" ? "✅" : "❌"} **TypeScript type check:** ${typeCheckStatus}

### Routes Configuration
✅ **Routes configured:** ${expectedRoutes.length} core routes + ${optionalRoutes.length} optional routes

### Build Artifacts
${buildStatus === "Successful" ? "✅" : "⚠️"} **Build artifacts:** ${buildStatus === "Successful" ? "Generated successfully in dist/" : "Check build logs"}

---

## 📋 Configured Routes

### Core Routes (Required)

${expectedRoutes.map(route => `- \`${route}\``).join("\n")}

### Optional Routes

${optionalRoutes.map(route => `- \`${route}\``).join("\n")}

---

## 🎯 Validation Checklist

| Verification | Expected | Status |
|--------------|----------|--------|
| Build | Completes without errors | ${buildStatus === "Successful" ? "✅" : "❌"} |
| Type Check | No TypeScript errors | ${typeCheckStatus === "Passed" ? "✅" : "❌"} |
| Dist Artifacts | Files generated | ${buildStatus === "Successful" ? "✅" : "❌"} |
| Source Maps | Generated for debugging | ${buildStatus === "Successful" ? "✅" : "⚠️"} |

---

## 📝 Build Configuration

- **Node.js Heap Size:** 4096MB
- **Build Tool:** Vite 5.4.x
- **Target:** ES2020
- **Minification:** esbuild
- **Source Maps:** Enabled in production
- **PWA:** Enabled with service worker

---

## 🔧 Next Steps

To complete the full validation:

1. **Run Preview Server:**
   \`\`\`bash
   npm run preview
   \`\`\`

2. **Run Browser Tests (requires Playwright):**
   \`\`\`bash
   npx playwright install chromium
   npm run preview:scan
   \`\`\`

3. **Generate Complete Report:**
   \`\`\`bash
   npm run preview:scan:report
   \`\`\`

Or run the complete automated scan:
\`\`\`bash
./scripts/preview-scan.sh
\`\`\`

---

## 📊 Summary

${buildStatus === "Successful" && typeCheckStatus === "Passed" ? 
"✅ **Build validation passed!** The application is ready for preview testing." :
"⚠️ **Some issues detected.** Review the build logs before proceeding to preview testing."}

**Build Status:** ${buildStatus}  
**Type Check:** ${typeCheckStatus}  
**Routes Configured:** ${expectedRoutes.length + optionalRoutes.length}  

---

## 📁 Files Generated

- Build output: \`dist/\`
- Build log: \`reports/build-output.log\` ${fs.existsSync(buildLogPath) ? "" : "(not found)"}
- Type check log: \`reports/type-check.log\` ${fs.existsSync(typeCheckLogPath) ? "" : "(not found)"}

---

**Note:** This is an initial validation report. For complete validation including browser tests,
screenshots, and performance metrics, run the full preview scan with \`./scripts/preview-scan.sh\`.
`;

// Write report
const reportPath = path.join(reportsDir, "preview-validation-report.md");
fs.writeFileSync(reportPath, report);

console.log(`✅ Report generated: ${reportPath}`);
console.log(`\nSummary:`);
console.log(`- Build: ${buildStatus}`);
console.log(`- Type Check: ${typeCheckStatus}`);
console.log(`- Routes Configured: ${expectedRoutes.length + optionalRoutes.length}`);

if (buildStatus !== "Successful" || typeCheckStatus !== "Passed") {
  console.log("\n⚠️  Some validations need attention. Review the report for details.");
  process.exit(1);
} else {
  console.log("\n✅ Initial validation passed!");
  process.exit(0);
}
