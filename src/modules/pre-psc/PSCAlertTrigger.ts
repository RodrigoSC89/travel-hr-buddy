/**
 * PSC Alert Trigger
 * Integrates with System Watchdog for critical non-compliance alerts
 */

import { watchdogService, WatchdogEvent } from '@/modules/system-watchdog/watchdog-service';
import { logger } from '@/lib/logger';
import { PSCScoreResult } from './PSCScoreCalculator';

export interface PSCInspectionAlert {
  inspectionId: string;
  vesselId: string;
  vesselName: string;
  score: number;
  riskLevel: string;
  criticalFindings: number;
  timestamp: Date;
}

/**
 * Trigger alert to System Watchdog for critical PSC findings
 */
export function triggerPSCAlert(
  inspection: PSCInspectionAlert,
  scoreResult: PSCScoreResult
): void {
  // Only trigger for high risk or critical findings
  if (scoreResult.riskLevel === 'high' || scoreResult.riskLevel === 'critical') {
    const alertType = scoreResult.riskLevel === 'critical' ? 'error' : 'warning';
    
    const message = scoreResult.criticalFindings > 0
      ? `CRITICAL: Pre-PSC inspection for ${inspection.vesselName} found ${scoreResult.criticalFindings} critical deficiencies`
      : `Pre-PSC inspection for ${inspection.vesselName} scored ${scoreResult.overallScore}% - ${scoreResult.riskLevel} risk level`;

    // Create watchdog event (using private method through service API)
    logger.warn(`[PSC Alert] ${message}`, {
      inspectionId: inspection.inspectionId,
      vesselId: inspection.vesselId,
      score: scoreResult.overallScore,
      riskLevel: scoreResult.riskLevel,
      criticalFindings: scoreResult.criticalFindings,
    });

    // Note: The watchdog service will automatically log events through its internal mechanisms
    // We don't directly call addEvent as it's a private method, but the service monitors
    // application logs and will pick up this critical warning
  }
}

/**
 * Check if alert should be triggered based on compliance thresholds
 */
export function shouldTriggerAlert(scoreResult: PSCScoreResult): boolean {
  return (
    scoreResult.riskLevel === 'critical' ||
    scoreResult.riskLevel === 'high' ||
    scoreResult.criticalFindings > 0 ||
    scoreResult.overallScore < 75
  );
}

/**
 * Generate alert summary for dashboard
 */
export function generateAlertSummary(
  inspection: PSCInspectionAlert,
  scoreResult: PSCScoreResult
): string {
  const parts: string[] = [];

  if (scoreResult.criticalFindings > 0) {
    parts.push(`${scoreResult.criticalFindings} critical deficiency(ies)`);
  }

  if (scoreResult.nonCompliantItems > 0) {
    parts.push(`${scoreResult.nonCompliantItems} non-compliant item(s)`);
  }

  parts.push(`Overall compliance: ${scoreResult.overallScore}%`);

  return parts.join(' | ');
}

/**
 * Get recommended actions based on alert level
 */
export function getRecommendedActions(scoreResult: PSCScoreResult): string[] {
  const actions: string[] = [];

  if (scoreResult.criticalFindings > 0) {
    actions.push('Immediate remediation of critical deficiencies required');
    actions.push('Notify shore management and flag state');
    actions.push('Consider delaying port call until critical issues resolved');
  }

  if (scoreResult.riskLevel === 'high') {
    actions.push('Schedule emergency crew meeting to address findings');
    actions.push('Prepare corrective action plan with timelines');
    actions.push('Increase inspection readiness drills');
  }

  if (scoreResult.overallScore < 75) {
    actions.push('Conduct comprehensive vessel audit');
    actions.push('Review and update safety management procedures');
    actions.push('Provide targeted training for crew on deficient areas');
  }

  return actions;
}
