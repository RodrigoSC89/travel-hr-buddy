/**
 * Pre-Port State Control (Pre-PSC) Service
 * Handles all database operations for PSC inspections
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface PrePSCInspection {
  id?: string;
  vessel_id?: string;
  inspector_id?: string;
  inspector_name: string;
  inspection_date?: string;
  port_country?: string;
  inspection_type?: string;
  status?: "draft" | "in_progress" | "completed" | "submitted";
  ai_summary?: string;
  ai_risk_level?: "low" | "medium" | "high" | "critical";
  total_score?: number;
  conformity_percentage?: number;
  flagged_items?: number;
  findings?: any[];
  recommendations?: any[];
  corrective_actions?: any[];
  signed_by?: string;
  signature_hash?: string;
  signature_date?: string;
  pdf_url?: string;
  pdf_generated_at?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface PrePSCChecklistItem {
  id?: string;
  inspection_id: string;
  category: string;
  subcategory?: string;
  item_code?: string;
  question: string;
  reference_regulation?: string;
  response?: string;
  conformity?: boolean;
  status?: "pending" | "compliant" | "non_compliant" | "not_applicable" | "requires_action";
  evidence_urls?: string[];
  evidence_notes?: string;
  ai_risk_assessment?: string;
  ai_confidence_score?: number;
  ai_suggested_action?: string;
  corrective_action?: string;
  action_priority?: "low" | "medium" | "high" | "critical";
  action_deadline?: string;
  action_status?: "pending" | "in_progress" | "completed" | "overdue";
  created_at?: string;
  updated_at?: string;
  inspector_comments?: string;
  metadata?: Record<string, any>;
}

export interface InspectionStats {
  totalInspections: number;
  draftInspections: number;
  completedInspections: number;
  submittedInspections: number;
  averageScore: number;
  criticalItems: number;
  nonCompliantItems: number;
}

class PrePSCService {
  /**
   * Create a new PSC inspection
   */
  async createInspection(inspection: PrePSCInspection): Promise<PrePSCInspection> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const inspectionData = {
        ...inspection,
        inspector_id: user.user?.id,
        status: inspection.status || "draft",
        inspection_type: inspection.inspection_type || "self-assessment",
      };

      const { data, error } = await supabase
        .from("pre_psc_inspections")
        .insert(inspectionData)
        .select()
        .single();

      if (error) throw error;
      logger.info("PSC inspection created", { inspectionId: data.id });
      return data;
    } catch (error) {
      logger.error("Error creating PSC inspection", { error });
      throw error;
    }
  }

  /**
   * Get inspection by ID
   */
  async getInspection(inspectionId: string): Promise<PrePSCInspection> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_inspections")
        .select("*")
        .eq("id", inspectionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error fetching PSC inspection", { error, inspectionId });
      throw error;
    }
  }

  /**
   * List all inspections with filters
   */
  async listInspections(filters?: {
    vessel_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PrePSCInspection[]> {
    try {
      let query = supabase
        .from("pre_psc_inspections")
        .select("*")
        .order("inspection_date", { ascending: false });

      if (filters?.vessel_id) {
        query = query.eq("vessel_id", filters.vessel_id);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error listing PSC inspections", { error });
      throw error;
    }
  }

  /**
   * Update inspection
   */
  async updateInspection(inspectionId: string, updates: Partial<PrePSCInspection>): Promise<PrePSCInspection> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_inspections")
        .update(updates)
        .eq("id", inspectionId)
        .select()
        .single();

      if (error) throw error;
      logger.info("PSC inspection updated", { inspectionId });
      return data;
    } catch (error) {
      logger.error("Error updating PSC inspection", { error, inspectionId });
      throw error;
    }
  }

  /**
   * Delete inspection
   */
  async deleteInspection(inspectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("pre_psc_inspections")
        .delete()
        .eq("id", inspectionId);

      if (error) throw error;
      logger.info("PSC inspection deleted", { inspectionId });
    } catch (error) {
      logger.error("Error deleting PSC inspection", { error, inspectionId });
      throw error;
    }
  }

  /**
   * Create checklist item
   */
  async createChecklistItem(item: PrePSCChecklistItem): Promise<PrePSCChecklistItem> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_checklist_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating checklist item", { error });
      throw error;
    }
  }

  /**
   * Bulk create checklist items
   */
  async createChecklistItems(items: PrePSCChecklistItem[]): Promise<PrePSCChecklistItem[]> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_checklist_items")
        .insert(items)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error creating checklist items", { error });
      throw error;
    }
  }

  /**
   * Get checklist items for an inspection
   */
  async getChecklistItems(inspectionId: string): Promise<PrePSCChecklistItem[]> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_checklist_items")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("category", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error fetching checklist items", { error, inspectionId });
      throw error;
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(itemId: string, updates: Partial<PrePSCChecklistItem>): Promise<PrePSCChecklistItem> {
    try {
      const { data, error } = await supabase
        .from("pre_psc_checklist_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error updating checklist item", { error, itemId });
      throw error;
    }
  }

  /**
   * Get inspection statistics
   */
  async getInspectionStats(): Promise<InspectionStats> {
    try {
      // Get all inspections
      const { data: inspections, error: inspectionsError } = await supabase
        .from("pre_psc_inspections")
        .select("id, status, total_score");

      if (inspectionsError) throw inspectionsError;

      // Get critical items
      const { data: criticalItems, error: criticalError } = await supabase
        .from("pre_psc_checklist_items")
        .select("id")
        .eq("action_priority", "critical");

      if (criticalError) throw criticalError;

      // Get non-compliant items
      const { data: nonCompliantItems, error: nonCompliantError } = await supabase
        .from("pre_psc_checklist_items")
        .select("id")
        .eq("status", "non_compliant");

      if (nonCompliantError) throw nonCompliantError;

      const totalInspections = inspections?.length || 0;
      const draftInspections = inspections?.filter(i => i.status === "draft").length || 0;
      const completedInspections = inspections?.filter(i => i.status === "completed").length || 0;
      const submittedInspections = inspections?.filter(i => i.status === "submitted").length || 0;
      
      const scores = inspections?.map(i => i.total_score || 0).filter(s => s > 0) || [];
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      return {
        totalInspections,
        draftInspections,
        completedInspections,
        submittedInspections,
        averageScore: Math.round(averageScore),
        criticalItems: criticalItems?.length || 0,
        nonCompliantItems: nonCompliantItems?.length || 0,
      };
    } catch (error) {
      logger.error("Error fetching inspection stats", { error });
      throw error;
    }
  }

  /**
   * Calculate inspection score based on checklist items
   */
  async calculateInspectionScore(inspectionId: string): Promise<number> {
    try {
      const items = await this.getChecklistItems(inspectionId);
      
      if (items.length === 0) return 0;

      const compliantItems = items.filter(item => item.conformity === true).length;
      const score = Math.round((compliantItems / items.length) * 100);

      // Update the inspection with the new score
      await this.updateInspection(inspectionId, {
        total_score: score,
        conformity_percentage: score,
        flagged_items: items.filter(item => item.conformity === false).length,
      });

      return score;
    } catch (error) {
      logger.error("Error calculating inspection score", { error, inspectionId });
      throw error;
    }
  }
}

export const prePSCService = new PrePSCService();
