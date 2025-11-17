// PATCH 599: Smart Drills Service
// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type {
  SmartDrill,
  DrillResponse,
  DrillEvaluation,
  DrillCorrectiveAction,
  DrillScenarioRequest,
  DrillScenarioResponse,
  DrillEvaluationRequest,
  DrillEvaluationResponse,
  DrillStatistics,
} from '@/types/smart-drills';

export class SmartDrillsService {
  /**
   * Get all drills with optional filtering
   */
  static async getDrills(vesselId?: string): Promise<SmartDrill[]> {
    let query = supabase
      .from('smart_drills')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching drills:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single drill by ID
   */
  static async getDrill(id: string): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from('smart_drills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching drill:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new drill
   */
  static async createDrill(drill: Partial<SmartDrill>): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from('smart_drills')
      .insert(drill)
      .select()
      .single();

    if (error) {
      console.error('Error creating drill:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a drill
   */
  static async updateDrill(id: string, updates: Partial<SmartDrill>): Promise<SmartDrill> {
    const { data, error } = await supabase
      .from('smart_drills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating drill:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a drill
   */
  static async deleteDrill(id: string): Promise<void> {
    const { error } = await supabase
      .from('smart_drills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting drill:', error);
      throw error;
    }
  }

  /**
   * Complete a drill
   */
  static async completeDrill(id: string): Promise<SmartDrill> {
    return this.updateDrill(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get responses for a drill
   */
  static async getDrillResponses(drillId: string): Promise<DrillResponse[]> {
    const { data, error } = await supabase
      .from('drill_responses')
      .select('*')
      .eq('drill_id', drillId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching drill responses:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Submit a drill response
   */
  static async submitDrillResponse(
    response: Partial<DrillResponse>
  ): Promise<DrillResponse> {
    const { data, error } = await supabase
      .from('drill_responses')
      .insert(response)
      .select()
      .single();

    if (error) {
      console.error('Error submitting drill response:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get drill evaluation
   */
  static async getDrillEvaluation(drillId: string): Promise<DrillEvaluation | null> {
    const { data, error } = await supabase
      .from('drill_evaluations')
      .select('*')
      .eq('drill_id', drillId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching drill evaluation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create drill evaluation
   */
  static async createDrillEvaluation(
    evaluation: Partial<DrillEvaluation>
  ): Promise<DrillEvaluation> {
    const { data, error } = await supabase
      .from('drill_evaluations')
      .insert(evaluation)
      .select()
      .single();

    if (error) {
      console.error('Error creating drill evaluation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get corrective actions for a drill
   */
  static async getCorrectiveActions(drillId: string): Promise<DrillCorrectiveAction[]> {
    const { data, error } = await supabase
      .from('drill_corrective_actions')
      .select('*')
      .eq('drill_id', drillId)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching corrective actions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create corrective action
   */
  static async createCorrectiveAction(
    action: Partial<DrillCorrectiveAction>
  ): Promise<DrillCorrectiveAction> {
    const { data, error } = await supabase
      .from('drill_corrective_actions')
      .insert(action)
      .select()
      .single();

    if (error) {
      console.error('Error creating corrective action:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update corrective action status
   */
  static async updateCorrectiveAction(
    id: string,
    updates: Partial<DrillCorrectiveAction>
  ): Promise<DrillCorrectiveAction> {
    const { data, error } = await supabase
      .from('drill_corrective_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating corrective action:', error);
      throw error;
    }

    return data;
  }

  /**
   * Generate drill scenario using AI
   */
  static async generateDrillScenario(
    request: DrillScenarioRequest
  ): Promise<DrillScenarioResponse> {
    const { data, error } = await supabase.functions.invoke('generate-drill-scenario', {
      body: request,
    });

    if (error) {
      console.error('Error generating drill scenario:', error);
      throw error;
    }

    return data;
  }

  /**
   * Generate drill evaluation using AI
   */
  static async generateDrillEvaluation(
    request: DrillEvaluationRequest
  ): Promise<DrillEvaluationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-drill-evaluation', {
      body: request,
    });

    if (error) {
      console.error('Error generating drill evaluation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get drill statistics
   */
  static async getDrillStatistics(vesselId?: string): Promise<DrillStatistics> {
    const { data, error } = await supabase.rpc('get_drill_statistics', {
      p_vessel_id: vesselId || null,
    });

    if (error) {
      console.error('Error fetching drill statistics:', error);
      throw error;
    }

    return data;
  }
}
