/**
 * Pre-Port State Control (Pre-PSC) Service
 * DEBT-FIX: pre_psc_inspections not in schema
 * Using psc_inspections (port_country, port_name, inspection_date required; no status/inspector_name/metadata columns)
 * Checklist items stored in-memory
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
  findings?: Record<string, unknown>[];
  recommendations?: Record<string, unknown>[];
  corrective_actions?: Record<string, unknown>[];
  signed_by?: string;
  signature_hash?: string;
  signature_date?: string;
  pdf_url?: string;
  pdf_generated_at?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
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

// In-memory store for checklist items since pre_psc_checklist_items not in schema
const checklistStore = new Map<string, PrePSCChecklistItem[]>();
// Track additional metadata not in psc_inspections schema
const inspectionMetaStore = new Map<string, Partial<PrePSCInspection>>();

class PrePSCService {
  /**
   * Create a new PSC inspection
   */
  async createInspection(inspection: PrePSCInspection): Promise<PrePSCInspection> {
    try {
      const { data, error } = await supabase
        .from("psc_inspections")
        .insert({
          vessel_id: inspection.vessel_id || null,
          inspection_date: inspection.inspection_date || new Date().toISOString().split("T")[0],
          port_country: inspection.port_country || "Unknown",
          port_name: inspection.port_country || "Unknown",
          inspection_type: inspection.inspection_type || "initial",
          deficiencies_count: 0,
          detention: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Store extra metadata in memory
      inspectionMetaStore.set(data.id, {
        inspector_name: inspection.inspector_name,
        status: inspection.status || "draft",
        metadata: inspection.metadata,
      });

      logger.info("PSC inspection created", { inspectionId: data.id });
      return this.mapFromPSC(data);
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
        .from("psc_inspections")
        .select("*")
        .eq("id", inspectionId)
        .single();

      if (error) throw error;
      return this.mapFromPSC(data);
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
        .from("psc_inspections")
        .select("*")
        .order("inspection_date", { ascending: false });

      if (filters?.vessel_id) {
        query = query.eq("vessel_id", filters.vessel_id);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      let results = (data || []).map(d => this.mapFromPSC(d));
      
      // Apply status filter from memory metadata
      if (filters?.status) {
        results = results.filter(r => r.status === filters.status);
      }
      
      return results;
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
      const updateData: Record<string, unknown> = {};
      if (updates.inspection_type) updateData.inspection_type = updates.inspection_type;
      if (updates.port_country) {
        updateData.port_country = updates.port_country;
        updateData.port_name = updates.port_country;
      }
      if (updates.total_score !== undefined) updateData.risk_score = updates.total_score;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("psc_inspections")
          .update(updateData)
          .eq("id", inspectionId);

        if (error) throw error;
      }

      // Update in-memory metadata
      const existing = inspectionMetaStore.get(inspectionId) || {};
      inspectionMetaStore.set(inspectionId, {
        ...existing,
        ...updates,
      });

      logger.info("PSC inspection updated", { inspectionId });
      return this.getInspection(inspectionId);
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
        .from("psc_inspections")
        .delete()
        .eq("id", inspectionId);

      if (error) throw error;
      checklistStore.delete(inspectionId);
      inspectionMetaStore.delete(inspectionId);
      logger.info("PSC inspection deleted", { inspectionId });
    } catch (error) {
      logger.error("Error deleting PSC inspection", { error, inspectionId });
      throw error;
    }
  }

  /**
   * Create checklist item (in-memory)
   */
  async createChecklistItem(item: PrePSCChecklistItem): Promise<PrePSCChecklistItem> {
    const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const items = checklistStore.get(item.inspection_id) || [];
    items.push(newItem);
    checklistStore.set(item.inspection_id, items);
    return newItem;
  }

  async createChecklistItems(items: PrePSCChecklistItem[]): Promise<PrePSCChecklistItem[]> {
    const results: PrePSCChecklistItem[] = [];
    for (const item of items) {
      results.push(await this.createChecklistItem(item));
    }
    return results;
  }

  async getChecklistItems(inspectionId: string): Promise<PrePSCChecklistItem[]> {
    return checklistStore.get(inspectionId) || [];
  }

  async updateChecklistItem(itemId: string, updates: Partial<PrePSCChecklistItem>): Promise<PrePSCChecklistItem> {
    for (const [inspId, items] of checklistStore.entries()) {
      const idx = items.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
        checklistStore.set(inspId, items);
        return items[idx];
      }
    }
    throw new Error(`Checklist item ${itemId} not found`);
  }

  /**
   * Get inspection statistics
   */
  async getInspectionStats(): Promise<InspectionStats> {
    try {
      const { data: inspections, error } = await supabase
        .from("psc_inspections")
        .select("id, risk_score, deficiencies_count");

      if (error) throw error;

      const totalInspections = inspections?.length || 0;
      
      // Status info from memory
      let draftCount = 0, completedCount = 0, submittedCount = 0;
      for (const insp of inspections || []) {
        const meta = inspectionMetaStore.get(insp.id);
        if (meta?.status === "draft") draftCount++;
        else if (meta?.status === "completed") completedCount++;
        else if (meta?.status === "submitted") submittedCount++;
      }

      const scores = inspections?.map(i => i.risk_score || 0).filter(s => s > 0) || [];
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      return {
        totalInspections,
        draftInspections: draftCount,
        completedInspections: completedCount,
        submittedInspections: submittedCount,
        averageScore: Math.round(averageScore),
        criticalItems: 0,
        nonCompliantItems: 0,
      };
    } catch (error) {
      logger.error("Error fetching inspection stats", { error });
      throw error;
    }
  }

  async calculateInspectionScore(inspectionId: string): Promise<number> {
    try {
      const items = await this.getChecklistItems(inspectionId);
      if (items.length === 0) return 0;

      const compliantItems = items.filter(item => item.conformity === true).length;
      const score = Math.round((compliantItems / items.length) * 100);

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

  private mapFromPSC(data: Record<string, unknown>): PrePSCInspection {
    const meta = inspectionMetaStore.get(String(data.id)) || {};
    return {
      id: String(data.id),
      vessel_id: data.vessel_id as string | undefined,
      inspector_name: meta.inspector_name || "",
      inspection_date: data.inspection_date as string | undefined,
      port_country: data.port_country as string | undefined,
      inspection_type: data.inspection_type as string | undefined,
      status: (meta.status as PrePSCInspection["status"]) || "draft",
      total_score: data.risk_score as number | undefined,
      created_at: data.created_at as string | undefined,
      updated_at: data.updated_at as string | undefined,
      metadata: meta.metadata || {},
    };
  }
}

export const prePSCService = new PrePSCService();
