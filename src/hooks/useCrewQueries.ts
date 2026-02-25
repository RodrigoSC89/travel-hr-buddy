/**
 * Crew Management Query Hooks
 * v2: Create/Update use useAuditedMutation for automatic audit trail
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrewService } from "@/services/domain/crew-service";
import { useRealtimeInvalidation } from "./useRealtimeQuery";
import { useAuditedMutation } from "./useAuditedMutation";

export const CREW_QUERY_KEYS = {
  all: ["crew-members"] as const,
  list: (filters?: Record<string, unknown>) => ["crew-members", "list", filters] as const,
  detail: (id: string) => ["crew-members", "detail", id] as const,
  certifications: (crewId: string) => ["crew-certifications", crewId] as const,
  stats: ["crew-stats"] as const,
};

export function useCrewMembers(filters?: { status?: string; vessel_id?: string; search?: string }) {
  useRealtimeInvalidation({
    table: "crew_members",
    queryKeys: [CREW_QUERY_KEYS.all, CREW_QUERY_KEYS.stats],
  });

  return useQuery({
    queryKey: CREW_QUERY_KEYS.list(filters),
    queryFn: async () => {
      let query = supabase
        .from("crew_members")
        .select("id, full_name, position, rank, status, vessel_id, nationality, email, phone, employee_id, passport_number, created_at, updated_at")
        .order("full_name");

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.vessel_id) {
        query = query.eq("vessel_id", filters.vessel_id);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,position.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useCrewMember(id: string | undefined) {
  return useQuery({
    queryKey: CREW_QUERY_KEYS.detail(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCrewCertifications(crewId: string | undefined) {
  return useQuery({
    queryKey: CREW_QUERY_KEYS.certifications(crewId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("*")
        .eq("crew_member_id", crewId!)
        .order("expiry_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!crewId,
  });
}

export function useCrewStats() {
  return useQuery({
    queryKey: CREW_QUERY_KEYS.stats,
    queryFn: async () => {
      const { data: crew, error } = await supabase
        .from("crew_members")
        .select("id, status, vessel_id");
      if (error) throw error;

      const members = crew ?? [];
      const total = members.length;
      const active = members.filter(c => c.status === "active" || c.status === "onboard").length;
      const onShore = members.filter(c => c.status === "shore_leave" || c.status === "off_duty").length;
      const assigned = members.filter(c => c.vessel_id).length;

      return { total, active, onShore, assigned, unassigned: total - assigned };
    },
    staleTime: 30_000,
  });
}

export function useCreateCrewMember() {
  return useAuditedMutation<Record<string, unknown>, any>({
    mutationFn: (crew) => CrewService.createCrewMember(crew),
    eventType: "people.crew.created",
    entityType: "crew_member",
    module: "crew",
    actionType: "create",
    getEntityId: (data) => data.id,
    getDescription: (_input, output) => `Tripulante registrado: ${output.full_name}`,
    invalidateKeys: [["crew-members"], ["crew-stats"], ["crew"], ["dashboard-kpis"]],
    successMessage: "Tripulante adicionado com sucesso",
    errorMessage: "Erro ao adicionar tripulante",
  });
}

export function useUpdateCrewMember() {
  return useAuditedMutation<{ id: string; updates: Record<string, unknown> }, any>({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from("crew_members")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    eventType: "people.crew.created",
    entityType: "crew_member",
    module: "crew",
    actionType: "update",
    getEntityId: (data) => data.id,
    getDescription: (_input, output) => `Tripulante atualizado: ${output.full_name}`,
    getChanges: (input) => {
      const changes: Record<string, { old: unknown; new: unknown }> = {};
      for (const [key, val] of Object.entries(input.updates)) {
        changes[key] = { old: undefined, new: val };
      }
      return changes;
    },
    invalidateKeys: [["crew-members"], ["crew-stats"], ["crew"], ["dashboard-kpis"]],
    successMessage: "Tripulante atualizado",
    errorMessage: "Erro ao atualizar tripulante",
  });
}
