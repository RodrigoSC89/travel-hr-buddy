/**
 * Code Auditor - PATCH 70.1
 * Automated weekly code quality analysis
 * NOTE: Browser-side static analysis is limited. Returns honest "unavailable" for metrics
 * that require build-time tooling (ESLint, tsc, coverage reports).
 */

import { Logger } from "@/lib/utils/logger";

export interface CodeAuditResult {
  timestamp: string;
  totalFiles: number;
  issuesFound: number;
  typeScriptIssues: number;
  unusedImports: number;
  longFunctions: number;
  duplicateCode: number;
  missingTests: number;
  score: number;
  recommendations: string[];
  source: "runtime" | "ci";
}

export class CodeAuditor {
  private static instance: CodeAuditor;

  private constructor() {
    Logger.info("Code Auditor initialized", undefined, "CodeAuditor");
  }

  public static getInstance(): CodeAuditor {
    if (!CodeAuditor.instance) {
      CodeAuditor.instance = new CodeAuditor();
    }
    return CodeAuditor.instance;
  }

  /**
   * Run weekly automated audit
   * Returns honest results — metrics that require build tools return -1 (unavailable)
   */
  public async runWeeklyAudit(): Promise<CodeAuditResult> {
    Logger.info("Starting weekly code audit", undefined, "CodeAuditor");

    const result: CodeAuditResult = {
      timestamp: new Date().toISOString(),
      totalFiles: -1, // Requires filesystem access (CI only)
      issuesFound: -1,
      typeScriptIssues: -1, // Requires tsc --noEmit
      unusedImports: -1, // Requires ESLint
      longFunctions: -1, // Requires AST analysis
      duplicateCode: -1, // Requires jscpd
      missingTests: -1, // Requires coverage report
      score: -1,
      recommendations: [],
      source: "runtime",
    };

    try {
      result.recommendations = [
        "⚠️ Browser-side audit has limited capabilities.",
        "Run `npx tsc --noEmit` for TypeScript issues.",
        "Run `npx eslint src/` for linting issues.",
        "Run `npm run test -- --coverage` for test coverage.",
        "Use CI pipeline (gate-all.cjs) for comprehensive analysis.",
      ];

      Logger.info("Weekly audit completed (runtime mode)", { source: "runtime" }, "CodeAuditor");
      return result;
    } catch (error) {
      Logger.error("Weekly audit failed", error, "CodeAuditor");
      throw error;
    }
  }

  /**
   * Export audit report as JSON
   */
  public exportReport(result: CodeAuditResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Get formatted report for display
   */
  public getFormattedReport(result: CodeAuditResult): string {
    const fmt = (v: number) => (v === -1 ? "N/A (requires CI)" : String(v));
    return `
📊 CODE AUDIT REPORT
Generated: ${new Date(result.timestamp).toLocaleString()}
Source: ${result.source}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 METRICS:
• TypeScript Issues: ${fmt(result.typeScriptIssues)}
• Unused Imports: ${fmt(result.unusedImports)}
• Long Functions: ${fmt(result.longFunctions)}
• Duplicate Code: ${fmt(result.duplicateCode)}
• Missing Tests: ${fmt(result.missingTests)}

💡 RECOMMENDATIONS:
${result.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
}

// Singleton export
export const codeAuditor = CodeAuditor.getInstance();
