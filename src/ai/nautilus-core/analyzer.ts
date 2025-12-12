/**
 * Nautilus Intelligence Core - Analyzer Module
 * 
 * Analyzes CI/CD logs from GitHub Actions to detect common failure patterns:
 * - Missing files or import paths (ENOENT)
 * - Low contrast issues
 * - Reference errors (undefined variables/imports)
 * - Coverage below threshold
 * - Build failures
 */

export interface Finding {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  pattern: string;
  context?: string;
}

export interface AnalysisResult {
  timestamp: string;
  workflowName: string;
  workflowRun: number;
  findings: Finding[];
  hasIssues: boolean;
}

/**
 * Analyzes log content for known failure patterns
 */
export function analyzeLogs(logs: string, workflowName: string = "Unknown", runId: number = 0): AnalysisResult {
  const findings: Finding[] = [];

  // Pattern 1: Missing file or import path
  if (logs.includes("ENOENT") || logs.includes("Cannot find module")) {
    findings.push({
      type: "missing_file",
      severity: "critical",
      message: "❌ Missing file or import path detected",
      pattern: "ENOENT / Cannot find module",
      context: extractContext(logs, ["ENOENT", "Cannot find module"])
    });
  }

  // Pattern 2: Low contrast issue
  if (logs.includes("contrast ratio below") || logs.includes("contrast")) {
    findings.push({
      type: "low_contrast",
      severity: "medium",
      message: "⚠️ Low contrast issue detected",
      pattern: "contrast ratio below",
      context: extractContext(logs, ["contrast ratio below", "contrast"])
    });
  }

  // Pattern 3: Reference errors
  if (logs.includes("ReferenceError") || logs.includes("is not defined")) {
    findings.push({
      type: "reference_error",
      severity: "critical",
      message: "❌ Undefined variable or import detected",
      pattern: "ReferenceError / is not defined",
      context: extractContext(logs, ["ReferenceError", "is not defined"])
    });
  }

  // Pattern 4: Coverage below threshold
  if (logs.includes("coverage <") || logs.includes("Coverage") && logs.includes("below")) {
    findings.push({
      type: "low_coverage",
      severity: "high",
      message: "📉 Coverage below threshold detected",
      pattern: "coverage < threshold",
      context: extractContext(logs, ["coverage <", "Coverage"])
    });
  }

  // Pattern 5: Build failures
  if (logs.includes("Build failed") || logs.includes("error TS") || logs.includes("ERROR")) {
    findings.push({
      type: "build_failure",
      severity: "critical",
      message: "❌ Build failure detected",
      pattern: "Build failed / TypeScript error",
      context: extractContext(logs, ["Build failed", "error TS", "ERROR"])
    });
  }

  // Pattern 6: Suspended buttons reappearing
  if (logs.includes("suspended button") || logs.includes("disabled button")) {
    findings.push({
      type: "suspended_button",
      severity: "medium",
      message: "⚠️ Suspended button issue detected",
      pattern: "suspended/disabled button",
      context: extractContext(logs, ["suspended button", "disabled button"])
    });
  }

  // Pattern 7: Vercel deployment failures
  if (logs.includes("Vercel") && (logs.includes("failed") || logs.includes("error"))) {
    findings.push({
      type: "vercel_failure",
      severity: "high",
      message: "❌ Vercel deployment failure detected",
      pattern: "Vercel deployment error",
      context: extractContext(logs, ["Vercel"])
    });
  }

  // Pattern 8: Test failures
  if (logs.includes("FAIL") || logs.includes("test failed") || logs.includes("✕")) {
    findings.push({
      type: "test_failure",
      severity: "high",
      message: "❌ Test failure detected",
      pattern: "Test failures",
      context: extractContext(logs, ["FAIL", "test failed", "✕"])
    });
  }

  return {
    timestamp: new Date().toISOString(),
    workflowName,
    workflowRun: runId,
    findings,
    hasIssues: findings.length > 0
  });
}

/**
 * Extracts relevant context around found patterns
 */
function extractContext(logs: string, patterns: string[], contextLines: number = 3): string {
  const lines = logs.split("\n");
  const relevantLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (patterns.some(pattern => line.toLowerCase().includes(pattern.toLowerCase()))) {
      // Add context lines before and after
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length - 1, i + contextLines);
      
      for (let j = start; j <= end; j++) {
        if (!relevantLines.includes(lines[j])) {
          relevantLines.push(lines[j]);
        }
      }
    }
  }

  return relevantLines.slice(0, 10).join("\n"); // Limit to 10 lines
}

/**
 * Generates a summary report of findings
 */
export function generateSummary(analysis: AnalysisResult): string {
  const { workflowName, workflowRun, findings } = analysis;
  
  let summary = "# Nautilus Intelligence Core - Analysis Report\n\n";
  summary += `**Workflow:** ${workflowName}\n`;
  summary += `**Run ID:** ${workflowRun}\n`;
  summary += `**Timestamp:** ${analysis.timestamp}\n`;
  summary += `**Status:** ${findings.length > 0 ? "❌ Issues Detected" : "✅ No Issues"}\n\n`;

  if (findings.length > 0) {
    summary += `## Issues Found (${findings.length})\n\n`;
    
    findings.forEach((finding, index) => {
      summary += `### ${index + 1}. ${finding.message}\n`;
      summary += `- **Type:** ${finding.type}\n`;
      summary += `- **Severity:** ${finding.severity}\n`;
      summary += `- **Pattern:** ${finding.pattern}\n`;
      if (finding.context) {
        summary += `- **Context:**\n\`\`\`\n${finding.context}\n\`\`\`\n`;
      }
      summary += "\n";
    });
  }

  return summary;
}
