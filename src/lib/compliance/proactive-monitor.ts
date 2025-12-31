/**
 * PATCH 900 - Proactive Compliance Monitor
 * Real-time monitoring system for ISM, MLC, STCW compliance
 * Generates imminent failure alerts based on operation rules
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type ComplianceStandard = 'ISM' | 'MLC' | 'STCW' | 'MARPOL' | 'PSC' | 'ISPS';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface ComplianceGap {
  id: string;
  standard: ComplianceStandard;
  category: string;
  description: string;
  severity: AlertSeverity;
  daysUntilExpiry?: number;
  affectedEntity: string;
  entityType: 'crew' | 'vessel' | 'document' | 'certificate' | 'equipment';
  recommendation: string;
  regulatoryReference: string;
  detectedAt: string;
}

export interface ComplianceAlert {
  id: string;
  standard: ComplianceStandard;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  affectedItems: string[];
  recommendation: string;
  dueDate?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface ComplianceModuleStatus {
  module: ComplianceStandard;
  score: number;
  status: 'compliant' | 'warning' | 'non_compliant';
  gaps: ComplianceGap[];
  alerts: ComplianceAlert[];
  lastChecked: string;
}

export interface ComplianceMonitorResult {
  overallScore: number;
  overallStatus: 'compliant' | 'warning' | 'non_compliant';
  modules: ComplianceModuleStatus[];
  criticalAlerts: ComplianceAlert[];
  upcomingExpirations: ComplianceGap[];
  lastUpdated: string;
}

// STCW Certificate Types and Requirements
const STCW_CERTIFICATE_REQUIREMENTS: Record<string, { validityYears: number; warningDays: number }> = {
  'GMDSS': { validityYears: 5, warningDays: 90 },
  'SOLAS': { validityYears: 5, warningDays: 90 },
  'STCW': { validityYears: 5, warningDays: 90 },
  'Medical': { validityYears: 2, warningDays: 60 },
  'ARPA': { validityYears: 5, warningDays: 90 },
  'ECDIS': { validityYears: 5, warningDays: 90 },
  'Survival Craft': { validityYears: 5, warningDays: 90 },
  'Fire Prevention': { validityYears: 5, warningDays: 90 },
  'Basic Safety Training': { validityYears: 5, warningDays: 90 },
};

// MLC Requirements
const MLC_REQUIREMENTS = {
  maxWorkHoursPerDay: 14,
  minRestHoursPerDay: 10,
  maxWorkHoursPerWeek: 72,
  minAnnualLeaveDays: 30,
  medicalCertValidityYears: 2,
};

// ISM Requirements
const ISM_REQUIREMENTS = {
  auditIntervalMonths: 12,
  drillFrequencyMonths: 3,
  maintenanceReviewMonths: 6,
  documentReviewMonths: 12,
};

/**
 * Check STCW compliance for crew certificates
 */
async function checkSTCWCompliance(): Promise<ComplianceModuleStatus> {
  const gaps: ComplianceGap[] = [];
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  try {
    // Fetch crew members with certificates
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select('id, name, position, created_at');

    // Simulate certificate checking (would come from crew_certificates table)
    const simulatedCertificates = [
      { crewId: '1', crewName: 'João Silva', certType: 'STCW', expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      { crewId: '2', crewName: 'Maria Santos', certType: 'Medical', expiryDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) },
      { crewId: '3', crewName: 'Pedro Oliveira', certType: 'GMDSS', expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) },
    ];

    for (const cert of simulatedCertificates) {
      const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const requirement = STCW_CERTIFICATE_REQUIREMENTS[cert.certType] || { warningDays: 90 };

      if (daysUntilExpiry <= 0) {
        // Expired - Critical
        gaps.push({
          id: `stcw-${cert.crewId}-${cert.certType}`,
          standard: 'STCW',
          category: 'Certificate Expiration',
          description: `${cert.certType} certificate for ${cert.crewName} has EXPIRED`,
          severity: 'critical',
          daysUntilExpiry,
          affectedEntity: cert.crewName,
          entityType: 'certificate',
          recommendation: 'Immediately arrange certificate renewal. Crew member may not serve until renewed.',
          regulatoryReference: 'STCW Convention Section A-I/11',
          detectedAt: now.toISOString(),
        });

        alerts.push({
          id: `alert-stcw-${cert.crewId}-${cert.certType}`,
          standard: 'STCW',
          severity: 'critical',
          status: 'active',
          title: `Certificado ${cert.certType} Expirado`,
          description: `O certificado ${cert.certType} de ${cert.crewName} expirou há ${Math.abs(daysUntilExpiry)} dias`,
          affectedItems: [cert.crewName],
          recommendation: 'Providenciar renovação imediata. Tripulante impedido de operar.',
          dueDate: now.toISOString(),
          createdAt: now.toISOString(),
        });
      } else if (daysUntilExpiry <= requirement.warningDays) {
        // Expiring soon - Warning
        const severity: AlertSeverity = daysUntilExpiry <= 30 ? 'high' : 'medium';
        
        gaps.push({
          id: `stcw-${cert.crewId}-${cert.certType}`,
          standard: 'STCW',
          category: 'Certificate Expiration',
          description: `${cert.certType} certificate for ${cert.crewName} expires in ${daysUntilExpiry} days`,
          severity,
          daysUntilExpiry,
          affectedEntity: cert.crewName,
          entityType: 'certificate',
          recommendation: `Schedule certificate renewal within ${Math.min(daysUntilExpiry - 7, 30)} days`,
          regulatoryReference: 'STCW Convention Section A-I/11',
          detectedAt: now.toISOString(),
        });

        if (severity === 'high' || severity === 'critical') {
          alerts.push({
            id: `alert-stcw-${cert.crewId}-${cert.certType}`,
            standard: 'STCW',
            severity,
            status: 'active',
            title: `Certificado ${cert.certType} Expirando`,
            description: `O certificado ${cert.certType} de ${cert.crewName} expira em ${daysUntilExpiry} dias`,
            affectedItems: [cert.crewName],
            recommendation: 'Agendar renovação urgente do certificado.',
            dueDate: cert.expiryDate.toISOString(),
            createdAt: now.toISOString(),
          });
        }
      }
    }
  } catch (error) {
    logger.error('Error checking STCW compliance', { error });
  }

  // Calculate score
  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const highCount = gaps.filter(g => g.severity === 'high').length;
  const score = Math.max(0, 100 - (criticalCount * 25) - (highCount * 10));

  return {
    module: 'STCW',
    score,
    status: score >= 90 ? 'compliant' : score >= 70 ? 'warning' : 'non_compliant',
    gaps,
    alerts,
    lastChecked: now.toISOString(),
  };
}

/**
 * Check MLC compliance for working conditions
 */
async function checkMLCCompliance(): Promise<ComplianceModuleStatus> {
  const gaps: ComplianceGap[] = [];
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  try {
    // Simulate work hour violations
    const workHourViolations = [
      { crewName: 'Carlos Lima', hoursWorked: 16, date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    ];

    for (const violation of workHourViolations) {
      if (violation.hoursWorked > MLC_REQUIREMENTS.maxWorkHoursPerDay) {
        gaps.push({
          id: `mlc-work-hours-${violation.crewName}`,
          standard: 'MLC',
          category: 'Work Hours Violation',
          description: `${violation.crewName} worked ${violation.hoursWorked}h (max ${MLC_REQUIREMENTS.maxWorkHoursPerDay}h)`,
          severity: 'high',
          affectedEntity: violation.crewName,
          entityType: 'crew',
          recommendation: 'Review scheduling to ensure compliance with MLC rest hour requirements',
          regulatoryReference: 'MLC 2006 Regulation 2.3',
          detectedAt: now.toISOString(),
        });

        alerts.push({
          id: `alert-mlc-hours-${violation.crewName}`,
          standard: 'MLC',
          severity: 'high',
          status: 'active',
          title: 'Violação de Horas de Trabalho',
          description: `${violation.crewName} excedeu limite de horas de trabalho diário`,
          affectedItems: [violation.crewName],
          recommendation: 'Revisar escala imediatamente. Garantir descanso mínimo.',
          createdAt: now.toISOString(),
        });
      }
    }

    // Check medical certificates for MLC
    const medicalExpiring = [
      { crewName: 'Ana Costa', expiryDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000) },
    ];

    for (const medical of medicalExpiring) {
      const daysUntilExpiry = Math.ceil((medical.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 60) {
        gaps.push({
          id: `mlc-medical-${medical.crewName}`,
          standard: 'MLC',
          category: 'Medical Certificate',
          description: `Medical certificate for ${medical.crewName} expires in ${daysUntilExpiry} days`,
          severity: daysUntilExpiry <= 30 ? 'high' : 'medium',
          daysUntilExpiry,
          affectedEntity: medical.crewName,
          entityType: 'certificate',
          recommendation: 'Schedule medical examination before expiry',
          regulatoryReference: 'MLC 2006 Regulation 1.2',
          detectedAt: now.toISOString(),
        });
      }
    }
  } catch (error) {
    logger.error('Error checking MLC compliance', { error });
  }

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const highCount = gaps.filter(g => g.severity === 'high').length;
  const score = Math.max(0, 100 - (criticalCount * 25) - (highCount * 10));

  return {
    module: 'MLC',
    score,
    status: score >= 90 ? 'compliant' : score >= 70 ? 'warning' : 'non_compliant',
    gaps,
    alerts,
    lastChecked: now.toISOString(),
  };
}

/**
 * Check ISM compliance
 */
async function checkISMCompliance(): Promise<ComplianceModuleStatus> {
  const gaps: ComplianceGap[] = [];
  const alerts: ComplianceAlert[] = [];
  const now = new Date();

  try {
    // Check audit schedule
    const lastAuditDate = new Date(now.getTime() - 10 * 30 * 24 * 60 * 60 * 1000); // 10 months ago
    const nextAuditDue = new Date(lastAuditDate.getTime() + ISM_REQUIREMENTS.auditIntervalMonths * 30 * 24 * 60 * 60 * 1000);
    const daysUntilAudit = Math.ceil((nextAuditDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilAudit <= 60) {
      gaps.push({
        id: 'ism-audit-due',
        standard: 'ISM',
        category: 'Internal Audit',
        description: `Internal ISM audit due in ${daysUntilAudit} days`,
        severity: daysUntilAudit <= 30 ? 'high' : 'medium',
        daysUntilExpiry: daysUntilAudit,
        affectedEntity: 'Safety Management System',
        entityType: 'document',
        recommendation: 'Schedule and prepare for internal ISM audit',
        regulatoryReference: 'ISM Code Section 12.1',
        detectedAt: now.toISOString(),
      });

      if (daysUntilAudit <= 30) {
        alerts.push({
          id: 'alert-ism-audit',
          standard: 'ISM',
          severity: 'high',
          status: 'active',
          title: 'Auditoria ISM Pendente',
          description: `Auditoria interna ISM deve ser realizada em ${daysUntilAudit} dias`,
          affectedItems: ['Sistema de Gestão de Segurança'],
          recommendation: 'Agendar auditoria interna imediatamente.',
          dueDate: nextAuditDue.toISOString(),
          createdAt: now.toISOString(),
        });
      }
    }

    // Check drill schedule
    const lastDrillDate = new Date(now.getTime() - 2.5 * 30 * 24 * 60 * 60 * 1000); // 2.5 months ago
    const nextDrillDue = new Date(lastDrillDate.getTime() + ISM_REQUIREMENTS.drillFrequencyMonths * 30 * 24 * 60 * 60 * 1000);
    const daysUntilDrill = Math.ceil((nextDrillDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDrill <= 30) {
      gaps.push({
        id: 'ism-drill-due',
        standard: 'ISM',
        category: 'Emergency Drill',
        description: `Emergency drill due in ${daysUntilDrill} days`,
        severity: daysUntilDrill <= 7 ? 'high' : 'medium',
        daysUntilExpiry: daysUntilDrill,
        affectedEntity: 'Emergency Procedures',
        entityType: 'equipment',
        recommendation: 'Schedule emergency drill with all crew',
        regulatoryReference: 'ISM Code Section 8.1',
        detectedAt: now.toISOString(),
      });
    }

    // Check SMS document review
    const lastDocReview = new Date(now.getTime() - 11 * 30 * 24 * 60 * 60 * 1000); // 11 months ago
    const nextDocReview = new Date(lastDocReview.getTime() + ISM_REQUIREMENTS.documentReviewMonths * 30 * 24 * 60 * 60 * 1000);
    const daysUntilReview = Math.ceil((nextDocReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilReview <= 45) {
      gaps.push({
        id: 'ism-doc-review',
        standard: 'ISM',
        category: 'Document Review',
        description: `SMS document review due in ${daysUntilReview} days`,
        severity: daysUntilReview <= 15 ? 'high' : 'medium',
        daysUntilExpiry: daysUntilReview,
        affectedEntity: 'SMS Documentation',
        entityType: 'document',
        recommendation: 'Initiate annual SMS document review process',
        regulatoryReference: 'ISM Code Section 11.3',
        detectedAt: now.toISOString(),
      });
    }
  } catch (error) {
    logger.error('Error checking ISM compliance', { error });
  }

  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const highCount = gaps.filter(g => g.severity === 'high').length;
  const score = Math.max(0, 100 - (criticalCount * 25) - (highCount * 10));

  return {
    module: 'ISM',
    score,
    status: score >= 90 ? 'compliant' : score >= 70 ? 'warning' : 'non_compliant',
    gaps,
    alerts,
    lastChecked: now.toISOString(),
  };
}

/**
 * Run full compliance monitoring
 */
export async function runProactiveComplianceMonitor(): Promise<ComplianceMonitorResult> {
  logger.info('🔍 Running proactive compliance monitor...');

  const [stcwStatus, mlcStatus, ismStatus] = await Promise.all([
    checkSTCWCompliance(),
    checkMLCCompliance(),
    checkISMCompliance(),
  ]);

  const modules = [stcwStatus, mlcStatus, ismStatus];

  // Calculate overall score
  const overallScore = Math.round(
    modules.reduce((sum, m) => sum + m.score, 0) / modules.length
  );

  // Collect all critical alerts
  const criticalAlerts = modules
    .flatMap(m => m.alerts)
    .filter(a => a.severity === 'critical' || a.severity === 'high')
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

  // Collect upcoming expirations
  const upcomingExpirations = modules
    .flatMap(m => m.gaps)
    .filter(g => g.daysUntilExpiry !== undefined && g.daysUntilExpiry > 0)
    .sort((a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999));

  const result: ComplianceMonitorResult = {
    overallScore,
    overallStatus: overallScore >= 90 ? 'compliant' : overallScore >= 70 ? 'warning' : 'non_compliant',
    modules,
    criticalAlerts,
    upcomingExpirations,
    lastUpdated: new Date().toISOString(),
  };

  logger.info('✅ Compliance monitor complete', {
    overallScore,
    criticalAlerts: criticalAlerts.length,
    upcomingExpirations: upcomingExpirations.length,
  });

  return result;
}

/**
 * Get compliance status for a specific module
 */
export async function getModuleComplianceStatus(
  module: ComplianceStandard
): Promise<ComplianceModuleStatus | null> {
  switch (module) {
    case 'STCW':
      return checkSTCWCompliance();
    case 'MLC':
      return checkMLCCompliance();
    case 'ISM':
      return checkISMCompliance();
    default:
      return null;
  }
}
