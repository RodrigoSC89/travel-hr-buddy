/**
 * ISM Audit Types and Interfaces
 * PATCH-609: ISM Audits Module
 */

export type AuditType = "internal" | "external";
export type ComplianceStatus = "compliant" | "non-compliant" | "not-applicable" | "pending";
export type AuditStatus = "draft" | "in-progress" | "completed" | "approved";

export interface ISMAuditItem {
  id: string;
  question: string;
  category: string;
  compliant: ComplianceStatus;
  notes: string;
  evidence?: string[];
  aiAnalysis?: string;
  aiConfidence?: number;
  timestamp?: string;
}

export interface ISMAudit {
  id: string;
  vesselId: string;
  vesselName: string;
  auditType: AuditType;
  auditDate: string;
  auditor: string;
  port?: string;
  status: AuditStatus;
  items: ISMAuditItem[];
  complianceScore?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ISMChecklistTemplate {
  category: string;
  questions: string[];
}

export const ISM_CHECKLIST_TEMPLATES: ISMChecklistTemplate[] = [
  {
    category: "Safety Management System",
    questions: [
      "Is there a documented Safety Management System (SMS) in place?",
      "Has the SMS been reviewed and approved by management?",
      "Are all crew members familiar with SMS procedures?",
      "Is there evidence of regular SMS audits?"
    ]
  },
  {
    category: "Emergency Preparedness",
    questions: [
      "Are emergency procedures clearly documented and accessible?",
      "Have emergency drills been conducted as per schedule?",
      "Is emergency equipment properly maintained and inspected?",
      "Are crew members trained in emergency response procedures?"
    ]
  },
  {
    category: "Maintenance Management",
    questions: [
      "Is there a planned maintenance system in place?",
      "Are maintenance records complete and up-to-date?",
      "Is critical equipment regularly inspected?",
      "Are spare parts inventory properly managed?"
    ]
  },
  {
    category: "Documentation and Records",
    questions: [
      "Are all required certificates valid and available?",
      "Is crew documentation complete and current?",
      "Are logbooks properly maintained?",
      "Is there a document control system in place?"
    ]
  },
  {
    category: "Training and Competence",
    questions: [
      "Are all crew members appropriately qualified?",
      "Is there evidence of ongoing training programs?",
      "Are training records complete and accessible?",
      "Is familiarization training provided for new crew?"
    ]
  }
];

export interface ComplianceScoreResult {
  totalItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  notApplicableItems: number;
  pendingItems: number;
  score: number; // Percentage
  grade: "A" | "B" | "C" | "D" | "F";
}

export function calculateComplianceScore(items: ISMAuditItem[]): ComplianceScoreResult {
  const totalItems = items.length;
  const compliantItems = items.filter(i => i.compliant === "compliant").length;
  const nonCompliantItems = items.filter(i => i.compliant === "non-compliant").length;
  const notApplicableItems = items.filter(i => i.compliant === "not-applicable").length;
  const pendingItems = items.filter(i => i.compliant === "pending").length;
  
  // Calculate score based on compliant items vs applicable items
  const applicableItems = totalItems - notApplicableItems;
  const score = applicableItems > 0 ? (compliantItems / applicableItems) * 100 : 0;
  
  // Determine grade
  let grade: "A" | "B" | "C" | "D" | "F";
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";
  else grade = "F";
  
  return {
    totalItems,
    compliantItems,
    nonCompliantItems,
    notApplicableItems,
    pendingItems,
    score: Math.round(score),
    grade
  };
}
