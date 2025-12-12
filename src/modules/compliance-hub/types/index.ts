/**
 * Compliance Hub Types and Interfaces
 * Tipos centralizados para o módulo de conformidade
 */

export type ComplianceStatus = "compliant" | "non-compliant" | "partial" | "pending" | "expired";
export type AuditStatus = "scheduled" | "in-progress" | "completed" | "cancelled";
export type FindingSeverity = "critical" | "major" | "minor" | "observation";
export type CertificateStatus = "valid" | "expiring-soon" | "expired" | "pending-renewal";

export interface ComplianceItem {
  id: string;
  code: string;
  title: string;
  category: string;
  regulation: string;
  status: ComplianceStatus;
  lastAuditDate: string;
  nextAuditDate: string;
  responsibleId: string;
  responsibleName: string;
  vesselId: string;
  vesselName: string;
  evidence: string[];
  notes: string;
  score: number;
}

export interface AuditSession {
  id: string;
  auditType: "internal" | "external" | "flag-state" | "class" | "psc";
  vesselId: string;
  vesselName: string;
  auditorId: string;
  auditorName: string;
  scheduledDate: string;
  completedDate?: string;
  status: AuditStatus;
  findings: AuditFinding[];
  score: number;
  report?: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  category: string;
  description: string;
  severity: FindingSeverity;
  status: "open" | "in-progress" | "closed" | "verified";
  correctiveAction: string;
  responsibleId: string;
  responsibleName: string;
  dueDate: string;
  closedDate?: string;
  evidence: string[];
  aiAnalysis?: string;
}

export interface Certificate {
  id: string;
  name: string;
  type: string;
  issuingAuthority: string;
  vesselId: string;
  vesselName: string;
  issueDate: string;
  expiryDate: string;
  status: CertificateStatus;
  documentUrl?: string;
  reminderDays: number;
}

export interface Regulation {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  effectiveDate: string;
  requirements: RegulationRequirement[];
  isActive: boolean;
}

export interface RegulationRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  isMandatory: boolean;
  applicableVesselTypes: string[];
}

export interface ComplianceAlert {
  id: string;
  type: "certificate-expiry" | "audit-due" | "finding-overdue" | "regulation-update" | "ai-insight";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  relatedItemId: string;
  relatedItemType: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ComplianceKPIs {
  overallScore: number;
  certificatesValid: number;
  certificatesTotal: number;
  openFindings: number;
  closedFindings: number;
  upcomingAudits: number;
  overdueItems: number;
  trendPercentage: number;
  trendDirection: "up" | "down" | "stable";
}

export interface AIComplianceAnalysis {
  overallRiskLevel: "low" | "medium" | "high" | "critical";
  riskAreas: {
    area: string;
    risk: number;
    trend: "improving" | "stable" | "worsening";
    recommendation: string;
  }[];
  predictedIssues: {
    issue: string;
    probability: number;
    impact: string;
    preventiveAction: string;
  }[];
  complianceGaps: {
    regulation: string;
    gap: string;
    priority: "high" | "medium" | "low";
    suggestedAction: string;
  }[];
  auditReadiness: {
    type: string;
    readinessScore: number;
    weakAreas: string[];
    recommendations: string[];
  }[];
  summary: string;
}

export interface ComplianceTraining {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  crewMemberRank: string;
  courseId: string;
  courseName: string;
  category: string;
  status: "not-started" | "in-progress" | "completed" | "expired";
  progress: number;
  startDate?: string;
  completedDate?: string;
  expiryDate?: string;
  score?: number;
  certificateNumber?: string;
  isMandatory: boolean;
}

export interface TrainingMatrix {
  vesselId: string;
  vesselName: string;
  crewMembers: {
    id: string;
    name: string;
    rank: string;
    trainings: {
      courseId: string;
      courseName: string;
      status: ComplianceTraining["status"];
      expiryDate?: string;
    }[];
  }[];
  overallCompliance: number;
}
