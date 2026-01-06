/**
 * useBunkerPrices Hook
 * Fetches real-time bunker fuel prices from API
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BunkerPrice {
  port: string;
  country: string;
  vlsfo: number;
  mgo: number;
  hfo: number;
  currency: string;
  lastUpdated: string;
  source: string;
  trend?: "up" | "down" | "stable";
  change24h?: number;
}

export interface BunkerPricesResponse {
  success: boolean;
  prices: BunkerPrice[];
  globalAverage: {
    vlsfo: number;
    mgo: number;
    hfo: number;
  };
  lastUpdated: string;
  source: string;
}

// Fallback prices if API fails
const FALLBACK_PRICES = {
  vlsfo: 580,
  mgo: 720,
  hfo: 450,
};

interface UseBunkerPricesOptions {
  port?: string;
  fuelType?: "vlsfo" | "mgo" | "hfo";
  refetchInterval?: number;
}

export function useBunkerPrices(options: UseBunkerPricesOptions = {}) {
  const { port, fuelType, refetchInterval = 5 * 60 * 1000 } = options; // 5 min default

  const query = useQuery({
    queryKey: ["bunker-prices", port, fuelType],
    queryFn: async (): Promise<BunkerPricesResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("bunker-prices", {
          body: { port, fuelType },
        });

        if (error) throw error;
        return data as BunkerPricesResponse;
      } catch (err) {
        console.error("Failed to fetch bunker prices:", err);
        // Return fallback data
        return {
          success: false,
          prices: [],
          globalAverage: FALLBACK_PRICES,
          lastUpdated: new Date().toISOString(),
          source: "fallback",
        };
      }
    },
    refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Helper to get current VLSFO price for route cost calculation
  const getVLSFOPrice = (): number => {
    return query.data?.globalAverage?.vlsfo ?? FALLBACK_PRICES.vlsfo;
  };

  // Helper to find cheapest port for a fuel type
  const getCheapestPort = (fuel: "vlsfo" | "mgo" | "hfo" = "vlsfo"): BunkerPrice | null => {
    if (!query.data?.prices?.length) return null;
    return query.data.prices.reduce((min, p) => 
      (p[fuel] < min[fuel]) ? p : min
    );
  };

  // Calculate route fuel cost with live prices
  const calculateRouteCost = (fuelTons: number, fuel: "vlsfo" | "mgo" | "hfo" = "vlsfo"): number => {
    const price = query.data?.globalAverage?.[fuel] ?? FALLBACK_PRICES[fuel];
    return fuelTons * price;
  };

  return {
    ...query,
    prices: query.data?.prices ?? [],
    globalAverage: query.data?.globalAverage ?? FALLBACK_PRICES,
    lastUpdated: query.data?.lastUpdated,
    source: query.data?.source ?? "unknown",
    getVLSFOPrice,
    getCheapestPort,
    calculateRouteCost,
  };
}

export default useBunkerPrices;
