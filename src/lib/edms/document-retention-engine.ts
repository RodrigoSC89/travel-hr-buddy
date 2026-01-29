/**
 * Document Retention Policy Engine
 * Enterprise-grade retention management with legal holds
 * PATCH 865 - All-in-One EDMS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  retentionPeriodDays: number;
  retentionPeriodYears?: number;
  action: "archive" | "delete" | "review" | "permanent";
  legalBasis?: string;
  regulations?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalHold {
  id: string;
  name: string;
  description: string;
  reason: string;
  caseReference?: string;
  holdType: "litigation" | "regulatory" | "audit" | "investigation";
  status: "active" | "released" | "expired";
  documentIds: string[];
  createdBy: string;
  createdAt: Date;
  releasedAt?: Date;
  releasedBy?: string;
  expiresAt?: Date;
  metadata: Record<string, unknown>;
}

export interface RetentionSchedule {
  documentId: string;
  documentName: string;
  policyId: string;
  policyName: string;
  createdAt: Date;
  expiresAt: Date;
  daysRemaining: number;
  status: "active" | "expiring_soon" | "expired" | "on_hold";
  action: "archive" | "delete" | "review" | "permanent";
  legalHoldId?: string;
}

export interface DispositionReport {
  id: string;
  reportDate: Date;
  documentsReviewed: number;
  documentsArchived: number;
  documentsDeleted: number;
  documentsOnHold: number;
  documentsExtended: number;
  reviewerId: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes: string;
  details: DispositionDetail[];
}

export interface DispositionDetail {
  documentId: string;
  documentName: string;
  action: string;
  reason: string;
  executedAt: Date;
}

// Maritime-specific retention policies
const MARITIME_RETENTION_POLICIES: Partial<RetentionPolicy>[] = [
  {
    name: "Crew Employment Records",
    category: "HR",
    retentionPeriodYears: 7,
    action: "archive",
    regulations: ["MLC 2006", "GDPR"],
    legalBasis: "MLC 2006 Standard A2.1"
  },
  {
    name: "Safety Training Certificates",
    category: "Training",
    retentionPeriodYears: 10,
    action: "archive",
    regulations: ["STCW", "ISM Code"],
    legalBasis: "STCW Convention Regulation I/2"
  },
  {
    name: "Voyage Records & Logs",
    category: "Operations",
    retentionPeriodYears: 5,
    action: "archive",
    regulations: ["SOLAS", "ISM Code"],
    legalBasis: "SOLAS Chapter V"
  },
  {
    name: "Incident & Accident Reports",
    category: "Safety",
    retentionPeriodYears: 10,
    action: "permanent",
    regulations: ["ISM Code", "MLC 2006"],
    legalBasis: "ISM Code Section 9"
  },
  {
    name: "Environmental Compliance Records",
    category: "Environmental",
    retentionPeriodYears: 7,
    action: "archive",
    regulations: ["MARPOL", "BWM Convention"],
    legalBasis: "MARPOL Annex V"
  },
  {
    name: "Financial Records",
    category: "Finance",
    retentionPeriodYears: 10,
    action: "archive",
    regulations: ["SOX", "Tax Laws"],
    legalBasis: "Sarbanes-Oxley Act"
  },
  {
    name: "Contracts & Agreements",
    category: "Legal",
    retentionPeriodYears: 10,
    action: "archive",
    regulations: ["Commercial Law"],
    legalBasis: "Statute of Limitations"
  },
  {
    name: "Maintenance Records",
    category: "Technical",
    retentionPeriodYears: 15,
    action: "permanent",
    regulations: ["Class Requirements", "ISM Code"],
    legalBasis: "Classification Society Rules"
  },
  {
    name: "PSC Inspection Reports",
    category: "Compliance",
    retentionPeriodYears: 5,
    action: "archive",
    regulations: ["Port State MOU"],
    legalBasis: "Paris MOU / Tokyo MOU"
  },
  {
    name: "Medical Records",
    category: "Health",
    retentionPeriodYears: 30,
    action: "permanent",
    regulations: ["MLC 2006", "HIPAA-like"],
    legalBasis: "MLC 2006 Standard A4.1"
  }
];

class DocumentRetentionEngine {
  private policies: Map<string, RetentionPolicy> = new Map();
  private legalHolds: Map<string, LegalHold> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default maritime retention policies
   */
  private initializeDefaultPolicies(): void {
    MARITIME_RETENTION_POLICIES.forEach((policy, index) => {
      const fullPolicy: RetentionPolicy = {
        id: `policy-${index + 1}`,
        name: policy.name!,
        description: `Retention policy for ${policy.name}`,
        category: policy.category!,
        retentionPeriodDays: (policy.retentionPeriodYears || 5) * 365,
        retentionPeriodYears: policy.retentionPeriodYears,
        action: policy.action || "archive",
        legalBasis: policy.legalBasis,
        regulations: policy.regulations,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.policies.set(fullPolicy.id, fullPolicy);
    });
  }

  /**
   * Create a new retention policy
   */
  async createPolicy(policy: Omit<RetentionPolicy, "id" | "createdAt" | "updatedAt">): Promise<RetentionPolicy> {
    const newPolicy: RetentionPolicy = {
      ...policy,
      id: `policy-${Date.now()}`,
      retentionPeriodDays: policy.retentionPeriodYears 
        ? policy.retentionPeriodYears * 365 
        : policy.retentionPeriodDays,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.policies.set(newPolicy.id, newPolicy);

    // Log to database
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Created retention policy: ${newPolicy.name}`,
        module_name: "document_retention",
        interaction_type: "policy_created",
        ai_response: JSON.stringify(newPolicy)
      });
    } catch (error) {
      logger.error("Error logging policy creation", error as Error);
    }

    return newPolicy;
  }

  /**
   * Apply retention policy to document
   */
  async applyPolicyToDocument(
    documentId: string,
    policyId: string
  ): Promise<RetentionSchedule | null> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      logger.error("Policy not found", new Error("Policy not found"), { policyId });
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + policy.retentionPeriodDays * 24 * 60 * 60 * 1000);
    const daysRemaining = policy.retentionPeriodDays;

    const schedule: RetentionSchedule = {
      documentId,
      documentName: `Document ${documentId}`,
      policyId: policy.id,
      policyName: policy.name,
      createdAt: now,
      expiresAt,
      daysRemaining,
      status: "active",
      action: policy.action
    };

    // Check if document is on legal hold
    const hold = this.findLegalHoldForDocument(documentId);
    if (hold) {
      schedule.status = "on_hold";
      schedule.legalHoldId = hold.id;
    }

    return schedule;
  }

  /**
   * Create a legal hold
   */
  async createLegalHold(hold: Omit<LegalHold, "id" | "createdAt" | "status">): Promise<LegalHold> {
    const newHold: LegalHold = {
      ...hold,
      id: `hold-${Date.now()}`,
      status: "active",
      createdAt: new Date()
    };

    this.legalHolds.set(newHold.id, newHold);

    // Log to database
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Created legal hold: ${newHold.name}`,
        module_name: "document_retention",
        interaction_type: "legal_hold_created",
        ai_response: JSON.stringify({
          holdId: newHold.id,
          type: newHold.holdType,
          documentsAffected: newHold.documentIds.length
        })
      });
    } catch (error) {
      logger.error("Error logging legal hold creation", error as Error);
    }

    return newHold;
  }

  /**
   * Release a legal hold
   */
  async releaseLegalHold(holdId: string, releasedBy: string, reason?: string): Promise<boolean> {
    const hold = this.legalHolds.get(holdId);
    if (!hold) return false;

    hold.status = "released";
    hold.releasedAt = new Date();
    hold.releasedBy = releasedBy;

    // Log release
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Released legal hold: ${hold.name}`,
        module_name: "document_retention",
        interaction_type: "legal_hold_released",
        ai_response: JSON.stringify({
          holdId: hold.id,
          releasedBy,
          reason,
          documentsReleased: hold.documentIds.length
        })
      });
    } catch (error) {
      logger.error("Error logging legal hold release", error as Error);
    }

    return true;
  }

  /**
   * Find legal hold for a document
   */
  private findLegalHoldForDocument(documentId: string): LegalHold | undefined {
    for (const hold of this.legalHolds.values()) {
      if (hold.status === "active" && hold.documentIds.includes(documentId)) {
        return hold;
      }
    }
    return undefined;
  }

  /**
   * Get documents expiring soon
   */
  async getExpiringDocuments(daysThreshold: number = 30): Promise<RetentionSchedule[]> {
    // In production, query from database
    // Here we return simulated data
    const expiringDocs: RetentionSchedule[] = [];
    
    // Simulate expiring documents check
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    logger.info("Checking for documents expiring before", { thresholdDate });

    return expiringDocs;
  }

  /**
   * Execute disposition actions
   */
  async executeDisposition(schedules: RetentionSchedule[], reviewerId: string): Promise<DispositionReport> {
    const report: DispositionReport = {
      id: `disp-${Date.now()}`,
      reportDate: new Date(),
      documentsReviewed: schedules.length,
      documentsArchived: 0,
      documentsDeleted: 0,
      documentsOnHold: 0,
      documentsExtended: 0,
      reviewerId,
      notes: "",
      details: []
    };

    for (const schedule of schedules) {
      // Skip documents on legal hold
      if (schedule.status === "on_hold") {
        report.documentsOnHold++;
        continue;
      }

      const detail: DispositionDetail = {
        documentId: schedule.documentId,
        documentName: schedule.documentName,
        action: schedule.action,
        reason: `Policy: ${schedule.policyName}`,
        executedAt: new Date()
      };

      switch (schedule.action) {
        case "archive":
          report.documentsArchived++;
          detail.action = "archived";
          break;
        case "delete":
          report.documentsDeleted++;
          detail.action = "deleted";
          break;
        case "review":
          detail.action = "marked_for_review";
          break;
        case "permanent":
          detail.action = "retained_permanently";
          break;
      }

      report.details.push(detail);
    }

    // Log disposition report
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Executed disposition for ${schedules.length} documents`,
        module_name: "document_retention",
        interaction_type: "disposition_executed",
        ai_response: JSON.stringify({
          reportId: report.id,
          archived: report.documentsArchived,
          deleted: report.documentsDeleted,
          onHold: report.documentsOnHold
        })
      });
    } catch (error) {
      logger.error("Error logging disposition", error as Error);
    }

    return report;
  }

  /**
   * AI-powered policy recommendation
   */
  async recommendPolicy(documentMetadata: {
    category: string;
    type: string;
    sensitivity: string;
    regulations?: string[];
  }): Promise<RetentionPolicy | null> {
    // Find best matching policy based on metadata
    let bestMatch: RetentionPolicy | null = null;
    let highestScore = 0;

    for (const policy of this.policies.values()) {
      let score = 0;

      // Category match
      if (policy.category.toLowerCase() === documentMetadata.category.toLowerCase()) {
        score += 50;
      }

      // Regulation overlap
      if (documentMetadata.regulations && policy.regulations) {
        const overlap = documentMetadata.regulations.filter(r => 
          policy.regulations!.includes(r)
        ).length;
        score += overlap * 20;
      }

      // Sensitivity adjustment
      if (documentMetadata.sensitivity === "high" && policy.retentionPeriodYears && policy.retentionPeriodYears >= 10) {
        score += 30;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = policy;
      }
    }

    return bestMatch;
  }

  /**
   * Generate retention compliance report
   */
  async generateComplianceReport(organizationId?: string): Promise<{
    totalDocuments: number;
    compliantDocuments: number;
    nonCompliantDocuments: number;
    documentsOnHold: number;
    expiringIn30Days: number;
    expiringIn90Days: number;
    byCategory: Record<string, number>;
    byRegulation: Record<string, number>;
  }> {
    // In production, query actual documents
    // Here we return structure for implementation
    return {
      totalDocuments: 0,
      compliantDocuments: 0,
      nonCompliantDocuments: 0,
      documentsOnHold: this.legalHolds.size,
      expiringIn30Days: 0,
      expiringIn90Days: 0,
      byCategory: {},
      byRegulation: {}
    };
  }

  /**
   * Get all policies
   */
  getPolicies(): RetentionPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get all active legal holds
   */
  getActiveLegalHolds(): LegalHold[] {
    return Array.from(this.legalHolds.values()).filter(h => h.status === "active");
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): RetentionPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Update policy
   */
  async updatePolicy(policyId: string, updates: Partial<RetentionPolicy>): Promise<RetentionPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    const updatedPolicy: RetentionPolicy = {
      ...policy,
      ...updates,
      updatedAt: new Date()
    };

    this.policies.set(policyId, updatedPolicy);
    return updatedPolicy;
  }

  /**
   * Delete policy (soft delete)
   */
  async deactivatePolicy(policyId: string): Promise<boolean> {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    policy.isActive = false;
    policy.updatedAt = new Date();
    return true;
  }
}

export const documentRetentionEngine = new DocumentRetentionEngine();
