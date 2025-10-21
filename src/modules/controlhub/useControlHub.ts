/**
 * useControlHub Hook
 * React hook for ControlHub 2.0 functionality
 */

import { useState, useEffect, useCallback } from "react";
import { useForecast } from "@/modules/forecast/useForecast";
import { useAIAdvisor } from "@/modules/ai/useAIAdvisor";
import { ControlHubData } from "@/types/controlhub";

export const useControlHub = () => {
  const { forecast, loading: forecastLoading, refresh: refreshForecast } = useForecast();
  const { getAdvice, stats } = useAIAdvisor();
  const [data, setData] = useState<ControlHubData>({
    forecast: null,
    advice: null,
    alerts: [],
    systemStatus: {
      overall: 'healthy',
      modules: [],
    },
  });

  // Update data when forecast changes
  useEffect(() => {
    if (forecast) {
      const advice = getAdvice(JSON.stringify(forecast.forecast));
      
      setData(prev => ({
        ...prev,
        forecast,
        advice,
      }));
    }
  }, [forecast, getAdvice]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await refreshForecast();
  }, [refreshForecast]);

  return {
    data,
    loading: forecastLoading,
    stats,
    refresh,
  };
};
