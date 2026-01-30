/**
 * useBunkerForecast Hook
 * Fetches 7-day AI-powered bunker price forecasts
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ForecastResult {
  date: string;
  vlsfo: number;
  mgo: number;
  hfo: number;
  confidence: number;
}

export interface PortForecast {
  port: string;
  country: string;
  currentPrices: { vlsfo: number; mgo: number; hfo: number };
  forecast: ForecastResult[];
  trend: "up" | "down" | "stable";
  analysis: string;
  recommendation: string;
}

export interface ForecastResponse {
  success: boolean;
  forecasts: PortForecast[];
  generatedAt: string;
  source: string;
}

interface UseBunkerForecastOptions {
  ports?: string[];
  fuelType?: "vlsfo" | "mgo" | "hfo";
  enabled?: boolean;
}

export function useBunkerForecast(options: UseBunkerForecastOptions = {}) {
  const { ports, fuelType = "vlsfo", enabled = true } = options;

  const query = useQuery({
    queryKey: ["bunker-forecast", ports, fuelType],
    queryFn: async (): Promise<ForecastResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("bunker-price-forecast", {
          body: { ports, fuelType },
        });

        if (error) throw error;
        return data as ForecastResponse;
      } catch (err) {
        console.error("Failed to fetch bunker forecast:", err);
        throw err;
      }
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  // Get best opportunity (cheapest port with downward trend)
  const getBestOpportunity = (): PortForecast | null => {
    if (!query.data?.forecasts?.length) return null;
    return query.data.forecasts[0]; // Already sorted by opportunity score
  };

  // Compare two ports
  const comparePorts = (portA: string, portB: string) => {
    const forecasts = query.data?.forecasts ?? [];
    const a = forecasts.find(f => f.port === portA);
    const b = forecasts.find(f => f.port === portB);
    
    if (!a || !b) return null;
    
    return {
      portA: a,
      portB: b,
      priceDiff: {
        vlsfo: a.currentPrices.vlsfo - b.currentPrices.vlsfo,
        mgo: a.currentPrices.mgo - b.currentPrices.mgo,
        hfo: a.currentPrices.hfo - b.currentPrices.hfo,
      },
      recommendation: a.currentPrices.vlsfo < b.currentPrices.vlsfo ? portA : portB,
    };
  };

  return {
    ...query,
    forecasts: query.data?.forecasts ?? [],
    generatedAt: query.data?.generatedAt,
    getBestOpportunity,
    comparePorts,
  };
}

export default useBunkerForecast;
