/**
 * People Intelligence Service
 * Service layer for crew management, wellbeing, scheduling, and certification matrix
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type PeopleAction = "crew_overview" | "wellbeing_analysis" | "scheduling_optimization" | "certification_matrix" | "ai_analysis";

export interface CrewOverview {
  totalCrew: number;
  byRank: Record<string, number>;
  byStatus: Record<string, number>;
  byNationality: Record<string, number>;
  activeCrew: number;
  onLeave: number;
  available: number;
  totalCertifications: number;
  activeAssignments: number;
}

export interface WellbeingAnalysis {
  crewAtFatigueRisk: number;
  longAssignments: Array<{ crewId: string; startDate: string; daysOnboard: number }>;
  medicalExpirations: number;
  mlcCompliance: {
    maxContinuousService: number;
    avgServiceDays: number;
    overLimitCount: number;
  };
  wellbeingScore: number;
}

export interface SchedulingData {
  activeAssignments: number;
  availableCrew: number;
  pendingRotations: number;
  crewUtilization: number;
  gapAnalysis: {
    positionsNeeded: number;
    surplus: number;
  };
}

export interface CertificationMatrix {
  totalCertifications: number;
  expired: number;
  expiringSoon: number;
  valid: number;
  complianceRate: number;
  byCertType: Record<string, number>;
  urgentRenewals: Array<{ id: string; name: string; expiryDate: string; holder?: string }>;
  stcwCompliance: number;
}

export class PeopleIntelligenceService {
  async getCrewOverview(): Promise<CrewOverview> {
    try {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "crew_overview" },
      });
      if (error) throw error;
      return data.overview;
    } catch (error) {
      logger.error("Error fetching crew overview", error as Error);
      throw error;
    }
  }

  async getWellbeingAnalysis(): Promise<WellbeingAnalysis> {
    try {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "wellbeing_analysis" },
      });
      if (error) throw error;
      return data.wellbeing;
    } catch (error) {
      logger.error("Error fetching wellbeing analysis", error as Error);
      throw error;
    }
  }

  async getSchedulingOptimization(): Promise<SchedulingData> {
    try {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "scheduling_optimization" },
      });
      if (error) throw error;
      return data.scheduling;
    } catch (error) {
      logger.error("Error fetching scheduling optimization", error as Error);
      throw error;
    }
  }

  async getCertificationMatrix(): Promise<CertificationMatrix> {
    try {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "certification_matrix" },
      });
      if (error) throw error;
      return data.matrix;
    } catch (error) {
      logger.error("Error fetching certification matrix", error as Error);
      throw error;
    }
  }

  async runAIAnalysis(): Promise<{ analysis: string; summary: Record<string, unknown> }> {
    try {
      const { data, error } = await supabase.functions.invoke("people-intelligence", {
        body: { action: "ai_analysis" },
      });
      if (error) throw error;
      return { analysis: data.analysis, summary: data.summary };
    } catch (error) {
      logger.error("Error running people AI analysis", error as Error);
      throw error;
    }
  }
}

export const peopleIntelligenceService = new PeopleIntelligenceService();
