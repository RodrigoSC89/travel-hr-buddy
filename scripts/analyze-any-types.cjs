#!/usr/bin/env node

/**
 * SCRIPT TO ANALYZE AND REPORT `any` TYPES
 * Helps identify where `any` types are used and provides suggestions
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function main() {
  console.log("🔍 ANALYZING `any` TYPES");
  console.log("=========================");
  
  try {
    // Run ESLint to find all `any` type errors
    const output = execSync("npm run lint 2>&1 | grep '@typescript-eslint/no-explicit-any'", {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024
    });
    
    const lines = output.trim().split("\n");
    
    // Parse the output
    const anyUsages = {};
    
    lines.forEach(line => {
      const match = line.match(/^(.+?):(\d+):\d+/);
      if (match) {
        const file = match[1];
        const lineNum = match[2];
        
        if (!anyUsages[file]) {
          anyUsages[file] = [];
        }
        anyUsages[file].push(lineNum);
      }
    });
    
    // Sort by count
    const sorted = Object.entries(anyUsages)
      .sort((a, b) => b[1].length - a[1].length);
    
    console.log("\n📊 SUMMARY:");
    console.log(`Total files with 'any': ${sorted.length}`);
    console.log(`Total 'any' occurrences: ${lines.length}`);
    
    console.log("\n📁 TOP 20 FILES BY 'any' COUNT:");
    sorted.slice(0, 20).forEach(([file, lines], index) => {
      console.log(`${index + 1}. ${file.replace(/^\/home\/runner\/work\/travel-hr-buddy\/travel-hr-buddy\//, '')} (${lines.length} occurrences)`);
    });
    
    // Generate report
    let report = "# `any` Types Report\n\n";
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- Total files with \`any\`: ${sorted.length}\n`;
    report += `- Total \`any\` occurrences: ${lines.length}\n\n`;
    report += `## Files Needing Attention\n\n`;
    
    sorted.forEach(([file, lines]) => {
      const relPath = file.replace(/^\/home\/runner\/work\/travel-hr-buddy\/travel-hr-buddy\//, '');
      report += `### ${relPath}\n`;
      report += `- **Occurrences:** ${lines.length}\n`;
      report += `- **Lines:** ${lines.join(", ")}\n\n`;
    });
    
    fs.writeFileSync("ANY_TYPES_REPORT.md", report, "utf8");
    console.log("\n✅ Report generated: ANY_TYPES_REPORT.md");
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
