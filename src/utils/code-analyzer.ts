/**
 * Code Analyzer
 * Performance analysis and code quality detection utilities
 * 
 * NOTE: Browser-side analysis cannot access the filesystem.
 * Returns empty/honest results. Use CI tools for real metrics.
 */

export interface CodeIssue {
  type: "console.log" | "any-type" | "empty-catch" | "heavy-operation" | "missing-optimization" | "unnecessary-api-call";
  severity: "high" | "medium" | "low";
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface PerformanceRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  effort: "low" | "medium" | "high";
  impact: string;
  actionable: boolean;
}

export interface CodeAnalysisReport {
  timestamp: string;
  issues: CodeIssue[];
  recommendations: PerformanceRecommendation[];
  metrics: {
    consoleLogCount: number;
    anyTypeCount: number;
    emptyCatchCount: number;
    heavyOperationCount: number;
    missingOptimizationCount: number;
    unnecessaryApiCallCount: number;
  };
  summary: {
    totalIssues: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
  source: "runtime" | "ci";
}

/**
 * Returns empty issues array — browser cannot analyze source files.
 * Use ESLint, tsc, and CI pipelines for real analysis.
 */
export function analyzeCodePatterns(): CodeIssue[] {
  return [];
}

/**
 * Generate static recommendations (always applicable)
 */
export function generateRecommendations(_issues: CodeIssue[]): PerformanceRecommendation[] {
  return [
    {
      id: "use-ci-pipeline",
      priority: "high",
      title: "Use CI pipeline for accurate analysis",
      description: "Browser-side code analysis cannot access the filesystem. Run gate-all.cjs in CI for real metrics.",
      effort: "low",
      impact: "Accurate code quality metrics",
      actionable: true,
    },
    {
      id: "code-splitting",
      priority: "medium",
      title: "Implement code splitting",
      description: "Large bundle size slows initial load. Code splitting loads only necessary code.",
      effort: "medium",
      impact: "Faster initial page load, better performance scores",
      actionable: true,
    },
    {
      id: "improve-test-coverage",
      priority: "medium",
      title: "Improve test coverage",
      description: "Higher test coverage reduces bugs. Aim for 80%+ coverage on critical paths.",
      effort: "high",
      impact: "Better code quality, fewer production bugs",
      actionable: true,
    },
  ];
}

/**
 * Calculate metrics from issues array
 */
export function calculateMetrics(issues: CodeIssue[]) {
  return {
    consoleLogCount: issues.filter(i => i.type === "console.log").length,
    anyTypeCount: issues.filter(i => i.type === "any-type").length,
    emptyCatchCount: issues.filter(i => i.type === "empty-catch").length,
    heavyOperationCount: issues.filter(i => i.type === "heavy-operation").length,
    missingOptimizationCount: issues.filter(i => i.type === "missing-optimization").length,
    unnecessaryApiCallCount: issues.filter(i => i.type === "unnecessary-api-call").length,
  };
}

/**
 * Run complete code analysis (browser-side — limited)
 */
export function runCodeAnalysis(): CodeAnalysisReport {
  const timestamp = new Date().toISOString();
  const issues = analyzeCodePatterns();
  const recommendations = generateRecommendations(issues);
  const metrics = calculateMetrics(issues);

  return {
    timestamp,
    issues,
    recommendations,
    metrics,
    summary: {
      totalIssues: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
    },
    source: "runtime",
  };
}

/**
 * Get real performance metrics from the browser Performance API
 */
export function getPerformanceMetrics() {
  const perf = typeof window !== "undefined" ? window.performance : null;
  const nav = perf?.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const paint = perf?.getEntriesByType("paint") || [];
  const fcp = paint.find(e => e.name === "first-contentful-paint");

  const memory = (performance as unknown as Record<string, unknown>).memory as
    | { usedJSHeapSize: number; totalJSHeapSize: number }
    | undefined;

  return {
    pageLoadTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) : -1,
    timeToInteractive: nav ? Math.round(nav.domInteractive - nav.startTime) : -1,
    firstContentfulPaint: fcp ? Math.round(fcp.startTime) : -1,
    memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1048576) : -1, // MB
    apiResponseTime: -1, // Requires server-side measurement
    bundleSize: -1, // Requires build-time measurement
    renderTime: nav ? Math.round(nav.domComplete - nav.domContentLoadedEventStart) : -1,
  };
}
