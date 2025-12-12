/**
 * UNIFIED SMART DRILLS SERVICE
 * Fusão de: smart-drills.service.ts + smart-drills-engine.ts
 * 
 * Combina:
 * - CRUD operations (smart-drills.service.ts)
 * - AI scenario generation (smart-drills-engine.ts)
 * - AI evaluation (smart-drills-engine.ts)
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

// ============================================
// TYPES
// ============================================

export type DrillType = "FIRE" | "ABANDON_SHIP" | "MAN_OVERBOARD" | "COLLISION" | "POLLUTION" | "MEDICAL" | "SECURITY" | "GENERAL";
export type DrillDifficulty = "basic" | "intermediate" | "advanced" | "expert";
export type DrillStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type DrillScheduleFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

export interface DrillScenario {
  id?: string;
  title: string;
  scenario_title?: string;
  type: DrillType;
  scenario_type?: DrillType;
  difficulty: DrillDifficulty;
  description: string;
  scenario_details?: {
    location: string;
    timeOfDay: string;
    weatherConditions: string;
    initialConditions: string;
    challenges: string[];
    expectedDuration: number;
  };
  expected_responses?: ExpectedResponse[];
  evaluation_criteria?: EvaluationCriterion[];
  vessel_id?: string;
  ai_generated?: boolean;
  created_by?: string;
}

export interface ExpectedResponse {
  action: string;
  timeframe: string;
  criticalityLevel: "critical" | "high" | "medium" | "low";
  responsibleRole: string;
}

export interface EvaluationCriterion {
  criterion: string;
  weight: number;
  description: string;
}

export interface SmartDrill {
  id: string;
  scenario_id?: string;
  vessel_id: string;
  drill_type: DrillType;
  title: string;
  description?: string;
  difficulty?: DrillDifficulty;
  scheduled_date: string;
  status: DrillStatus;
  participants?: Json;
  actual_duration_minutes?: number;
  weather_conditions?: string;
  notes?: string;
  completed_at?: string;
  conducted_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DrillResponse {
  id: string;
  drill_id: string;
  crew_member_id: string;
  responses?: Json;
  decision_points?: Json;
  reaction_time_seconds?: number;
  time_taken_seconds?: number;
  actions_taken?: Json;
  mistakes?: Json;
  strengths?: Json;
  overall_score?: number;
  correctness_score?: number;
  ai_evaluation?: string;
  ai_feedback?: Json;
  created_at?: string;
}

export interface DrillEvaluation {
  id: string;
  drill_id: string;
  overall_score: number;
  summary?: string;
  evaluation_summary?: string;
  strengths: Json;
  weaknesses: Json;
  recommendations?: Json;
  ai_generated?: boolean;
  evaluated_by?: string;
  created_at?: string;
}

export interface DrillCorrectiveAction {
  id: string;
  drill_id: string;
  crew_member_id?: string;
  issue_identified?: string;
  action_title?: string;
  recommended_action?: string;
  action_description?: string;
  priority?: "critical" | "high" | "medium" | "low" | string;
  training_required?: boolean;
  training_type?: string;
  deadline?: string;
  due_date?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled" | string;
  assigned_to?: string;
  completed_at?: string;
}

export interface DrillScenarioRequest {
  drill_type: DrillType;
  difficulty: DrillDifficulty;
  vessel_id: string;
  historical_failures?: string[];
}

export interface DrillScenarioResponse {
  scenario: DrillScenario;
  success: boolean;
  message?: string;
}

export interface DrillEvaluationRequest {
  drill_id: string;
  responses: DrillResponse[];
}

export interface DrillEvaluationResponse {
  evaluation: DrillEvaluation;
  corrective_actions: DrillCorrectiveAction[];
  success: boolean;
}

export interface DrillStatistics {
  total_drills: number;
  drills_this_month: number;
  average_score: number;
  completion_rate: number;
  by_type: Record<DrillType, number>;
}

// ============================================
// UNIFIED SMART DRILLS SERVICE
// ============================================

export const SmartDrills = {
  // ============================================
  // DRILLS CRUD
  // ============================================

  async getDrills(vesselId?: string): Promise<SmartDrill[]> {
    let query = supabase
      .from("smart_drills")
      .select("*")
      .order("scheduled_date", { ascending: false });

    if (vesselId) {
      query = query.eq("vessel_id", vesselId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Error fetching drills", error as Error, { vesselId });
      throw error;
    }

    return (data || []) as SmartDrill[];
  },

  async getDrill(id: string): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from("smart_drills")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching drill", error as Error, { drillId: id });
      throw error;
    }

    return data as SmartDrill;
  },

  async createDrill(drill: Partial<SmartDrill>): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from("smart_drills")
      .insert(drill as any)
      .select()
      .single();

    if (error) {
      logger.error("Error creating drill", error as Error, { drillType: drill.drill_type });
      throw error;
    }

    return data as SmartDrill;
  },

  async updateDrill(id: string, updates: Partial<SmartDrill>): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from("smart_drills")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating drill", error as Error, { drillId: id });
      throw error;
    }

    return data as SmartDrill;
  },

  async deleteDrill(id: string): Promise<void> {
    const { error } = await supabase
      .from("smart_drills")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting drill", error as Error, { drillId: id });
      throw error;
    }
  },

  async completeDrill(id: string): Promise<SmartDrill> {
    return this.updateDrill(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  },

  // ============================================
  // RESPONSES
  // ============================================

  async getDrillResponses(drillId: string): Promise<DrillResponse[]> {
    const { data, error } = await supabase
      .from("drill_responses")
      .select("*")
      .eq("drill_id", drillId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching drill responses", error as Error, { drillId });
      throw error;
    }

    return (data || []) as DrillResponse[];
  },

  async submitDrillResponse(response: Partial<DrillResponse>): Promise<DrillResponse> {
    const { data, error } = await supabase
      .from("drill_responses")
      .insert(response as any)
      .select()
      .single();

    if (error) {
      logger.error("Error submitting drill response", error as Error, { drillId: response.drill_id });
      throw error;
    }

    return data as DrillResponse;
  },

  // ============================================
  // EVALUATIONS
  // ============================================

  async getDrillEvaluation(drillId: string): Promise<DrillEvaluation | null> {
    const { data, error } = await supabase
      .from("drill_evaluations")
      .select("*")
      .eq("drill_id", drillId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Error fetching drill evaluation", error as Error, { drillId });
      throw error;
    }

    return data as DrillEvaluation | null;
  },

  async createDrillEvaluation(evaluation: Partial<DrillEvaluation>): Promise<DrillEvaluation> {
    const { data, error } = await supabase
      .from("drill_evaluations")
      .insert(evaluation as any)
      .select()
      .single();

    if (error) {
      logger.error("Error creating drill evaluation", error as Error, { drillId: evaluation.drill_id });
      throw error;
    }

    return data as DrillEvaluation;
  },

  // ============================================
  // CORRECTIVE ACTIONS
  // ============================================

  async getCorrectiveActions(drillId: string): Promise<DrillCorrectiveAction[]> {
    const { data, error } = await supabase
      .from("drill_corrective_actions")
      .select("*")
      .eq("drill_id", drillId)
      .order("priority", { ascending: false });

    if (error) {
      logger.error("Error fetching corrective actions", error as Error, { drillId });
      throw error;
    }

    return (data || []) as DrillCorrectiveAction[];
  },

  async createCorrectiveAction(action: Partial<DrillCorrectiveAction>): Promise<DrillCorrectiveAction> {
    const { data, error } = await supabase
      .from("drill_corrective_actions")
      .insert(action as any)
      .select()
      .single();

    if (error) {
      logger.error("Error creating corrective action", error as Error, { drillId: action.drill_id });
      throw error;
    }

    return data as DrillCorrectiveAction;
  },

  async updateCorrectiveAction(id: string, updates: Partial<DrillCorrectiveAction>): Promise<DrillCorrectiveAction> {
    const { data, error } = await supabase
      .from("drill_corrective_actions")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating corrective action", error as Error, { actionId: id });
      throw error;
    }

    return data as DrillCorrectiveAction;
  },

  // ============================================
  // AI GENERATION
  // ============================================

  async generateDrillScenario(request: DrillScenarioRequest): Promise<DrillScenarioResponse> {
    const { data, error } = await supabase.functions.invoke("generate-drill-scenario", {
      body: request,
    });

    if (error) {
      logger.error("Error generating drill scenario", error as Error, { drillType: request.drill_type });
      throw error;
    }

    if (!data) {
      throw new Error("No drill scenario returned");
    }

    return data;
  },

  async generateDrillEvaluation(request: DrillEvaluationRequest): Promise<DrillEvaluationResponse> {
    const { data, error } = await supabase.functions.invoke("generate-drill-evaluation", {
      body: request,
    });

    if (error) {
      logger.error("Error generating drill evaluation", error as Error, { drillId: request.drill_id });
      throw error;
    }

    if (!data) {
      throw new Error("No drill evaluation returned");
    }

    return data;
  },

  // ============================================
  // STATISTICS
  // ============================================

  async getDrillStatistics(vesselId?: string): Promise<DrillStatistics> {
    const { data, error } = await supabase.rpc("get_drill_statistics") as { data: DrillStatistics | null; error: any };

    if (error) {
      logger.error("Error fetching drill statistics", error as Error, { vesselId });
      // Return default stats
      return {
        total_drills: 0,
        drills_this_month: 0,
        average_score: 0,
        completion_rate: 0,
        by_type: {} as Record<DrillType, number>
      });
    }

    return data || {
      total_drills: 0,
      drills_this_month: 0,
      average_score: 0,
      completion_rate: 0,
      by_type: {} as Record<DrillType, number>
    });
  }
};

// Backward compatibility class export
export class SmartDrillsService {
  static getDrills = SmartDrills.getDrills;
  static getDrill = SmartDrills.getDrill;
  static createDrill = SmartDrills.createDrill;
  static updateDrill = SmartDrills.updateDrill;
  static deleteDrill = SmartDrills.deleteDrill;
  static completeDrill = SmartDrills.completeDrill;
  static getDrillResponses = SmartDrills.getDrillResponses;
  static submitDrillResponse = SmartDrills.submitDrillResponse;
  static getDrillEvaluation = SmartDrills.getDrillEvaluation;
  static createDrillEvaluation = SmartDrills.createDrillEvaluation;
  static getCorrectiveActions = SmartDrills.getCorrectiveActions;
  static createCorrectiveAction = SmartDrills.createCorrectiveAction;
  static updateCorrectiveAction = SmartDrills.updateCorrectiveAction;
  static generateDrillScenario = SmartDrills.generateDrillScenario;
  static generateDrillEvaluation = SmartDrills.generateDrillEvaluation;
  static getDrillStatistics = SmartDrills.getDrillStatistics;
}

// Legacy function exports
export const generateDrillScenario = SmartDrills.generateDrillScenario.bind(SmartDrills);
export const evaluateDrillResponses = SmartDrills.generateDrillEvaluation.bind(SmartDrills);

export default SmartDrills;
