/**
 * Hook for Weather-Based Voyage Routing
 * Integrates GFS weather data with route optimization
 */

import { useState, useCallback } from "react";
import {
  generateRouteForecast,
  analyzeRouteWeather,
  calculateOptimalSpeedForCII,
  detectECAZones,
  type RouteWeatherResult,
} from "@/services/weather-gfs";
import { toast } from "sonner";

interface RouteWaypoint {
  lat: number;
  lon: number;
  eta: string;
  name?: string;
}

export function useWeatherRouting() {
  const [routeAnalysis, setRouteAnalysis] = useState<RouteWeatherResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeRoute = useCallback((waypoints: RouteWaypoint[]) => {
    setIsAnalyzing(true);
    try {
      const forecasts = generateRouteForecast(waypoints);
      const result = analyzeRouteWeather(
        forecasts,
        waypoints.map((w) => ({ lat: w.lat, lon: w.lon }))
      );
      setRouteAnalysis(result);

      // Notify risk level
      if (result.overall_risk === "extreme") {
        toast.error("🌊 RISCO EXTREMO na rota", {
          description: "Recomenda-se adiamento ou rota alternativa",
        });
      } else if (result.overall_risk === "high") {
        toast.warning("⚠️ Risco alto na rota", {
          description: `Redução de velocidade sugerida: ${result.recommended_speed_reduction_pct}%`,
        });
      }

      // ECA zone alerts
      if (result.eca_zones_crossed.length > 0) {
        toast.info(`⛽ ${result.eca_zones_crossed.length} zona(s) ECA na rota`, {
          description: result.eca_zones_crossed.map((z) => z.name).join(", "),
        });
      }

      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getSpeedAdvice = useCallback(
    (params: {
      currentCII: number;
      targetCII: number;
      currentSpeed: number;
      remainingDistance: number;
      deadweight: number;
    }) => {
      return calculateOptimalSpeedForCII(
        params.currentCII,
        params.targetCII,
        params.currentSpeed,
        params.remainingDistance,
        params.deadweight
      );
    },
    []
  );

  const checkECAZones = useCallback(
    (waypoints: Array<{ lat: number; lon: number }>) => {
      return detectECAZones(waypoints);
    },
    []
  );

  return {
    routeAnalysis,
    isAnalyzing,
    analyzeRoute,
    getSpeedAdvice,
    checkECAZones,
  };
}
