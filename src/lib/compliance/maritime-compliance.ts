/**
 * Maritime Compliance System - PROMPT 4
 * IMO, MLC 2006, SOLAS, MARPOL, ISM, ISPS compliance
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type RegulationType = 
  | "IMO"
  | "MLC_2006"
  | "SOLAS"
  | "MARPOL"
  | "ISM_CODE"
  | "ISPS_CODE"
  | "STCW"
  | "GDPR"
  | "LGPD";

export interface ComplianceRequirement {
  id: string;
  regulation: RegulationType;
  requirement: string;
  description: string;
  mandatory: boolean;
  deadline?: Date;
  status: "compliant" | "non_compliant" | "pending" | "not_applicable";
  evidence?: string[];
  lastAudit?: Date;
  nextAudit?: Date;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  module: string;
  resourceType: string;
  resourceId: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// Maritime regulation requirements
const MARITIME_REQUIREMENTS: Omit<ComplianceRequirement, "id" | "status">[] = [
  // MLC 2006 - Maritime Labour Convention
  {
    regulation: "MLC_2006",
    requirement: "Minimum age requirements",
    description: "Seafarers must be at least 16 years old",
    mandatory: true,
  },
  {
    regulation: "MLC_2006",
    requirement: "Medical certificates",
    description: "All seafarers must hold valid medical certificates",
    mandatory: true,
  },
  {
    regulation: "MLC_2006",
    requirement: "Seafarer employment agreements",
    description: "Written agreements for all seafarers",
    mandatory: true,
  },
  {
    regulation: "MLC_2006",
    requirement: "Hours of work and rest",
    description: "Compliance with work/rest hour limits",
    mandatory: true,
  },
  {
    regulation: "MLC_2006",
    requirement: "Wages payment",
    description: "Regular and full payment of wages",
    mandatory: true,
  },
  // SOLAS - Safety of Life at Sea
  {
    regulation: "SOLAS",
    requirement: "Life-saving appliances",
    description: "Adequate life-saving equipment on board",
    mandatory: true,
  },
  {
    regulation: "SOLAS",
    requirement: "Fire safety measures",
    description: "Fire detection and suppression systems",
    mandatory: true,
  },
  {
    regulation: "SOLAS",
    requirement: "Navigation safety",
    description: "Proper navigation equipment and procedures",
    mandatory: true,
  },
  // ISM Code
  {
    regulation: "ISM_CODE",
    requirement: "Safety management system",
    description: "Documented SMS in place",
    mandatory: true,
  },
  {
    regulation: "ISM_CODE",
    requirement: "Designated Person Ashore",
    description: "DPA appointed and accessible",
    mandatory: true,
  },
  // STCW
  {
    regulation: "STCW",
    requirement: "Crew certification",
    description: "All crew hold valid STCW certificates",
    mandatory: true,
  },
  {
    regulation: "STCW",
    requirement: "Training records",
    description: "Maintained training and certification records",
    mandatory: true,
  },
];

class MaritimeComplianceSystem {
  private auditBuffer: AuditTrailEntry[] = [];
  private readonly BUFFER_FLUSH_SIZE = 50;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoFlush();
  }

  /**
   * Get all compliance requirements with status
   */
  async getComplianceStatus(): Promise<ComplianceRequirement[]> {
    // In production, this would check actual data
    return MARITIME_REQUIREMENTS.map((req, index) => ({
      ...req,
      id: `req-${index}`,
      status: "pending" as const,
    }));
  }

  /**
   * Check MLC 2006 compliance for a crew member
   */
  async checkMLCCompliance(crewMemberId: string): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const { data: crew } = await supabase
        .from("crew_members")
        .select("*")
        .eq("id", crewMemberId)
        .single();

      if (!crew) {
        return { compliant: false, issues: ["Crew member not found"] };
      }

      // Check age requirement (date_of_birth may not be in schema)
      const crewData = crew as Record<string, unknown>;
      if (crewData.date_of_birth) {
        const age = this.calculateAge(new Date(crewData.date_of_birth as string));
        if (age < 16) {
          issues.push("MLC 2006: Minimum age requirement not met (16 years)");
        }
      }

      // Check medical certificate
      const { data: medicalCert } = await supabase
        .from("crew_certifications")
        .select("*")
        .eq("crew_member_id", crewMemberId)
        .eq("certification_type", "medical")
        .gte("expiry_date", new Date().toISOString())
        .single();

      if (!medicalCert) {
        issues.push("MLC 2006: Valid medical certificate required");
      }

      // Check employment agreement
      const { data: contract } = await supabase
        .from("crew_contracts")
        .select("*")
        .eq("crew_member_id", crewMemberId)
        .eq("status", "active")
        .single();

      if (!contract) {
        issues.push("MLC 2006: Active employment agreement required");
      }

      return {
        compliant: issues.length === 0,
        issues,
      };
    } catch (error) {
      logger.error("MLC compliance check failed", { error, crewMemberId });
      return { compliant: false, issues: ["Compliance check failed"] };
    }
  }

  /**
   * Log audit trail entry
   */
  logAudit(entry: Omit<AuditTrailEntry, "id" | "timestamp">): void {
    const auditEntry: AuditTrailEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    this.auditBuffer.push(auditEntry);

    // Flush if buffer is full
    if (this.auditBuffer.length >= this.BUFFER_FLUSH_SIZE) {
      this.flushAuditLog();
    }
  }

  /**
   * Flush audit log to storage
   */
  async flushAuditLog(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    const entries = [...this.auditBuffer];
    this.auditBuffer = [];

    try {
      // Store in localStorage for now (would use server in production)
      const existing = JSON.parse(localStorage.getItem("audit_log") || "[]");
      const updated = [...existing, ...entries].slice(-10000); // Keep last 10k
      localStorage.setItem("audit_log", JSON.stringify(updated));
    } catch (error) {
      logger.error("Failed to flush audit log", { error });
      // Re-add entries to buffer on failure
      this.auditBuffer = [...entries, ...this.auditBuffer];
    }
  }

  /**
   * Get audit trail entries
   */
  getAuditTrail(filters?: {
    userId?: string;
    module?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditTrailEntry[] {
    try {
      let entries: AuditTrailEntry[] = JSON.parse(
        localStorage.getItem("audit_log") || "[]"
      );

      if (filters?.userId) {
        entries = entries.filter((e) => e.userId === filters.userId);
      }
      if (filters?.module) {
        entries = entries.filter((e) => e.module === filters.module);
      }
      if (filters?.startDate) {
        entries = entries.filter(
          (e) => new Date(e.timestamp) >= filters.startDate!
        );
      }
      if (filters?.endDate) {
        entries = entries.filter(
          (e) => new Date(e.timestamp) <= filters.endDate!
        );
      }

      // Sort by timestamp desc
      entries.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return entries.slice(0, filters?.limit || 100);
    } catch {
      return [];
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(): Promise<{
    summary: {
      total: number;
      compliant: number;
      nonCompliant: number;
      pending: number;
    };
    byRegulation: Record<string, { compliant: number; total: number }>;
    recommendations: string[];
  }> {
    const requirements = await this.getComplianceStatus();

    const summary = {
      total: requirements.length,
      compliant: requirements.filter((r) => r.status === "compliant").length,
      nonCompliant: requirements.filter((r) => r.status === "non_compliant").length,
      pending: requirements.filter((r) => r.status === "pending").length,
    };

    const byRegulation: Record<string, { compliant: number; total: number }> = {};
    requirements.forEach((req) => {
      if (!byRegulation[req.regulation]) {
        byRegulation[req.regulation] = { compliant: 0, total: 0 };
      }
      byRegulation[req.regulation].total++;
      if (req.status === "compliant") {
        byRegulation[req.regulation].compliant++;
      }
    });

    const recommendations: string[] = [];
    if (summary.nonCompliant > 0) {
      recommendations.push("Address non-compliant items immediately");
    }
    if (summary.pending > 0) {
      recommendations.push("Review and update pending compliance items");
    }

    return { summary, byRegulation, recommendations };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushAuditLog();
    }, 30000); // Flush every 30 seconds
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushAuditLog();
  }
}

export const maritimeCompliance = new MaritimeComplianceSystem();
