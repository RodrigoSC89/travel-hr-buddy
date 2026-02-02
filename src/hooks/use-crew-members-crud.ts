/**
 * Crew Members CRUD Hook - Full Supabase Integration
 * Replaces mock data with real database operations
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type CrewMemberRow = Database["public"]["Tables"]["crew_members"]["Row"];
type CrewMemberInsert = Database["public"]["Tables"]["crew_members"]["Insert"];

export interface CrewMember {
  id: string;
  full_name: string;
  employee_id: string;
  position: string;
  rank: string | null;
  department?: string;
  vessel_id: string | null;
  vessel_name?: string;
  nationality: string;
  email: string | null;
  phone: string | null;
  status: string;
  contract_start: string | null;
  contract_end: string | null;
  experience_years: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CrewMemberFormData {
  full_name: string;
  employee_id: string;
  position: string;
  rank: string;
  vessel_id: string;
  nationality: string;
  email: string;
  phone: string;
  status: string;
  contract_start: string;
  contract_end: string;
}

export function useCrewMembersCRUD() {
  const queryClient = useQueryClient();

  // Fetch all crew members with vessel names
  const {
    data: crewMembers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["crew-members-list"],
    queryFn: async (): Promise<CrewMember[]> => {
      const { data: members, error: membersError } = await supabase
        .from("crew_members")
        .select(`
          id,
          full_name,
          employee_id,
          position,
          rank,
          vessel_id,
          nationality,
          email,
          phone,
          status,
          contract_start,
          contract_end,
          experience_years,
          created_at,
          updated_at
        `)
        .order("full_name");

      if (membersError) {
        logger.error("Error fetching crew members", { error: membersError });
        throw membersError;
      }

      // Get vessel names
      const vesselIds = [...new Set((members || []).map(m => m.vessel_id).filter(Boolean))] as string[];
      let vesselMap: Record<string, string> = {};

      if (vesselIds.length > 0) {
        const { data: vessels } = await supabase
          .from("vessels")
          .select("id, name")
          .in("id", vesselIds);

        if (vessels) {
          vesselMap = vessels.reduce((acc, v) => ({ ...acc, [v.id]: v.name }), {} as Record<string, string>);
        }
      }

      return (members || []).map(m => ({
        id: m.id,
        full_name: m.full_name,
        employee_id: m.employee_id,
        position: m.position,
        rank: m.rank,
        vessel_id: m.vessel_id,
        nationality: m.nationality,
        email: m.email,
        phone: m.phone,
        status: m.status || "active",
        contract_start: m.contract_start,
        contract_end: m.contract_end,
        experience_years: m.experience_years,
        created_at: m.created_at,
        updated_at: m.updated_at,
        vessel_name: m.vessel_id ? vesselMap[m.vessel_id] || "Unknown" : undefined
      }));
    }
  });

  // Fetch vessels for dropdown
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-dropdown"],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: CrewMemberFormData) => {
      const insertData: CrewMemberInsert = {
        full_name: formData.full_name,
        employee_id: formData.employee_id || `EMP-${Date.now()}`,
        position: formData.position || "Crew",
        rank: formData.rank || undefined,
        vessel_id: formData.vessel_id || undefined,
        nationality: formData.nationality || "Brazilian",
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        status: formData.status || "active",
        contract_start: formData.contract_start || undefined,
        contract_end: formData.contract_end || undefined
      };

      const { error } = await supabase.from("crew_members").insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tripulante cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["crew-members-list"] });
    },
    onError: (error) => {
      logger.error("Error creating crew member", { error });
      toast.error("Erro ao cadastrar tripulante", { description: (error as Error).message });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: CrewMemberFormData }) => {
      const updateData: Partial<CrewMemberRow> = {
        full_name: formData.full_name,
        position: formData.position,
        rank: formData.rank || undefined,
        vessel_id: formData.vessel_id || undefined,
        nationality: formData.nationality,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        status: formData.status || "active",
        contract_start: formData.contract_start || undefined,
        contract_end: formData.contract_end || undefined,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("crew_members")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tripulante atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["crew-members-list"] });
    },
    onError: (error) => {
      logger.error("Error updating crew member", { error });
      toast.error("Erro ao atualizar tripulante", { description: (error as Error).message });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crew_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tripulante removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["crew-members-list"] });
    },
    onError: (error) => {
      logger.error("Error deleting crew member", { error });
      toast.error("Erro ao remover tripulante", { description: (error as Error).message });
    }
  });

  // Status change mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("crew_members")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado!");
      queryClient.invalidateQueries({ queryKey: ["crew-members-list"] });
    },
    onError: (error) => {
      logger.error("Error changing status", { error });
      toast.error("Erro ao alterar status");
    }
  });

  return {
    crewMembers,
    vessels,
    isLoading,
    error,
    refetch,
    createCrewMember: createMutation.mutateAsync,
    updateCrewMember: updateMutation.mutateAsync,
    deleteCrewMember: deleteMutation.mutateAsync,
    changeStatus: changeStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
