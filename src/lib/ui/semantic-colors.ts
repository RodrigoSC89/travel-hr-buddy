/**
 * Semantic Color Utilities
 * Maps business concepts to design system tokens
 * Eliminates hardcoded colors across the system
 */

/** Trend direction colors (up = success, down = destructive) */
export const trendColor = (direction: 'up' | 'down' | 'neutral') => {
  const map = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };
  return map[direction];
};

/** Score/grade color based on percentage thresholds */
export const scoreColor = (score: number | null): string => {
  if (score === null) return 'text-muted-foreground';
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-warning';
  if (score >= 50) return 'text-warning';
  return 'text-destructive';
};

/** Severity badge classes */
export const severityBadge = (level: 'critical' | 'high' | 'medium' | 'low' | 'info') => {
  const map = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-warning text-warning-foreground',
    medium: 'bg-info/10 text-info border-info/30',
    low: 'bg-muted text-muted-foreground',
    info: 'bg-primary/10 text-primary border-primary/30',
  };
  return map[level];
};

/** Status badge classes (open, closed, pending, etc.) */
export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    open: 'bg-destructive/10 text-destructive border-destructive/30',
    closed: 'bg-success/10 text-success border-success/30',
    resolved: 'bg-success/10 text-success border-success/30',
    pending: 'bg-warning/10 text-warning border-warning/30',
    in_progress: 'bg-info/10 text-info border-info/30',
    active: 'bg-success/10 text-success border-success/30',
    inactive: 'bg-muted text-muted-foreground',
    under_review: 'bg-info/10 text-info border-info/30',
    approved: 'bg-success/10 text-success border-success/30',
    rejected: 'bg-destructive/10 text-destructive border-destructive/30',
    expired: 'bg-destructive/10 text-destructive border-destructive/30',
    draft: 'bg-muted text-muted-foreground',
  };
  return map[status] || 'bg-muted text-muted-foreground';
};

/** Financial amount color (positive = success, negative = destructive) */
export const amountColor = (type: 'receivable' | 'payable' | 'positive' | 'negative') => {
  const map = {
    receivable: 'text-success',
    payable: 'text-destructive',
    positive: 'text-success',
    negative: 'text-destructive',
  };
  return map[type];
};

/** Progress/budget color based on usage percentage */
export const budgetColor = (percentage: number): string => {
  if (percentage >= 100) return '[&>div]:bg-destructive';
  if (percentage >= 85) return '[&>div]:bg-warning';
  return '';
};
