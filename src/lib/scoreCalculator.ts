/**
 * Score Calculator for LSA & FFA Inspections
 * Calculates compliance scores based on checklist items and issues
 */

import type { ChecklistItem, InspectionIssue } from '@/types/lsa-ffa';

export interface ScoreBreakdown {
  overallScore: number;
  checklistScore: number;
  issuesPenalty: number;
  categoryScores: Record<string, number>;
  complianceLevel: 'critical' | 'low' | 'medium' | 'high' | 'excellent';
  recommendation: string;
}

/**
 * Calculate overall inspection score
 */
export function calculateInspectionScore(
  checklist: Record<string, ChecklistItem>,
  issues: InspectionIssue[]
): ScoreBreakdown {
  const checklistScore = calculateChecklistScore(checklist);
  const issuesPenalty = calculateIssuesPenalty(issues);
  const categoryScores = calculateCategoryScores(checklist);
  
  // Overall score is checklist score minus issues penalty
  const overallScore = Math.max(0, Math.min(100, checklistScore - issuesPenalty));
  
  return {
    overallScore,
    checklistScore,
    issuesPenalty,
    categoryScores,
    complianceLevel: getComplianceLevel(overallScore),
    recommendation: getRecommendation(overallScore, issues),
  };
}

/**
 * Calculate score based on checklist items
 */
function calculateChecklistScore(checklist: Record<string, ChecklistItem>): number {
  const items = Object.values(checklist);
  
  if (items.length === 0) return 0;
  
  const weights = {
    pass: 1,
    na: 1, // Not applicable counts as pass
    pending: 0.5, // Pending gets partial credit
    fail: 0,
  };
  
  const totalWeight = items.reduce((sum, item) => {
    return sum + (weights[item.status] || 0);
  }, 0);
  
  return Math.round((totalWeight / items.length) * 100);
}

/**
 * Calculate penalty based on issues found
 */
function calculateIssuesPenalty(issues: InspectionIssue[]): number {
  const severityPenalties = {
    critical: 15,
    major: 10,
    minor: 5,
    observation: 0,
  };
  
  const unresolvedIssues = issues.filter(issue => !issue.resolved);
  
  const totalPenalty = unresolvedIssues.reduce((sum, issue) => {
    return sum + (severityPenalties[issue.severity] || 0);
  }, 0);
  
  // Cap penalty at 40 points
  return Math.min(40, totalPenalty);
}

/**
 * Calculate scores by category
 */
function calculateCategoryScores(
  checklist: Record<string, ChecklistItem>
): Record<string, number> {
  const items = Object.values(checklist);
  const categories = new Set(items.map(item => item.category));
  
  const categoryScores: Record<string, number> = {};
  
  categories.forEach(category => {
    const categoryItems = items.filter(item => item.category === category);
    const passed = categoryItems.filter(
      item => item.status === 'pass' || item.status === 'na'
    ).length;
    
    categoryScores[category] = categoryItems.length > 0
      ? Math.round((passed / categoryItems.length) * 100)
      : 0;
  });
  
  return categoryScores;
}

/**
 * Get compliance level based on score
 */
function getComplianceLevel(score: number): ScoreBreakdown['complianceLevel'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'critical';
}

/**
 * Get recommendation based on score and issues
 */
function getRecommendation(score: number, issues: InspectionIssue[]): string {
  const criticalIssues = issues.filter(i => i.severity === 'critical' && !i.resolved);
  const majorIssues = issues.filter(i => i.severity === 'major' && !i.resolved);
  
  if (criticalIssues.length > 0) {
    return `⚠️ URGENT: ${criticalIssues.length} critical issue(s) require immediate attention before vessel operation.`;
  }
  
  if (score < 60) {
    return '❌ Non-compliant: Significant deficiencies found. Corrective actions required before next inspection.';
  }
  
  if (majorIssues.length > 0 || score < 75) {
    return '⚠️ Conditionally compliant: Address identified issues to improve safety standards.';
  }
  
  if (score < 90) {
    return '✓ Compliant: Good condition. Minor improvements recommended for optimal performance.';
  }
  
  return '✅ Excellent: All equipment meets or exceeds SOLAS requirements. Continue current maintenance practices.';
}

/**
 * Calculate trend based on historical scores
 */
export function calculateScoreTrend(scores: number[]): {
  trend: 'improving' | 'declining' | 'stable';
  change: number;
} {
  if (scores.length < 2) {
    return { trend: 'stable', change: 0 };
  }
  
  const recent = scores.slice(-3);
  const older = scores.slice(-6, -3);
  
  if (older.length === 0) {
    return { trend: 'stable', change: 0 };
  }
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = Math.round(recentAvg - olderAvg);
  
  if (change > 5) return { trend: 'improving', change };
  if (change < -5) return { trend: 'declining', change };
  return { trend: 'stable', change };
}

/**
 * Get compliance color for UI
 */
export function getComplianceColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}
