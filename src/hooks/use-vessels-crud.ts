/**
 * Hook for Vessels CRUD Operations
 * Complete integration with Supabase for vessel management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type VesselRow = Database["public"]["Tables"]["vessels"]["Row"];
type VesselInsert = Database["public"]["Tables"]["vessels"]["Insert"];
type VesselUpdate = Database["public"]["Tables"]["vessels"]["Update"];

export type Vessel = VesselRow;

interface UseVesselsOptions {
  status?: string;
  type?: string;
  search?: string;
}

export function useVessels(options?: UseVesselsOptions) {
  return useQuery({
    queryKey: ["vessels", options],
    queryFn: async () => {
      let query = supabase
        .from("vessels")
        .select("*")
        .order("name", { ascending: true });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.type) {
        query = query.eq("vessel_type", options.type);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,imo_number.ilike.%${options.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        logger.error("Error fetching vessels:", error);
        throw error;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useVessel(id: string) {
  return useQuery({
    queryKey: ["vessel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vessel: VesselInsert) => {
      const { data, error } = await supabase
        .from("vessels")
        .insert([vessel])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vessels"] });
      toast.success("Embarcação criada!", { description: `${data.name} adicionada.` });
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar embarcação", { description: error.message });
    },
  });
}

export function useUpdateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VesselUpdate }) => {
      const { data: vessel, error } = await supabase
        .from("vessels")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return vessel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vessels"] });
      toast.success("Embarcação atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar", { description: error.message });
    },
  });
}

export function useDeleteVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vessels")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vessels"] });
      toast.success("Embarcação arquivada");
    },
    onError: (error: Error) => {
      toast.error("Erro ao arquivar", { description: error.message });
    },
  });
}

export function useDuplicateVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vessel: Vessel) => {
      const newVessel: VesselInsert = {
        name: `${vessel.name} (Cópia)`,
        vessel_type: vessel.vessel_type,
        flag: vessel.flag,
        flag_state: vessel.flag_state,
        gross_tonnage: vessel.gross_tonnage,
        status: vessel.status,
        organization_id: vessel.organization_id,
        beam: vessel.beam,
        capacity: vessel.capacity,
        draft: vessel.draft,
        fuel_capacity: vessel.fuel_capacity,
        length: vessel.length,
      };

      const { data, error } = await supabase
        .from("vessels")
        .insert([newVessel])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vessels"] });
      toast.success("Embarcação duplicada!", { description: `${data.name} criada.` });
    },
    onError: (error: Error) => {
      toast.error("Erro ao duplicar", { description: error.message });
    },
  });
}
