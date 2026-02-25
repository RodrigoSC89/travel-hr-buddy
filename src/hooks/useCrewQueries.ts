/**
 * Crew Management Query Hooks
 * Standardized TanStack Query hooks with Realtime auto-invalidation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrewService } from "@/services/domain/crew-service";
import { toast } from "sonner";
import { useRealtimeInvalidation } from "./useRealtimeQuery";

export const CREW_QUERY_KEYS = {
  all: ["crew-members"] as const,
  list: (filters?: Record<string, unknown>) => ["crew-members", "list", filters] as const,
  detail: (id: string) => ["crew-members", "detail", id] as const,
  certifications: (crewId: string) => ["crew-certifications", crewId] as const,
  stats: ["crew-stats"] as const,
};

export function useCrewMembers(filters?: { status?: string; vessel_id?: string; search?: string }) {
  // Auto-invalidate on realtime changes
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crew: Record<string, unknown>) => CrewService.createCrewMember(crew),
    onSuccess: (data) => {
      toast.success("Tripulante adicionado com sucesso", {
        description: `${data.full_name} foi registrado no sistema.`,
      });
      queryClient.invalidateQueries({ queryKey: CREW_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CREW_QUERY_KEYS.stats });
    },
    onError: (error: Error) => {
      toast.error("Erro ao adicionar tripulante", { description: error.message });
    },
  });
}

export function useUpdateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from("crew_members")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Tripulante atualizado", { description: data.full_name });
      queryClient.invalidateQueries({ queryKey: CREW_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CREW_QUERY_KEYS.detail(data.id) });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar tripulante", { description: error.message });
    },
  });
}
