import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Checklist, ChecklistTemplate } from "../types";

/**
 * Service for checklist CRUD operations
 */
export class ChecklistService {
  /**
   * Fetch all checklists for a user
   */
  static async fetchChecklists(userId: string): Promise<Checklist[]> {
    try {
      const { data, error } = await supabase
        .from("operational_checklists")
        .select(`
          *,
          checklist_items(*),
          vessels(*)
        `)
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match Checklist interface
      const transformedChecklists: Checklist[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        type: "dp" as const,
        version: "1.0",
        description: item.title || "",
        vessel: {
          id: item.vessels?.id || "",
          name: item.vessels?.name || "Unknown Vessel",
          type: item.vessels?.vessel_type || "Unknown",
          imo: item.vessels?.imo_number || "",
          flag: item.vessels?.flag_state || "",
          classification: "DNV",
          operator: "Maritime Operator"
        },
        inspector: {
          id: userId,
          name: "Current User",
          license: "LIC001",
          company: "Maritime Company",
          email: "user@maritime.com",
          phone: "+55 11 99999-9999",
          certifications: ["Maritime Inspector"]
        },
        status: (item.status || "draft") as Checklist["status"],
        items: item.checklist_items?.map((checklistItem: Record<string, unknown>) => ({
          id: checklistItem.id,
          title: checklistItem.title,
          description: checklistItem.description,
          type: "boolean",
          required: checklistItem.required,
          category: "General",
          order: checklistItem.order_index,
          status: checklistItem.completed ? "completed" : "pending",
          value: checklistItem.completed,
          notes: checklistItem.notes,
          timestamp: checklistItem.completed_at
        })) || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: null,
        priority: "medium" as const,
        estimatedDuration: 180,
        complianceScore: item.compliance_score,
        workflow: [],
        tags: [],
        template: false,
        syncStatus: "synced" as const
      })) || [];

      return transformedChecklists;
    } catch (error) {
      logger.error("Error fetching checklists:", error);
      throw error;
    }
  }

  /**
   * Create a new checklist
   */
  static async createChecklist(title: string, userId: string, type = "outro"): Promise<unknown> {
    try {
      const { data, error } = await supabase
        .from("operational_checklists")
        .insert({
          title,
          type,
          created_by: userId,
          status: "rascunho",
          source_type: "manual",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating checklist:", error);
      throw error;
    }
  }

  /**
   * Update a checklist
   */
  static async updateChecklist(checklist: Checklist): Promise<void> {
    try {
      const { error: checklistError } = await supabase
        .from("operational_checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          status: checklist.status,
          priority: checklist.priority,
          compliance_score: checklist.complianceScore,
          completed_at: checklist.completedAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", checklist.id);

      if (checklistError) throw checklistError;

      // Update checklist items
      for (const item of checklist.items) {
        const { error: itemError } = await supabase
          .from("checklist_items")
          .update({
            completed: item.status === "completed",
            completed_at: item.timestamp,
            notes: item.notes,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (itemError) throw itemError;
      }
    } catch (error) {
      logger.error("Error updating checklist:", error);
      throw error;
    }
  }

  /**
   * Toggle checklist item completion status
   */
  static async toggleItem(itemId: string, completed: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from("checklist_items")
        .update({ completed: !completed })
        .eq("id", itemId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error toggling item:", error);
      throw error;
    }
  }

  /**
   * Delete a checklist
   */
  static async deleteChecklist(checklistId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("operational_checklists")
        .delete()
        .eq("id", checklistId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting checklist:", error);
      throw error;
    }
  }

  /**
   * Submit checklist for review
   */
  static async submitForReview(checklistId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("operational_checklists")
        .update({
          status: "pending_review",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", checklistId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error submitting checklist:", error);
      throw error;
    }
  }

  /**
   * Create checklist from template
   */
  static async createFromTemplate(
    template: ChecklistTemplate,
    vesselId: string,
    userId: string
  ): Promise<unknown> {
    try {
      const { data: checklist, error: checklistError } = await supabase
        .from("operational_checklists")
        .insert({
          title: `${template.name} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          type: template.type,
          version: template.version,
          status: "draft",
          priority: "medium",
          estimated_duration: template.estimatedDuration,
          vessel_id: vesselId,
          created_by: userId
        })
        .select()
        .single();

      if (checklistError) throw checklistError;
      return checklist;
    } catch (error) {
      logger.error("Error creating checklist from template:", error);
      throw error;
    }
  }
}
