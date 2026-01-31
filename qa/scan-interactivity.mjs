#!/usr/bin/env node
/**
 * NAUTI ONE - Interactivity Scanner
 * Detects dead buttons, placeholders, and incomplete modules
 * Blocks build if critical issues are found
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");

// Phrases that indicate incomplete implementation
const badPhrases = [
  "em desenvolvimento",
  "in development",
  "coming soon",
  "em breve",
  "mock data",
  "placeholder",
  "todo: implement",
  "fixme: implement",
  "not implemented",
  "não implementado",
  "dummy",
  "fake data",
  "sample data",
  "test data only",
];

// Regex patterns for detecting buttons
const buttonRegexes = [
  /<Button\b([^>]*?)>/gi,
  /<button\b([^>]*?)>/gi,
  /<IconButton\b([^>]*?)>/gi,
];

// Check if button has onClick handler
const hasOnClick = (attrs) =>
  /onClick\s*=/.test(attrs) || 
  /onClick\s*:\s*/.test(attrs) ||
  /onPress\s*=/.test(attrs) ||
  /href\s*=/.test(attrs) ||
  /to\s*=/.test(attrs) ||
  /asChild/.test(attrs);

// Check if button is disabled
const isDisabled = (attrs) => /\bdisabled\b/.test(attrs);

// Check if button has accessibility explanation
const hasTooltip = (attrs) => 
  /(title\s*=|aria-label\s*=|data-tooltip\s*=|tooltip\s*=)/.test(attrs);

// Check if it's a submit button (form context)
const isSubmitButton = (attrs) => /type\s*=\s*["']submit["']/.test(attrs);

// Recursively walk directory
function walk(dir, files = []) {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip non-source directories
        if (["node_modules", "dist", "build", ".git", "coverage", "qa"].includes(entry.name)) continue;
        walk(full, files);
      } else if (entry.isFile()) {
        if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && !entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
          files.push(full);
        }
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not read directory ${dir}: ${err.message}`);
  }
  return files;
}

// Scan a single file for issues
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(ROOT, filePath);
  const issues = [];
  const lines = content.split("\n");

  // Check for bad phrases
  for (const phrase of badPhrases) {
    const lowerContent = content.toLowerCase();
    let idx = lowerContent.indexOf(phrase);
    while (idx !== -1) {
      // Find line number
      const lineNum = content.substring(0, idx).split("\n").length;
      // Skip if in comment
      const line = lines[lineNum - 1] || "";
      const isComment = line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("/*");
      
      if (!isComment) {
        issues.push({
          type: "BAD_PHRASE",
          severity: "error",
          message: `Encontrado "${phrase}" - indica módulo incompleto`,
          file: rel,
          line: lineNum,
          context: line.trim().substring(0, 100),
        });
      }
      idx = lowerContent.indexOf(phrase, idx + 1);
    }
  }

  // Check for dead buttons
  for (const rgx of buttonRegexes) {
    let m;
    rgx.lastIndex = 0; // Reset regex
    while ((m = rgx.exec(content)) !== null) {
      const attrs = m[1] || "";
      const lineNum = content.substring(0, m.index).split("\n").length;
      const line = lines[lineNum - 1] || "";

      // Skip if in comment
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;

      // Check for dead button (no onClick/href and not submit)
      if (!hasOnClick(attrs) && !isSubmitButton(attrs)) {
        // Allow if disabled with tooltip
        if (isDisabled(attrs) && hasTooltip(attrs)) continue;
        
        // Allow if it's a variant button (visual only, like loading indicators)
        if (/variant\s*=\s*["']ghost["']/.test(attrs) && /size\s*=\s*["']icon["']/.test(attrs)) continue;

        issues.push({
          type: "DEAD_BUTTON",
          severity: "error",
          message: "Botão sem onClick/href - ação não implementada",
          file: rel,
          line: lineNum,
          context: line.trim().substring(0, 100),
        });
      }
    }
  }

  // Check for console.log in production code (warning only)
  const consoleRegex = /console\.(log|warn|error|debug)\s*\(/g;
  let consoleMatch;
  while ((consoleMatch = consoleRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, consoleMatch.index).split("\n").length;
    const line = lines[lineNum - 1] || "";
    
    // Skip if in test files or dev utilities
    if (rel.includes("test") || rel.includes("spec") || rel.includes("debug") || rel.includes("logger")) continue;
    
    issues.push({
      type: "CONSOLE_LOG",
      severity: "warning",
      message: `console.${consoleMatch[1]} encontrado - remover em produção`,
      file: rel,
      line: lineNum,
      context: line.trim().substring(0, 80),
    });
  }

  // Check for empty catch blocks (error swallowing)
  const emptyCatchRegex = /catch\s*\([^)]*\)\s*{\s*}/g;
  let catchMatch;
  while ((catchMatch = emptyCatchRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, catchMatch.index).split("\n").length;
    issues.push({
      type: "SILENT_ERROR",
      severity: "error",
      message: "Catch vazio - erro silencioso sem tratamento",
      file: rel,
      line: lineNum,
    });
  }

  // Check for TODO/FIXME that are blocking
  const todoRegex = /(TODO|FIXME|XXX|HACK):\s*(.{0,50})/gi;
  let todoMatch;
  while ((todoMatch = todoRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, todoMatch.index).split("\n").length;
    const todoText = todoMatch[2].toLowerCase();
    
    // Only flag critical TODOs
    if (todoText.includes("implement") || todoText.includes("fix") || todoText.includes("broken") || todoText.includes("bug")) {
      issues.push({
        type: "BLOCKING_TODO",
        severity: "warning",
        message: `${todoMatch[1]}: ${todoMatch[2]}`,
        file: rel,
        line: lineNum,
      });
    }
  }

  return issues;
}

// Generate summary report
function generateReport(issues) {
  const byType = {};
  const bySeverity = { error: 0, warning: 0 };
  const byFile = {};

  for (const issue of issues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
    bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
    byFile[issue.file] = (byFile[issue.file] || 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: issues.length,
      errors: bySeverity.error,
      warnings: bySeverity.warning,
      byType,
      topFiles: Object.entries(byFile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([file, count]) => ({ file, count })),
    },
    issues,
  };
}

// Main execution
console.log("🔍 NAUTI ONE - Interactivity Scanner");
console.log("=====================================\n");

const files = walk(SRC);
console.log(`Scanning ${files.length} files...\n`);

let allIssues = [];
for (const f of files) {
  const fileIssues = scanFile(f);
  allIssues = allIssues.concat(fileIssues);
}

const report = generateReport(allIssues);

// Output results
if (allIssues.length > 0) {
  console.log("📋 Issues Found:\n");
  
  // Group by severity
  const errors = allIssues.filter(i => i.severity === "error");
  const warnings = allIssues.filter(i => i.severity === "warning");

  if (errors.length > 0) {
    console.log("🔴 ERRORS (blockers):");
    for (const issue of errors.slice(0, 20)) {
      console.log(`  [${issue.type}] ${issue.file}:${issue.line}`);
      console.log(`    → ${issue.message}`);
      if (issue.context) console.log(`    → ${issue.context}`);
    }
    if (errors.length > 20) {
      console.log(`  ... and ${errors.length - 20} more errors\n`);
    }
  }

  if (warnings.length > 0) {
    console.log("\n🟡 WARNINGS (non-blocking):");
    for (const issue of warnings.slice(0, 10)) {
      console.log(`  [${issue.type}] ${issue.file}:${issue.line} - ${issue.message}`);
    }
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings\n`);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`  Total issues: ${allIssues.length}`);
  console.log(`  Errors: ${report.summary.errors}`);
  console.log(`  Warnings: ${report.summary.warnings}`);
  console.log(`\n  By Type:`);
  for (const [type, count] of Object.entries(report.summary.byType)) {
    console.log(`    ${type}: ${count}`);
  }
}

// Save report
const outDir = path.join(ROOT, "qa", "out");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "interactivity-scan.json"),
  JSON.stringify(report, null, 2)
);

console.log(`\n📁 Report saved to: qa/out/interactivity-scan.json`);

// Exit with error if there are blocking issues
const blockingCount = report.summary.errors;
if (blockingCount > 0) {
  console.log(`\n❌ BUILD BLOQUEADO: ${blockingCount} erros críticos de interatividade.`);
  console.log("   Corrija os erros acima antes de continuar.\n");
  process.exit(1);
}

console.log("\n✅ OK: Sem bloqueadores críticos de interatividade.\n");
process.exit(0);
