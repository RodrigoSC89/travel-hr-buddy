/**
 * Vessel Management Query Hooks
 * Standardized TanStack Query hooks with Realtime auto-invalidation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VesselsService } from "@/services/domain/vessels-service";
import { toast } from "sonner";
import { useRealtimeInvalidation } from "./useRealtimeQuery";

export const VESSEL_QUERY_KEYS = {
  all: ["vessels"] as const,
  list: (filters?: Record<string, unknown>) => ["vessels", "list", filters] as const,
  detail: (id: string) => ["vessels", "detail", id] as const,
  related: (id: string) => ["vessels", "related", id] as const,
  stats: ["vessel-stats"] as const,
};

export function useVesselsList(filters?: { status?: string; type?: string }) {
  // Auto-invalidate on realtime changes
  useRealtimeInvalidation({
    table: "vessels",
    queryKeys: [VESSEL_QUERY_KEYS.all, VESSEL_QUERY_KEYS.stats],
  });

  return useQuery({
    queryKey: VESSEL_QUERY_KEYS.list(filters),
    queryFn: async () => {
      let query = supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type, flag_state, status, port_of_registry, gross_tonnage, deadweight, year_built, organization_id, created_at, updated_at")
        .order("name");

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.type) {
        query = query.eq("vessel_type", filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useVesselDetail(id: string | undefined) {
  return useQuery({
    queryKey: VESSEL_QUERY_KEYS.detail(id!),
    queryFn: () => VesselsService.getById(id!),
    enabled: !!id,
  });
}

export function useVesselStats() {
  return useQuery({
    queryKey: VESSEL_QUERY_KEYS.stats,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, status, vessel_type");
      if (error) throw error;

      const vessels = data ?? [];
      const total = vessels.length;
      const active = vessels.filter(v => v.status === "active" || v.status === "operational").length;
      const maintenance = vessels.filter(v => v.status === "maintenance" || v.status === "drydock").length;
      const idle = total - active - maintenance;

      const byType = vessels.reduce<Record<string, number>>((acc, v) => {
        const type = v.vessel_type || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return { total, active, maintenance, idle, byType };
    },
    staleTime: 30_000,
  });
}

export function useCreateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vessel: Record<string, unknown>) => VesselsService.create(vessel),
    onSuccess: (data) => {
      toast.success("Embarcação registrada", { description: data.name });
      queryClient.invalidateQueries({ queryKey: VESSEL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VESSEL_QUERY_KEYS.stats });
    },
    onError: (error: Error) => {
      toast.error("Erro ao registrar embarcação", { description: error.message });
    },
  });
}

export function useUpdateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      VesselsService.update(id, updates),
    onSuccess: (data) => {
      toast.success("Embarcação atualizada", { description: data.name });
      queryClient.invalidateQueries({ queryKey: VESSEL_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VESSEL_QUERY_KEYS.detail(data.id) });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar embarcação", { description: error.message });
    },
  });
}
