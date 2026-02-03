/**
 * Hook para dados reais de Satélites
 * ✅ P0: Dados do Supabase
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Satellite {
  id: string;
  satellite_name: string;
  norad_id: number;
  status: "active" | "inactive" | "maintenance";
  timestamp: string;
}

export interface SatelliteIntegrationStatus {
  isConfigured: boolean;
  status: "connected" | "degraded" | "disconnected" | "not_configured";
  canShowData: boolean;
}

export function useSatelliteIntegrationStatus() {
  return useQuery<SatelliteIntegrationStatus>({
    queryKey: ["satellite-integration-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satellites")
        .select("id")
        .limit(1);

      if (error) {
        return { isConfigured: false, status: "not_configured" as const, canShowData: false };
      }

      const hasData = data && data.length > 0;
      return {
        isConfigured: hasData,
        status: hasData ? ("connected" as const) : ("not_configured" as const),
        canShowData: hasData,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSatelliteData() {
  const { data: status } = useSatelliteIntegrationStatus();

  const { data: satellites, isLoading, refetch } = useQuery({
    queryKey: ["satellites-real-data"],
    queryFn: async (): Promise<Satellite[]> => {
      const { data, error } = await supabase
        .from("satellites")
        .select("id, name, norad_id, is_active, updated_at")
        .order("name", { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((sat) => ({
        id: sat.id,
        satellite_name: sat.name || "Satélite",
        norad_id: Number(sat.norad_id) || 0,
        status: sat.is_active ? ("active" as const) : ("inactive" as const),
        timestamp: sat.updated_at || new Date().toISOString(),
      }));
    },
    enabled: status?.canShowData === true,
  });

  return {
    satellites: satellites || [],
    isLoading,
    isConfigured: status?.isConfigured ?? false,
    canShowData: status?.canShowData ?? false,
    status: status?.status ?? "not_configured",
    refetch,
  };
}
