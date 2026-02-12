/**
 * Semantic Status Color Utilities
 * 
 * Maps status/severity/level values to design system tokens.
 * Use these instead of hardcoded colors like bg-red-500, text-green-500.
 * 
 * Design tokens available:
 * - success / success-foreground (green)
 * - warning / warning-foreground (amber/yellow)
 * - danger / danger-foreground (red)
 * - destructive / destructive-foreground (red)
 * - info / info-foreground (blue)
 * - primary / primary-foreground (brand blue)
 * - muted / muted-foreground (gray)
 */

export type StatusLevel = 'success' | 'warning' | 'danger' | 'error' | 'critical' | 'info' | 'normal' | 'low' | 'medium' | 'high' | 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'processing';

/**
 * Get text color class for a status level
 */
export function getStatusTextColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
    case 'active':
    case 'valid':
    case 'passed':
    case 'approved':
    case 'resolved':
    case 'operational':
    case 'normal':
      return 'text-success';
    
    case 'warning':
    case 'medium':
    case 'expiring':
    case 'pending':
    case 'in_progress':
    case 'degraded':
    case 'degradation':
      return 'text-warning';
    
    case 'danger':
    case 'error':
    case 'critical':
    case 'high':
    case 'failed':
    case 'expired':
    case 'overdue':
    case 'rejected':
      return 'text-destructive';
    
    case 'info':
    case 'processing':
    case 'low':
    case 'scheduled':
      return 'text-info';
    
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get background color class for a status level
 */
export function getStatusBgColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
    case 'active':
    case 'valid':
    case 'passed':
    case 'approved':
    case 'resolved':
    case 'operational':
    case 'normal':
      return 'bg-success';
    
    case 'warning':
    case 'medium':
    case 'expiring':
    case 'pending':
    case 'degraded':
      return 'bg-warning';
    
    case 'danger':
    case 'error':
    case 'critical':
    case 'high':
    case 'failed':
    case 'expired':
    case 'overdue':
      return 'bg-destructive';
    
    case 'info':
    case 'processing':
    case 'low':
      return 'bg-info';
    
    default:
      return 'bg-muted';
  }
}

/**
 * Get subtle background (10% opacity) for a status level
 */
export function getStatusBgSubtle(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
    case 'active':
    case 'valid':
    case 'passed':
    case 'approved':
    case 'resolved':
    case 'normal':
      return 'bg-success/10';
    
    case 'warning':
    case 'medium':
    case 'expiring':
    case 'pending':
    case 'degraded':
      return 'bg-warning/10';
    
    case 'danger':
    case 'error':
    case 'critical':
    case 'high':
    case 'failed':
    case 'expired':
    case 'overdue':
      return 'bg-destructive/10';
    
    case 'info':
    case 'processing':
    case 'low':
      return 'bg-info/10';
    
    default:
      return 'bg-muted/50';
  }
}

/**
 * Get border color class for a status level
 */
export function getStatusBorderColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
    case 'active':
    case 'valid':
      return 'border-success/30';
    case 'warning':
    case 'medium':
    case 'pending':
      return 'border-warning/30';
    case 'danger':
    case 'error':
    case 'critical':
    case 'high':
    case 'failed':
      return 'border-destructive/30';
    case 'info':
    case 'processing':
    case 'low':
      return 'border-info/30';
    default:
      return 'border-border';
  }
}

/**
 * Get a complete set of status classes (bg + text + border)
 */
export function getStatusClasses(status: string): string {
  return `${getStatusBgSubtle(status)} ${getStatusTextColor(status)} ${getStatusBorderColor(status)}`;
}

/**
 * Severity color mapping for icons
 * Returns: { text, bg, bgSubtle, border }
 */
export function getSeverityColors(severity: string) {
  const text = getStatusTextColor(severity);
  const bg = getStatusBgColor(severity);
  const bgSubtle = getStatusBgSubtle(severity);
  const border = getStatusBorderColor(severity);
  return { text, bg, bgSubtle, border };
}
