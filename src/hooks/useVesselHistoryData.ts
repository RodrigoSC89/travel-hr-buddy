/**
 * Hook para dados de Histórico de Embarcações - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VesselHistoryEvent {
  id: string;
  vesselId: string;
  type: "port_call" | "maintenance" | "inspection" | "incident" | "crew_change" | "certification";
  title: string;
  description: string;
  date: Date;
  location?: string;
  relatedDocuments?: string[];
  createdBy: string;
}

export function useVesselHistory(vesselId?: string) {
  return useQuery({
    queryKey: ["vessel-history", vesselId],
    queryFn: async (): Promise<VesselHistoryEvent[]> => {
      const events: VesselHistoryEvent[] = [];

      // Buscar de maintenance_tasks
      const { data: maintenanceData } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      (maintenanceData || []).forEach((task) => {
        events.push({
          id: task.id,
          vesselId: task.vessel_id || "",
          type: "maintenance",
          title: task.title || "Manutenção",
          description: task.description || "",
          date: new Date(task.completed_date || task.created_at || Date.now()),
          location: undefined,
          createdBy: "Sistema",
        });
      });

      // Buscar de audit_log para eventos de inspeção
      const { data: auditData } = await supabase
        .from("audit_log")
        .select("*")
        .eq("entity_type", "inspection")
        .order("created_at", { ascending: false })
        .limit(10);

      (auditData || []).forEach((log) => {
        const metadata = log.metadata as any || {};
        events.push({
          id: log.id,
          vesselId: metadata.vessel_id || "",
          type: "inspection",
          title: metadata.title || log.action || "Inspeção",
          description: metadata.notes || "",
          date: new Date(log.event_timestamp || log.created_at || Date.now()),
          location: metadata.location,
          createdBy: metadata.auditor_name || "Auditor",
        });
      });

      // Ordenar por data
      return events.sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    staleTime: 30000,
  });
}

export function useCreateVesselEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<VesselHistoryEvent, "id">) => {
      const { data, error } = await supabase
        .from("audit_log")
        .insert({
          entity_type: event.type,
          entity_id: event.vesselId || crypto.randomUUID(),
          action: `${event.type}_created`,
          module: "fleet",
          metadata: {
            title: event.title,
            description: event.description,
            location: event.location,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vessel-history"] });
      toast.success("Evento registrado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao registrar evento: " + error.message);
    },
  });
}
