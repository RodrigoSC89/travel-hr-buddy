/**
 * PATCH 596 - System Sweep Types
 */

export type IssueSeverity = "critical" | "high" | "medium" | "low" | "info";
export type IssueCategory = 
  | "build" 
  | "routing" 
  | "syntax" 
  | "memory" 
  | "performance" 
  | "dependencies" 
  | "supabase" 
  | "lazy_loading" 
  | "typescript"
  | "console_errors";

export interface SweepIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  autoFixable: boolean;
  timestamp: Date;
}

export interface SweepAuditResult {
  success: boolean;
  timestamp: Date;
  duration: number;
  totalIssues: number;
  criticalIssues: number;
  issues: SweepIssue[];
  stats: SweepStats;
}

export interface SweepStats {
  buildStatus: "pass" | "fail" | "warning";
  routesChecked: number;
  brokenRoutes: number;
  slowComponents: number;
  memoryLeaks: number;
  tsIgnoreCount: number;
  consoleErrors: number;
  lazyLoadingIssues: number;
  supabaseSchemaIssues: number;
}

export interface RouteAuditResult {
  path: string;
  exists: boolean;
  loadTime?: number;
  hasLazy: boolean;
  hasSuspense: boolean;
  hasErrorBoundary: boolean;
  status: "ok" | "broken" | "slow" | "missing_fallback";
}

export interface ComponentPerformance {
  component: string;
  renderTime: number;
  renderCount: number;
  avgRenderTime: number;
  isSlow: boolean;
}
