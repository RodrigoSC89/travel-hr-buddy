/**
 * React Hook for Weather Data
 * Uses centralized weather service with React Query for caching
 * 
 * @module hooks/useWeatherData
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWeatherData,
  NormalizedWeatherData,
  GetWeatherOptions,
  WeatherSource,
} from "@/services/weather";

interface UseWeatherDataOptions {
  /** Whether to fetch data (default: true) */
  enabled?: boolean;
  /** Revalidation interval in milliseconds (default: 5 minutes) */
  refetchInterval?: number;
  /** Preferred API source */
  preferredSource?: WeatherSource;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when data is fetched successfully */
  onSuccess?: (data: NormalizedWeatherData) => void;
}

interface UseWeatherDataResult {
  /** Weather data (undefined while loading or on error) */
  data: NormalizedWeatherData | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Fetching state (includes background refetch) */
  isFetching: boolean;
  /** Error state */
  isError: boolean;
  /** Error object */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => void;
  /** Last successful update time */
  lastUpdated: Date | null;
  /** Data source */
  source: WeatherSource | undefined;
}

/**
 * Hook for fetching weather data with automatic caching and revalidation
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError, refetch } = useWeatherData(-23.55, -46.63);
 * 
 * if (isLoading) return <Spinner />;
 * if (isError) return <ErrorMessage onRetry={refetch} />;
 * 
 * return <WeatherDisplay data={data} />;
 * ```
 */
export function useWeatherData(
  latitude: number,
  longitude: number,
  options: UseWeatherDataOptions = {}
): UseWeatherDataResult {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    preferredSource,
    onError,
    onSuccess,
  } = options;

  const queryClient = useQueryClient();

  // Validate coordinates
  const isValidCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const query = useQuery({
    queryKey: ["weather", "normalized", latitude, longitude, preferredSource],
    queryFn: async () => {
      const fetchOptions: GetWeatherOptions = {};
      if (preferredSource) {
        fetchOptions.preferredSource = preferredSource;
      }

      const data = await getWeatherData(latitude, longitude, fetchOptions);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    },
    enabled: enabled && isValidCoordinates,
    refetchInterval,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 4 * 60 * 1000, // 4 minutes (slightly less than refetch interval)
    gcTime: 30 * 60 * 1000, // 30 minutes
    meta: {
      errorHandler: (error: Error) => {
        if (onError) {
          onError(error);
        }
      },
    },
  });

  // Handle error callback
  if (query.isError && onError && query.error) {
    onError(query.error);
  }

  // Manual refetch that forces refresh
  const refetch = () => {
    queryClient.invalidateQueries({
      queryKey: ["weather", "normalized", latitude, longitude],
    });
    query.refetch();
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    source: query.data?.source,
  };
}

/**
 * Hook for weather at multiple locations
 */
export function useMultipleWeatherData(
  locations: Array<{ lat: number; lon: number; name?: string }>
) {
  const results = locations.map((loc, index) => ({
    ...useWeatherData(loc.lat, loc.lon),
    name: loc.name ?? `Location ${index + 1}`,
    coordinates: loc,
  }));

  return {
    locations: results,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetchAll: () => results.forEach((r) => r.refetch()),
  };
}

export default useWeatherData;
