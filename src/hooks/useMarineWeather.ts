/**
 * Hook para dados meteorológicos marítimos reais via Open-Meteo (free, no API key)
 * Substitui useStormGlass como fallback primário
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarineWeatherCurrent {
  time: string;
  airTemperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  pressure: number | null;
  surfacePressure: number | null;
  windSpeed: number | null;
  windSpeedKnots: number | null;
  windDirection: number | null;
  windGusts: number | null;
  cloudCover: number | null;
  visibility: number | null;
  precipitation: number | null;
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  swellHeight: number | null;
  swellDirection: number | null;
  swellPeriod: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
}

export interface MarineWeatherForecastHour {
  time: string;
  waveHeight: number | null;
  wavePeriod: number | null;
  swellHeight: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  temperature: number | null;
  pressure: number | null;
  precipitation: number | null;
  visibility: number | null;
}

export interface MarineWeatherAlert {
  type: string;
  severity: string;
  title: string;
  description: string;
}

export interface MarineWeatherData {
  success: boolean;
  source: string;
  location: { lat: number; lng: number };
  current: MarineWeatherCurrent;
  forecast: MarineWeatherForecastHour[];
  alerts: MarineWeatherAlert[];
}

export function useMarineWeather(lat: number, lng: number, enabled = true) {
  return useQuery<MarineWeatherData>({
    queryKey: ["marine-weather", lat, lng],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("marine-weather", {
        body: { lat, lng, forecast_days: 3 },
      });

      if (error) throw new Error(error.message || "Failed to fetch marine weather");
      if (!data?.success) throw new Error(data?.error || "Weather API returned error");

      return data as MarineWeatherData;
    },
    enabled: enabled && !!lat && !!lng,
    staleTime: 15 * 60 * 1000, // 15 min
    gcTime: 60 * 60 * 1000, // 1h cache
    retry: 2,
    refetchInterval: 30 * 60 * 1000, // 30 min auto-refresh
  });
}
