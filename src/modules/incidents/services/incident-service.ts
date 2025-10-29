/**
 * PATCH 481 - Consolidated Incident Service
 * Primary service for incident_reports table (consolidated from multiple incident sources)
 */

import { supabase } from "@/integrations/supabase/client";
import type { Incident } from "../types";

export class IncidentService {
  async getIncidents(filters?: {status?: string}): Promise<Incident[]> {
    try {
      // PATCH 481: Use incident_reports as the canonical table
      let query = (supabase as any).from("incident_reports").select("*").order("incident_date", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        code: d.incident_number || d.code,
        title: d.title,
        description: d.description,
        type: d.category || d.type,
        severity: d.severity,
        status: d.status,
        reportedBy: d.reported_by,
        assignedTo: d.assigned_to,
        reportedAt: d.incident_date || d.reported_at,
        closedAt: d.resolved_at || d.closed_at,
        location: d.location,
        evidence: [],
        metadata: d.ai_analysis || d.metadata || {}
      }));
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return [];
    }
  }

  async createIncident(incident: Omit<Incident, "id" | "reportedAt" | "evidence">): Promise<Incident> {
    try {
      // PATCH 481: Use incident_reports with consolidated field mapping
      const { data, error } = await (supabase as any).from("incident_reports").insert({
        incident_number: incident.code,
        title: incident.title,
        description: incident.description,
        category: incident.type,
        severity: incident.severity,
        status: incident.status,
        reported_by: incident.reportedBy,
        location: incident.location,
        ai_analysis: incident.metadata,
        incident_date: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return { ...incident, id: data.id, reportedAt: data.incident_date, evidence: [] };
    } catch (error) {
      console.error("Error creating incident:", error);
      throw error;
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    try {
      // PATCH 481: Use incident_reports with consolidated field mapping
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.closedAt) updateData.resolved_at = updates.closedAt;
      if (updates.metadata) updateData.ai_analysis = updates.metadata;
      updateData.updated_at = new Date().toISOString();
      const { error } = await (supabase as any).from("incident_reports").update(updateData).eq("id", id);
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
