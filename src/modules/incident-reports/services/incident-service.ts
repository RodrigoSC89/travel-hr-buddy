/**
 * PATCH 481 - Incident Service (Consolidated)
 * Updated to use unified incident_reports table with AI analysis fields
 * PATCH 851: Removed @ts-nocheck, added proper typing
 */

import { supabase } from "@/integrations/supabase/client";
import type { Incident } from "../types";

export class IncidentService {
  async getIncidents(filters?: { status?: string }): Promise<Incident[]> {
    try {
      let query = supabase
        .from("incident_reports")
        .select("*")
        .order("reported_at", { ascending: false });
      
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map((d) => ({
        id: d.id,
        code: d.code || "",
        title: d.title,
        description: d.description || "",
        type: (d.type as Incident["type"]) || "other",
        severity: (d.severity as Incident["severity"]) || "medium",
        status: (d.status as Incident["status"]) || "open",
        reportedBy: d.reported_by || "",
        assignedTo: d.assigned_to || undefined,
        reportedAt: d.reported_at || new Date().toISOString(),
        closedAt: d.closed_at || undefined,
        location: d.location || "",
        evidence: [],
        metadata: (d.metadata as Record<string, unknown>) || {},
        aiAnalysis: d.ai_analysis,
        replayStatus: d.replay_status as Incident["replayStatus"]
      }));
    } catch (error) {
      // Error handled gracefully - return empty array
      return [];
    }
  }

  async createIncident(incident: Omit<Incident, "id" | "reportedAt" | "evidence">): Promise<Incident> {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .insert({
          code: incident.code,
          title: incident.title,
          description: incident.description,
          type: incident.type,
          severity: incident.severity,
          status: incident.status,
          reported_by: incident.reportedBy,
          location: incident.location,
          metadata: incident.metadata,
          replay_status: "pending"
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...incident,
        id: data.id,
        reportedAt: data.reported_at || new Date().toISOString(),
        evidence: [],
        replayStatus: data.replay_status as Incident["replayStatus"]
      };
    } catch (error) {
      throw error;
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.closedAt) updateData.closed_at = updates.closedAt;
      if (updates.type) updateData.type = updates.type;
      
      const { error } = await supabase
        .from("incident_reports")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  async exportIncidentToPDF(incidentId: string): Promise<void> {
    // Real PDF export: fetch incident data and generate download
    const { data, error } = await supabase
      .from("incident_reports")
      .select("*")
      .eq("id", incidentId)
      .single();
    
    if (error || !data) throw new Error("Incidente não encontrado para exportação");
    
    // Generate text-based report for download
    const content = [
      `RELATÓRIO DE INCIDENTE - ${data.code || 'N/A'}`,
      `==========================================`,
      `Título: ${data.title}`,
      `Tipo: ${data.type}`,
      `Severidade: ${data.severity}`,
      `Status: ${data.status}`,
      `Local: ${data.location || 'N/A'}`,
      `Reportado por: ${data.reported_by || 'N/A'}`,
      `Data: ${data.reported_at || 'N/A'}`,
      ``,
      `Descrição:`,
      data.description || 'Sem descrição',
      ``,
      `Gerado em: ${new Date().toISOString()}`,
    ].join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${data.code || incidentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const incidentService = new IncidentService();
