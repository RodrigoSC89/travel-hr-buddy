/**
 * Hook para dados reais de estações DGNSS
 * Substitui mock data em dgnss-service.ts
 * ✅ R01/R02 CORRIGIDO: Integração real com status
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { IntegrationStatus } from "@/types/integration-status";

export interface DGNSSStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: "online" | "offline" | "maintenance";
  accuracy: number;
  lastUpdate: string;
  corrections?: {
    type: string;
    age: number;
    quality: number;
  };
}

export interface DGNSSIntegrationStatus {
  status: IntegrationStatus;
  stationCount: number;
  isConfigured: boolean;
  canShowData: boolean;
  lastCheck: Date;
}

/**
 * Buscar estações DGNSS reais via Edge Function
 */
export function useDGNSSStations() {
  return useQuery({
    queryKey: ["dgnss-stations"],
    queryFn: async (): Promise<DGNSSStation[]> => {
      const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
        body: { action: "stations" },
      });

      if (error) throw error;

      return Array.isArray(data?.stations) ? data.stations : [];
    },
    staleTime: 60000, // 1 minuto
    retry: 2,
  });
}

/**
 * Verificar status da integração DGNSS
 */
export function useDGNSSIntegrationStatus() {
  return useQuery({
    queryKey: ["dgnss-integration-status"],
    queryFn: async (): Promise<DGNSSIntegrationStatus> => {
      try {
        // Tenta chamar a Edge Function para verificar conectividade
        const { data, error } = await supabase.functions.invoke("dgnss-tracking", {
          body: { action: "health" },
        });

        if (error) {
          return {
            status: "DISCONNECTED",
            stationCount: 0,
            isConfigured: false,
            canShowData: false,
            lastCheck: new Date(),
          };
        }

        const isConfigured = data?.configured === true;
        const stationCount = data?.stationCount || 0;

        return {
          status: isConfigured ? "CONNECTED" : "NOT_CONFIGURED",
          stationCount,
          isConfigured,
          canShowData: isConfigured && stationCount > 0,
          lastCheck: new Date(),
        };
      } catch {
        return {
          status: "ERROR",
          stationCount: 0,
          isConfigured: false,
          canShowData: false,
          lastCheck: new Date(),
        };
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
