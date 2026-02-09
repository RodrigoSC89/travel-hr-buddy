/**
 * Compliance Intelligence Service
 * Service layer for compliance audits, PSC readiness, certificates, and regulatory gaps
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ComplianceAction = "audit_overview" | "psc_readiness" | "certificate_status" | "compliance_gaps" | "ai_analysis";

export interface InspectionRecord {
  id: string;
  date: string;
  type: string;
  result: string;
  deficiencies?: number;
  vessel?: string;
}

export interface CertificateRenewal {
  id: string;
  name: string;
  expiryDate: string;
  holder?: string;
  type?: string;
}

export interface ComplianceOverview {
  totalAudits: number;
  pendingNonConformities: number;
  closedNonConformities: number;
  ncClosureRate: number;
  recentInspections: InspectionRecord[];
  auditsByType: Record<string, number>;
}

export interface PSCReadiness {
  totalInspections: number;
  detentions: number;
  detentionRate: number;
  totalDeficiencies: number;
  avgDeficienciesPerInspection: number;
  recentInspections: InspectionRecord[];
  riskLevel: string;
}

export interface CertificateStatus {
  total: number;
  expired: number;
  expiring30Days: number;
  expiring60Days: number;
  valid: number;
  complianceRate: number;
  urgentRenewals: CertificateRenewal[];
}

export class ComplianceIntelligenceService {
  async getAuditOverview(): Promise<ComplianceOverview> {
    try {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "audit_overview" },
      });
      if (error) throw error;
      return data.overview;
    } catch (error) {
      logger.error("Error fetching audit overview", error as Error);
      throw error;
    }
  }

  async getPSCReadiness(): Promise<PSCReadiness> {
    try {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "psc_readiness" },
      });
      if (error) throw error;
      return data.readiness;
    } catch (error) {
      logger.error("Error fetching PSC readiness", error as Error);
      throw error;
    }
  }

  async getCertificateStatus(): Promise<CertificateStatus> {
    try {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "certificate_status" },
      });
      if (error) throw error;
      return data.certificates;
    } catch (error) {
      logger.error("Error fetching certificate status", error as Error);
      throw error;
    }
  }

  async getComplianceGaps(): Promise<Record<string, unknown>> {
    try {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "compliance_gaps" },
      });
      if (error) throw error;
      return data.gaps;
    } catch (error) {
      logger.error("Error fetching compliance gaps", error as Error);
      throw error;
    }
  }

  async runAIAnalysis(): Promise<{ analysis: string; summary: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("compliance-intelligence", {
        body: { action: "ai_analysis" },
      });
      if (error) throw error;
      return { analysis: data.analysis, summary: data.summary };
    } catch (error) {
      logger.error("Error running compliance AI analysis", error as Error);
      throw error;
    }
  }
}

export const complianceIntelligenceService = new ComplianceIntelligenceService();
