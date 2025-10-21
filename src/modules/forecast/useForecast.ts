/**
 * useForecast Hook
 * React hook for accessing forecast data
 */

import { useState, useEffect, useCallback } from "react";
import { forecastEngine } from "./ForecastEngine";
import { ForecastData } from "@/types/forecast";

export const useForecast = () => {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial forecast
  useEffect(() => {
    const loadForecast = async () => {
      try {
        setLoading(true);
        const data = await forecastEngine.getForecast();
        setForecast(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load forecast"));
      } finally {
        setLoading(false);
      }
    };

    loadForecast();

    // Subscribe to real-time updates
    const unsubscribe = forecastEngine.onUpdate((data) => {
      setForecast(data);
    });

    return unsubscribe;
  }, []);

  // Refresh forecast data
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      forecastEngine.clearCache();
      const data = await forecastEngine.getForecast();
      setForecast(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh forecast"));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    forecast,
    loading,
    error,
    refresh,
  };
};
