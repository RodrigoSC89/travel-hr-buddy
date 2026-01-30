/**
 * Hook para dados reais do Dashboard de Drydock/Gantt
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DrydockEvent {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "drydock" | "inspection" | "maintenance" | "repair" | "survey";
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "scheduled" | "in_progress" | "completed" | "delayed" | "cancelled";
  location: string;
  estimatedCost?: number;
  actualCost?: number;
  progress: number;
  assignedTo: string[];
}

export interface DrydockStats {
  totalEvents: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  delayed: number;
  totalEstimatedCost: number;
}

export function useDrydockScheduleData() {
  const queryClient = useQueryClient();

  // Fetch drydock events from maintenance_records and vessel_downtimes
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["drydock-events"],
    queryFn: async (): Promise<DrydockEvent[]> => {
      const allEvents: DrydockEvent[] = [];

      // Fetch from vessel_downtimes
      const { data: downtimes } = await supabase
        .from("vessel_downtimes")
        .select(`
          *,
          vessels:vessel_id (name)
        `)
        .order("start_time", { ascending: false })
        .limit(50);

      // Fetch from maintenance_records only (simplified)
      const { data: maintenance } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          vessels:vessel_id (name)
        `)
        .in("priority", ["critical", "high"])
        .order("scheduled_date", { ascending: false })
        .limit(50);

      (maintenance || []).forEach(m => {
        allEvents.push({
          id: m.id,
          vesselId: m.vessel_id,
          vesselName: (m.vessels as any)?.name || "Embarcação",
          type: "maintenance",
          title: m.title || "Manutenção",
          description: m.description || "",
          startDate: new Date(m.scheduled_date || m.created_at),
          endDate: new Date(m.completed_date || Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: mapMaintenanceStatus(m.status),
          location: "A bordo",
          estimatedCost: m.cost_estimate || undefined,
          actualCost: m.actual_cost || undefined,
          progress: m.status === "completed" ? 100 : m.status === "in_progress" ? 50 : 0,
          assignedTo: m.assigned_technician ? [m.assigned_technician] : [],
        });
      });

      return allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    },
    staleTime: 60000,
  });

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async (event: Omit<DrydockEvent, "id">) => {
      const { error } = await supabase.from("maintenance_records").insert([{
        vessel_id: event.vesselId,
        title: event.title,
        description: event.description,
        priority: "high",
        status: "pending",
        maintenance_type: "corrective",
        scheduled_date: event.startDate.toISOString(),
        cost_estimate: event.estimatedCost,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drydock-events"] });
    },
  });

  // Update event status mutation
  const updateEventStatus = useMutation({
    mutationFn: async ({ eventId, status, progress }: { 
      eventId: string; 
      status: DrydockEvent["status"];
      progress?: number;
    }) => {
      const { error } = await supabase
        .from("vessel_downtimes")
        .update({ 
          is_resolved: status === "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drydock-events"] });
    },
  });

  // Calculate stats
  const stats: DrydockStats = {
    totalEvents: events.length,
    scheduled: events.filter(e => e.status === "scheduled").length,
    inProgress: events.filter(e => e.status === "in_progress").length,
    completed: events.filter(e => e.status === "completed").length,
    delayed: events.filter(e => e.status === "delayed").length,
    totalEstimatedCost: events.reduce((acc, e) => acc + (e.estimatedCost || 0), 0),
  };

  return {
    events,
    stats,
    isLoading,
    createEvent: createEvent.mutate,
    updateEventStatus: updateEventStatus.mutate,
  };
}

function mapDowntimeType(type: string | null): DrydockEvent["type"] {
  switch (type?.toLowerCase()) {
    case "drydock":
    case "scheduled":
      return "drydock";
    case "inspection":
      return "inspection";
    case "repair":
    case "emergency":
      return "repair";
    case "survey":
      return "survey";
    default:
      return "maintenance";
  }
}

function mapDowntimeStatus(status: string | null): DrydockEvent["status"] {
  switch (status?.toLowerCase()) {
    case "resolved":
    case "completed":
      return "completed";
    case "active":
    case "in_progress":
      return "in_progress";
    case "delayed":
      return "delayed";
    case "cancelled":
      return "cancelled";
    default:
      return "scheduled";
  }
}

function mapMaintenanceStatus(status: string | null): DrydockEvent["status"] {
  switch (status?.toLowerCase()) {
    case "completed":
      return "completed";
    case "in_progress":
      return "in_progress";
    case "overdue":
      return "delayed";
    case "cancelled":
      return "cancelled";
    default:
      return "scheduled";
  }
}
