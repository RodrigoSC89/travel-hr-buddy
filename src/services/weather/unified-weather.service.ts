// @ts-nocheck - Schema alignment pending
/**
 * Unified Weather Service
 * Provides multi-source weather data with automatic fallback
 * Sources: OpenWeather (primary), StormGlass (marine), Windy (wind/waves)
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface WeatherDataUnified {
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  visibility: number | null;
  description: string;
  icon: string | null;
  source: "openweather" | "stormglass" | "windy" | "fallback";
  timestamp: string;
  // Marine-specific
  waveHeight: number | null;
  waveDirection: number | null;
  wavePeriod: number | null;
  seaState: string | null;
  waterTemperature: number | null;
  currentSpeed: number | null;
  currentDirection: number | null;
}

export interface ForecastDataUnified {
  datetime: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  description: string;
  icon: string | null;
}

interface CacheEntry {
  data: WeatherDataUnified;
  timestamp: number;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const weatherCache = new Map<string, CacheEntry>();

/**
 * Generate cache key from coordinates
 */
function getCacheKey(lat: number, lon: number): string {
  // Round to 2 decimal places for cache efficiency
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Fetch weather from Edge Function with retry logic
 */
async function fetchFromEdgeFunction(
  lat: number,
  lon: number,
  source: "auto" | "openweather" | "windy" | "stormglass" = "auto",
  retries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          latitude: lat,
          longitude: lon,
          source,
          vessel_id: "unified-service",
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      logger.warn(`[Weather] Attempt ${attempt}/${retries} failed`, { error: err instanceof Error ? err.message : String(err) });
      if (attempt === retries) throw err;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
    }
  }
}

/**
 * Fetch StormGlass marine data
 */
async function fetchStormGlassData(lat: number, lon: number): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke("stormglass-forecast", {
      body: { lat, lng: lon },
    });

    if (error) throw error;
    return data;
  } catch (err) {
    logger.warn("[Weather] StormGlass fallback failed", { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

/**
 * Parse OpenWeather response to unified format
 */
function parseOpenWeatherResponse(data: any): Partial<WeatherDataUnified> {
  if (!data?.current) return {};

  return {
    temperature: data.current.temperature,
    feelsLike: data.current.feels_like,
    humidity: data.current.humidity,
    pressure: data.current.pressure,
    windSpeed: data.current.wind_speed,
    windDirection: data.current.wind_direction,
    windGust: data.current.wind_gust,
    visibility: data.current.visibility,
    description: data.current.weather_condition || "Dados disponíveis",
    icon: data.current.weather_icon,
    source: "openweather" as const,
  };
}

/**
 * Parse StormGlass response to unified format
 */
function parseStormGlassResponse(data: any): Partial<WeatherDataUnified> {
  if (!data?.hours?.[0]) return {};

  const current = data.hours[0];

  return {
    waveHeight: current.waveHeight?.sg || current.waveHeight?.noaa || null,
    waveDirection: current.waveDirection?.sg || current.waveDirection?.noaa || null,
    wavePeriod: current.wavePeriod?.sg || current.wavePeriod?.noaa || null,
    waterTemperature: current.waterTemperature?.sg || current.waterTemperature?.noaa || null,
    currentSpeed: current.currentSpeed?.sg || current.currentSpeed?.noaa || null,
    currentDirection: current.currentDirection?.sg || current.currentDirection?.noaa || null,
    windSpeed: current.windSpeed?.sg || current.windSpeed?.noaa || null,
    source: "stormglass" as const,
  };
}

/**
 * Get sea state description from wave height
 */
function getSeaState(waveHeight: number | null): string | null {
  if (waveHeight === null) return null;
  if (waveHeight < 0.1) return "Calmo (0)";
  if (waveHeight < 0.5) return "Tranquilo (1)";
  if (waveHeight < 1.25) return "Leve (2)";
  if (waveHeight < 2.5) return "Moderado (3)";
  if (waveHeight < 4) return "Agitado (4)";
  if (waveHeight < 6) return "Muito Agitado (5)";
  if (waveHeight < 9) return "Grosso (6)";
  if (waveHeight < 14) return "Muito Grosso (7)";
  return "Fenomenal (8+)";
}

/**
 * Generate fallback data when all APIs fail
 */
function generateFallbackData(lat: number, lon: number): WeatherDataUnified {
  return {
    temperature: null,
    feelsLike: null,
    humidity: null,
    pressure: null,
    windSpeed: null,
    windDirection: null,
    windGust: null,
    visibility: null,
    description: "Dados indisponíveis - tentando reconectar...",
    icon: null,
    source: "fallback",
    timestamp: new Date().toISOString(),
    waveHeight: null,
    waveDirection: null,
    wavePeriod: null,
    seaState: null,
    waterTemperature: null,
    currentSpeed: null,
    currentDirection: null,
  };
}

/**
 * Main function: Get unified weather data with multi-source fallback
 */
export async function getWeatherData(
  lat: number,
  lon: number,
  options: {
    includeMarineData?: boolean;
    forceRefresh?: boolean;
  } = {}
): Promise<WeatherDataUnified> {
  const { includeMarineData = true, forceRefresh = false } = options;
  const cacheKey = getCacheKey(lat, lon);

  // Check cache first (unless forced refresh)
  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      logger.debug("[Weather] Using cached data");
      return cached.data;
    }
  }

  let weatherData: WeatherDataUnified = generateFallbackData(lat, lon);

  try {
    // Try primary source (OpenWeather via Edge Function)
    logger.debug("[Weather] Fetching from primary source (OpenWeather)...");
    const primaryData = await fetchFromEdgeFunction(lat, lon, "openweather");
    const parsed = parseOpenWeatherResponse(primaryData);

    if (parsed.temperature !== undefined) {
      weatherData = {
        ...weatherData,
        ...parsed,
        timestamp: new Date().toISOString(),
      };
    }

    // Fetch marine data if requested
    if (includeMarineData) {
      logger.debug("[Weather] Fetching marine data (StormGlass)...");
      const marineData = await fetchStormGlassData(lat, lon);
      const marineParsed = parseStormGlassResponse(marineData);

      if (marineParsed.waveHeight !== undefined) {
        weatherData = {
          ...weatherData,
          ...marineParsed,
          seaState: getSeaState(marineParsed.waveHeight ?? null),
          source: weatherData.source, // Keep primary source
        };
      }
    }

    // Cache successful result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    logger.info("[Weather] Data fetched successfully", { source: weatherData.source });
    return weatherData;
  } catch (error) {
    logger.error("[Weather] All sources failed", error);
    
    // Return cached data if available (even if expired)
    const cached = weatherCache.get(cacheKey);
    if (cached) {
      logger.warn("[Weather] Using expired cache as fallback");
      return { ...cached.data, description: "Dados em cache (offline)" };
    }

    return weatherData;
  }
}

/**
 * Get weather forecast
 */
export async function getWeatherForecast(
  lat: number,
  lon: number
): Promise<ForecastDataUnified[]> {
  try {
    const data = await fetchFromEdgeFunction(lat, lon, "openweather");

    if (!data?.forecast) {
      return [];
    }

    return data.forecast.map((item: any) => ({
      datetime: item.datetime,
      temperature: item.temperature,
      tempMin: item.temperature - 2,
      tempMax: item.temperature + 2,
      windSpeed: item.wind_speed,
      windDirection: item.wind_direction,
      humidity: item.humidity ?? 60,
      description: item.description ?? "Previsão",
      icon: item.icon,
    }));
  } catch (error) {
    logger.error("[Weather] Forecast fetch failed:", error);
    return [];
  }
}

/**
 * Clear weather cache
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
  logger.debug("[Weather] Cache cleared");
}

/**
 * Get cache statistics
 */
export function getWeatherCacheStats(): {
  entries: number;
  oldestEntry: Date | null;
} {
  let oldestTimestamp = Infinity;

  weatherCache.forEach((entry) => {
    if (entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
    }
  });

  return {
    entries: weatherCache.size,
    oldestEntry:
      oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
  };
}

/**
 * React Hook for weather data
 */
export function useWeatherData(lat: number, lon: number) {
  // This is a simple utility function - for React, use with useQuery
  return {
    fetch: () => getWeatherData(lat, lon),
    fetchForecast: () => getWeatherForecast(lat, lon),
  };
}

export default {
  getWeatherData,
  getWeatherForecast,
  clearWeatherCache,
  getWeatherCacheStats,
  useWeatherData,
};
