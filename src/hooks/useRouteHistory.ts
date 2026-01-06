/**
 * useRouteHistory Hook
 * Manages voyage route history with load and compare functionality
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WeatherRoutingResult } from "@/lib/routing/weather-routing";
import { useToast } from "@/hooks/use-toast";

export interface StoredRoute {
  id: string;
  vessel_id: string | null;
  origin: { lat: number; lon: number; name?: string };
  destination: { lat: number; lon: number; name?: string };
  route_data: WeatherRoutingResult;
  recommended_route_id: string;
  alternatives_count: number;
  hazards_count: number;
  created_at: string;
  name: string | null;
  notes: string | null;
}

interface UseRouteHistoryOptions {
  vesselId?: string;
  limit?: number;
}

export function useRouteHistory(options: UseRouteHistoryOptions = {}) {
  const { vesselId, limit = 20 } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: routes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["route-history", vesselId, limit],
    queryFn: async () => {
      let query = supabase
        .from("voyage_routes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as unknown) as StoredRoute[];
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from("voyage_routes")
        .delete()
        .eq("id", routeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-history"] });
      toast({
        title: "Rota Removida",
        description: "O histórico da rota foi removido com sucesso.",
      });
    },
    onError: (err) => {
      toast({
        title: "Erro ao Remover",
        description: err instanceof Error ? err.message : "Falha ao remover rota",
        variant: "destructive",
      });
    },
  });

  const updateRouteNameMutation = useMutation({
    mutationFn: async ({ routeId, name, notes }: { routeId: string; name?: string; notes?: string }) => {
      const { error } = await supabase
        .from("voyage_routes")
        .update({ name, notes })
        .eq("id", routeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-history"] });
      toast({
        title: "Rota Atualizada",
        description: "Nome/notas atualizados com sucesso.",
      });
    },
  });

  return {
    routes: routes ?? [],
    isLoading,
    error,
    refetch,
    deleteRoute: deleteRouteMutation.mutate,
    isDeleting: deleteRouteMutation.isPending,
    updateRouteName: updateRouteNameMutation.mutate,
    isUpdating: updateRouteNameMutation.isPending,
  };
}

export default useRouteHistory;
