/**
 * React Hook for Weather Data
 * Provides weather data with automatic caching, fallback, and real-time updates
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  getWeatherData, 
  getWeatherForecast, 
  WeatherDataUnified, 
  ForecastDataUnified 
} from "@/services/weather/unified-weather.service";

interface UseWeatherOptions {
  enabled?: boolean;
  includeMarineData?: boolean;
  refetchInterval?: number; // in milliseconds
  onError?: (error: Error) => void;
}

interface UseWeatherResult {
  weather: WeatherDataUnified | null;
  forecast: ForecastDataUnified[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  lastUpdated: Date | null;
  source: string;
}

/**
 * Hook for fetching and managing weather data
 */
export function useWeather(
  latitude: number,
  longitude: number,
  options: UseWeatherOptions = {}
): UseWeatherResult {
  const {
    enabled = true,
    includeMarineData = true,
    refetchInterval = 15 * 60 * 1000, // 15 minutes default
    onError,
  } = options;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Validate coordinates
  const isValidCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Query for current weather
  const weatherQuery = useQuery({
    queryKey: ["weather", "current", latitude, longitude, includeMarineData],
    queryFn: async () => {
      const data = await getWeatherData(latitude, longitude, { includeMarineData });
      setLastUpdated(new Date());
      return data;
    },
    enabled: enabled && isValidCoordinates,
    refetchInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });

  // Query for forecast
  const forecastQuery = useQuery({
    queryKey: ["weather", "forecast", latitude, longitude],
    queryFn: () => getWeatherForecast(latitude, longitude),
    enabled: enabled && isValidCoordinates,
    refetchInterval: refetchInterval * 2, // Forecast updates less frequently
    retry: 2,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Handle errors
  useEffect(() => {
    if (weatherQuery.error && onError) {
      onError(weatherQuery.error as Error);
    }
  }, [weatherQuery.error, onError]);

  // Combined refetch function
  const refetch = useCallback(() => {
    weatherQuery.refetch();
    forecastQuery.refetch();
  }, [weatherQuery, forecastQuery]);

  return {
    weather: weatherQuery.data ?? null,
    forecast: forecastQuery.data ?? [],
    isLoading: weatherQuery.isLoading || forecastQuery.isLoading,
    isError: weatherQuery.isError,
    error: weatherQuery.error as Error | null,
    refetch,
    lastUpdated,
    source: weatherQuery.data?.source ?? "unknown",
  };
}

/**
 * Hook for weather at vessel's current position
 */
export function useVesselWeather(vesselId: string) {
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);

  // You would typically fetch vessel position from your vessel tracking service
  // This is a placeholder that could be connected to your AIS tracking
  
  const weatherResult = useWeather(
    position?.lat ?? 0,
    position?.lon ?? 0,
    { enabled: position !== null, includeMarineData: true }
  );

  return {
    ...weatherResult,
    position,
    setPosition,
  };
}

/**
 * Hook for multiple locations (e.g., route waypoints)
 */
export function useMultiLocationWeather(
  locations: Array<{ lat: number; lon: number; name?: string }>
) {
  const queries = locations.map((loc, index) => ({
    ...useWeather(loc.lat, loc.lon, { enabled: true }),
    name: loc.name ?? `Location ${index + 1}`,
    coordinates: loc,
  }));

  return {
    locations: queries,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    refetchAll: () => queries.forEach((q) => q.refetch()),
  };
}

export default useWeather;
