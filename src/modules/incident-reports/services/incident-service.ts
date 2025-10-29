/**
 * PATCH 481 - Incident Service (Consolidated)
 * Updated to use unified incident_reports table with AI analysis fields
 */

import { supabase } from "@/integrations/supabase/client";
import type { Incident } from "../types";

export class IncidentService {
  async getIncidents(filters?: {status?: string}): Promise<Incident[]> {
    try {
      let query = supabase.from("incident_reports").select("*").order("reported_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        code: d.incident_number || d.code, // Use incident_number with fallback
        title: d.title,
        description: d.description,
        type: d.category || d.type, // Use category with fallback
        severity: d.severity,
        status: d.status,
        reportedBy: d.reported_by,
        assignedTo: d.assigned_to,
        reportedAt: d.reported_at,
        closedAt: d.closed_at,
        location: d.location,
        evidence: [],
        metadata: d.metadata || {},
        aiAnalysis: d.ai_analysis, // Include AI analysis
        replayStatus: d.replay_status // Include replay status
      }));
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return [];
    }
  }

  async createIncident(incident: Omit<Incident, "id" | "reportedAt" | "evidence">): Promise<Incident> {
    try {
      const { data, error } = await supabase.from("incident_reports").insert({
        incident_number: incident.code, // Map to incident_number
        code: incident.code, // Keep code for backward compatibility
        title: incident.title,
        description: incident.description,
        category: incident.type, // Map to category
        type: incident.type, // Keep type for backward compatibility
        severity: incident.severity,
        status: incident.status,
        reported_by: incident.reportedBy,
        location: incident.location,
        metadata: incident.metadata,
        replay_status: 'pending' // Initialize replay status
      }).select().single();
      if (error) throw error;
      return { 
        ...incident, 
        id: data.id, 
        reportedAt: data.reported_at, 
        evidence: [],
        replayStatus: data.replay_status
      };
    } catch (error) {
      console.error("Error creating incident:", error);
      throw error;
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.closedAt) updateData.closed_at = updates.closedAt;
      if (updates.type) {
        updateData.category = updates.type; // Update category
        updateData.type = updates.type; // Keep type for backward compatibility
      }
      const { error } = await supabase.from("incident_reports").update(updateData).eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating incident:", error);
      throw error;
    }
  }

  async exportIncidentToPDF(incidentId: string): Promise<void> {
    // Simulate PDF export - in production this would call a PDF generation service
    console.log("Exporting incident to PDF:", incidentId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export const incidentService = new IncidentService();
