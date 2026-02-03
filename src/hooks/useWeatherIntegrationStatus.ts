/**
 * ✅ P2 COMPLIANCE: Weather Integration Status Hook
 * 
 * Verifica status de APIs meteorológicas e bloqueia UI quando não configurado
 * Segue padrão de useSatelliteIntegrationStatus
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type IntegrationStatus, canShowData } from "@/lib/integration-status";
import { logger } from "@/lib/logger";

export interface WeatherIntegrationStatus {
  isConfigured: boolean;
  status: IntegrationStatus;
  canShowData: boolean;
  sources: {
    openMeteo: boolean;
    openWeather: boolean;
    stormGlass: boolean;
    windy: boolean;
    marinhaBrasil: boolean;
  };
  lastCheck: Date;
  errorMessage?: string;
}

/**
 * Verifica status de todas as integrações meteorológicas
 */
export function useWeatherIntegrationStatus() {
  return useQuery<WeatherIntegrationStatus>({
    queryKey: ["weather-integration-status"],
    queryFn: async (): Promise<WeatherIntegrationStatus> => {
      const sources = {
        openMeteo: false,
        openWeather: false,
        stormGlass: false,
        windy: false,
        marinhaBrasil: false,
      };

      try {
        // Test Open-Meteo (free, no API key required)
        const openMeteoTest = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-22.9&longitude=-43.1&current=temperature_2m"
        );
        sources.openMeteo = openMeteoTest.ok;

        // Test weather-integration Edge Function (OpenWeather)
        const { data: owData, error: owError } = await supabase.functions.invoke(
          "weather-integration",
          {
            body: { action: "health" },
          }
        );
        sources.openWeather = !owError && owData?.status === "ok";

        // Test StormGlass via Edge Function
        const { data: sgData, error: sgError } = await supabase.functions.invoke(
          "stormglass-forecast",
          {
            body: { action: "health" },
          }
        );
        sources.stormGlass = !sgError && sgData?.status !== "error";

        // Test Marinha Brasil Edge Function
        const { data: mbData, error: mbError } = await supabase.functions.invoke(
          "marinha-brasil",
          {
            body: { action: "health" },
          }
        );
        sources.marinhaBrasil = !mbError && mbData?.success !== false;

        // Windy is always available (client-side plugin)
        sources.windy = true;

        // Determine overall status
        const configuredCount = Object.values(sources).filter(Boolean).length;
        let status: IntegrationStatus = "NOT_CONFIGURED";

        if (configuredCount >= 3) {
          status = "CONNECTED";
        } else if (configuredCount >= 1) {
          status = "DEGRADED";
        } else {
          status = "NOT_CONFIGURED";
        }

        logger.debug("[Weather Integration] Status check:", { sources, status });

        return {
          isConfigured: configuredCount > 0,
          status,
          canShowData: canShowData(status),
          sources,
          lastCheck: new Date(),
        };
      } catch (error) {
        logger.error("[Weather Integration] Status check failed:", error);

        // Open-Meteo is always available as fallback
        sources.openMeteo = true;
        sources.windy = true;

        return {
          isConfigured: true,
          status: "DEGRADED",
          canShowData: true,
          sources,
          lastCheck: new Date(),
          errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Retorna status simplificado para uso em guards
 */
export function useWeatherCanShowData(): boolean {
  const { data } = useWeatherIntegrationStatus();
  // Default to true since Open-Meteo is always available
  return data?.canShowData ?? true;
}
