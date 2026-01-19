/**
 * Hook for Incident Management
 * Automated on-call & incident response system
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { incidentManager } from "@/lib/incident-management/incident-manager";

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  detected_at: string;
  resolved_at?: string;
  timeline: IncidentTimelineEntry[];
}

export interface IncidentTimelineEntry {
  timestamp: string;
  event: string;
  details: string;
}

export interface Runbook {
  id: string;
  name: string;
  description: string;
  severity: string;
  steps: { step: number; action: string; auto: boolean }[];
  is_active: boolean;
}

export interface IncidentStats {
  totalIncidents: number;
  openIncidents: number;
  resolvedToday: number;
  avgResolutionTime: number;
  mttr: number;
}

export function useIncidentManagement() {
  const queryClient = useQueryClient();
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  // Fetch incidents from timeline
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incident_timeline")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Group timeline entries by incident_id
      const incidentMap = new Map<string, Incident>();
      
      for (const entry of data || []) {
        const incidentId = entry.incident_id;
        if (!incidentId) continue;
        
        if (!incidentMap.has(incidentId)) {
          const metadata = entry.metadata as Record<string, unknown> || {};
          incidentMap.set(incidentId, {
            id: incidentId,
            title: (metadata.title as string) || `Incident ${incidentId.slice(0, 8)}`,
            service: (metadata.service as string) || "unknown",
            severity: (metadata.severity as Incident["severity"]) || "medium",
            status: "open",
            detected_at: entry.created_at || new Date().toISOString(),
            timeline: []
          });
        }
        
        const incident = incidentMap.get(incidentId)!;
        incident.timeline.push({
          timestamp: entry.created_at || new Date().toISOString(),
          event: entry.event_type,
          details: entry.description || ""
        });

        if (entry.event_type === "resolved") {
          incident.status = "resolved";
          incident.resolved_at = entry.created_at || undefined;
        }
      }

      return Array.from(incidentMap.values());
    }
  });

  // Fetch runbooks
  const { data: runbooks = [] } = useQuery({
    queryKey: ["runbooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incident_runbooks")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        severity: r.severity,
        steps: (r.steps as { step: number; action: string; auto: boolean }[]) || [],
        is_active: r.is_active || false
      })) as Runbook[];
    }
  });

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openIncidents = incidents.filter(i => i.status === "open" || i.status === "investigating");
  const resolvedToday = incidents.filter(i => 
    i.status === "resolved" && 
    i.resolved_at && 
    new Date(i.resolved_at) >= today
  );

  const resolvedWithTime = incidents.filter(i => i.resolved_at && i.detected_at);
  const avgResolutionMs = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, i) => {
        return sum + (new Date(i.resolved_at!).getTime() - new Date(i.detected_at).getTime());
      }, 0) / resolvedWithTime.length
    : 0;

  const stats: IncidentStats = {
    totalIncidents: incidents.length,
    openIncidents: openIncidents.length,
    resolvedToday: resolvedToday.length,
    avgResolutionTime: Math.round(avgResolutionMs / 60000),
    mttr: Math.round(avgResolutionMs / 3600000 * 10) / 10
  };

  // Create incident
  const createIncident = useMutation({
    mutationFn: async (params: {
      organizationId: string;
      title: string;
      service: string;
      severity: Incident["severity"];
      description?: string;
    }) => {
      const incident = await incidentManager.createIncident(params.organizationId, {
        title: params.title,
        description: params.description || "",
        severity: params.severity,
        status: "open",
        priority: params.severity === "critical" ? 1 : params.severity === "high" ? 2 : 3,
        category: params.service,
        affected_services: [params.service],
        affected_users_count: 0,
        runbook_id: null,
        runbook_progress: [],
        detected_at: new Date().toISOString(),
        acknowledged_at: null,
        acknowledged_by: null,
        resolved_at: null,
        resolved_by: null,
        closed_at: null,
        time_to_acknowledge: null,
        time_to_resolve: null,
        root_cause: null,
        resolution_summary: null,
        lessons_learned: null,
        action_items: [],
        pagerduty_incident_id: null,
        slack_channel: null
      });

      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    }
  });

  // Add timeline event
  const addTimelineEvent = useMutation({
    mutationFn: async (params: {
      incidentId: string;
      event: string;
      details: string;
    }) => {
      const { error } = await supabase
        .from("incident_timeline")
        .insert({
          incident_id: params.incidentId,
          event_type: params.event,
          description: params.details
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    }
  });

  // Resolve incident
  const resolveIncident = useMutation({
    mutationFn: async (params: {
      incidentId: string;
      userId: string;
      rootCause?: string;
      resolution?: string;
    }) => {
      await incidentManager.updateStatus(params.incidentId, "resolved", params.userId, params.resolution);

      const { error } = await supabase
        .from("incident_timeline")
        .insert({
          incident_id: params.incidentId,
          event_type: "resolved",
          description: params.resolution || "Incident resolved",
          metadata: { root_cause: params.rootCause }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    }
  });

  // Get runbook for incident type
  const getRunbook = useCallback((incidentType: string): Runbook | undefined => {
    return runbooks.find(r => 
      r.name.toLowerCase().includes(incidentType.toLowerCase())
    );
  }, [runbooks]);

  return {
    incidents,
    openIncidents,
    runbooks,
    stats,
    isLoading,
    activeIncident,
    setActiveIncident,
    createIncident,
    addTimelineEvent,
    resolveIncident,
    getRunbook
  };
}
