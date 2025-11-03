/**
 * PATCH 606 - Remote Audits Types
 */

export type AuditStatus = "draft" | "in_progress" | "review" | "completed" | "rejected";
export type ChecklistResponse = "yes" | "no" | "n/a" | "partial";
export type EvidenceVerificationStatus = "pending" | "verified" | "rejected" | "requires_review";

export interface RemoteAudit {
  id: string;
  auditType: string;
  vesselId?: string;
  moduleName?: string;
  status: AuditStatus;
  score?: number;
  maxScore: number;
  compliancePercentage?: number;
  auditorId?: string;
  reviewerId?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  reviewDate?: Date;
  findings: string[];
  recommendations: string[];
  aiAnalysis?: AIAuditAnalysis;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RemoteAuditChecklistItem {
  id: string;
  auditId: string;
  section: string;
  itemNumber?: number;
  question: string;
  response?: ChecklistResponse;
  evidenceRequired: boolean;
  evidenceUploaded: boolean;
  notes?: string;
  aiValidation?: AIChecklistValidation;
  scoreValue?: number;
  maxScoreValue: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RemoteAuditEvidence {
  id: string;
  auditId: string;
  checklistItemId?: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  storagePath: string;
  uploadedBy?: string;
  uploadedAt: Date;
  ocrText?: string;
  ocrProcessed: boolean;
  aiAnalysis?: AIEvidenceAnalysis;
  verificationStatus: EvidenceVerificationStatus;
  metadata?: Record<string, any>;
}

export interface AIAuditAnalysis {
  overallCompliance: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  keyFindings: string[];
  recommendations: string[];
  confidence: number;
  processingTimestamp: string;
}

export interface AIChecklistValidation {
  isCompliant: boolean;
  confidence: number;
  reasoning: string;
  suggestedResponse?: ChecklistResponse;
  evidenceQuality?: "excellent" | "good" | "fair" | "poor";
  flags: string[];
}

export interface AIEvidenceAnalysis {
  documentType: string;
  confidence: number;
  extractedData: Record<string, any>;
  complianceChecks: {
    item: string;
    passed: boolean;
    details: string;
  }[];
  quality: "excellent" | "good" | "fair" | "poor";
  recommendations: string[];
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  blocks: {
    text: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
}

export interface AuditReport {
  audit: RemoteAudit;
  checklist: RemoteAuditChecklistItem[];
  evidence: RemoteAuditEvidence[];
  summary: {
    totalItems: number;
    completedItems: number;
    complianceRate: number;
    evidenceCount: number;
    aiVerifiedCount: number;
  };
}
