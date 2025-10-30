// @ts-nocheck
/**
 * PATCH 407: Sonar AI Service
 * Service layer for CRUD operations on sonar data, analysis, and alerts
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SonarInput {
  id?: string;
  mission_id?: string;
  file_name: string;
  file_type: "JSON" | "CSV" | "TXT";
  file_size: number;
  uploaded_by?: string;
  status?: string;
  raw_data?: any;
  metadata?: any;
}

export interface SonarAnalysis {
  id?: string;
  input_id: string;
  mission_id?: string;
  analysis_type: string;
  ai_model: string;
  confidence_score: number;
  patterns_detected?: any;
  frequency_data?: any;
  anomalies?: any;
  recommendations?: string;
}

export interface SonarAlert {
  id?: string;
  analysis_id: string;
  mission_id?: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  frequency_range?: string;
  location?: any;
  is_acknowledged?: boolean;
  resolved?: boolean;
}

export class SonarAIService {
  // ===== SONAR INPUTS =====
  
  static async createSonarInput(input: SonarInput) {
    try {
      const { data, error } = await supabase
        .from("sonar_inputs")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar input created", { id: data.id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to create sonar input", { error });
      return { data: null, error };
    }
  }

  static async getSonarInputs(missionId?: string) {
    try {
      let query = supabase
        .from("sonar_inputs")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (missionId) {
        query = query.eq("mission_id", missionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to fetch sonar inputs", { error });
      return { data: null, error };
    }
  }

  static async getSonarInput(id: string) {
    try {
      const { data, error } = await supabase
        .from("sonar_inputs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to fetch sonar input", { error, id });
      return { data: null, error };
    }
  }

  static async updateSonarInput(id: string, updates: Partial<SonarInput>) {
    try {
      const { data, error } = await supabase
        .from("sonar_inputs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar input updated", { id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to update sonar input", { error, id });
      return { data: null, error };
    }
  }

  // ===== SONAR ANALYSIS =====
  
  static async createSonarAnalysis(analysis: SonarAnalysis) {
    try {
      const { data, error } = await supabase
        .from("sonar_analysis")
        .insert([analysis])
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar analysis created", { id: data.id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to create sonar analysis", { error });
      return { data: null, error };
    }
  }

  static async getSonarAnalyses(inputId?: string) {
    try {
      let query = supabase
        .from("sonar_analysis")
        .select("*")
        .order("processed_at", { ascending: false });

      if (inputId) {
        query = query.eq("input_id", inputId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to fetch sonar analyses", { error });
      return { data: null, error };
    }
  }

  // ===== SONAR ALERTS =====
  
  static async createSonarAlert(alert: SonarAlert) {
    try {
      const { data, error } = await supabase
        .from("sonar_alerts")
        .insert([alert])
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar alert created", { id: data.id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to create sonar alert", { error });
      return { data: null, error };
    }
  }

  static async getSonarAlerts(params?: { missionId?: string; severity?: string; acknowledged?: boolean }) {
    try {
      let query = supabase
        .from("sonar_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (params?.missionId) {
        query = query.eq("mission_id", params.missionId);
      }
      if (params?.severity) {
        query = query.eq("severity", params.severity);
      }
      if (params?.acknowledged !== undefined) {
        query = query.eq("is_acknowledged", params.acknowledged);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to fetch sonar alerts", { error });
      return { data: null, error };
    }
  }

  static async getCriticalAlerts() {
    return this.getSonarAlerts({ severity: "critical", acknowledged: false });
  }

  static async acknowledgeAlert(id: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from("sonar_alerts")
        .update({
          is_acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar alert acknowledged", { id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to acknowledge sonar alert", { error, id });
      return { data: null, error };
    }
  }

  static async resolveAlert(id: string) {
    try {
      const { data, error } = await supabase
        .from("sonar_alerts")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      logger.info("Sonar alert resolved", { id });
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to resolve sonar alert", { error, id });
      return { data: null, error };
    }
  }

  // ===== BULK OPERATIONS =====
  
  static async saveScanComplete(input: SonarInput, analysis: SonarAnalysis, alerts: SonarAlert[]) {
    try {
      // Create input
      const { data: inputData, error: inputError } = await this.createSonarInput(input);
      if (inputError || !inputData) throw inputError;

      // Create analysis
      analysis.input_id = inputData.id!;
      const { data: analysisData, error: analysisError } = await this.createSonarAnalysis(analysis);
      if (analysisError || !analysisData) throw analysisError;

      // Create alerts
      const alertsWithAnalysisId = alerts.map(alert => ({
        ...alert,
        analysis_id: analysisData.id!,
      }));

      const { data: alertsData, error: alertsError } = await supabase
        .from("sonar_alerts")
        .insert(alertsWithAnalysisId)
        .select();

      if (alertsError) throw alertsError;

      logger.info("Complete sonar scan saved", { 
        inputId: inputData.id, 
        analysisId: analysisData.id,
        alertsCount: alertsData?.length || 0 
      });

      return { 
        data: { input: inputData, analysis: analysisData, alerts: alertsData }, 
        error: null 
      };
    } catch (error) {
      logger.error("Failed to save complete sonar scan", { error });
      return { data: null, error };
    }
  }

  // ===== STATS =====
  
  static async getAlertStats() {
    try {
      const { data, error } = await supabase
        .from("sonar_alerts_stats")
        .select("*")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logger.error("Failed to fetch alert stats", { error });
      return { data: null, error };
    }
  }
}
