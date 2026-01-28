/**
 * Centralized Weather Service
 * Multi-source weather data with sequential fallback: Windy → StormGlass → OpenWeather
 * 
 * @module services/weather
 */

import { supabase } from "@/integrations/supabase/client";
import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";

// ===============================
// Types & Interfaces
// ===============================

export type WeatherSource = "windy" | "stormglass" | "openweather" | "fallback";

export interface NormalizedWeatherData {
  source: WeatherSource;
  windSpeed: number; // m/s
  windSpeedKnots: number; // knots
  windDirection: number; // degrees
  swellHeight?: number; // meters
  waveHeight?: number; // meters
  pressure?: number; // hPa
  temperature?: number; // Celsius
  humidity?: number; // percentage
  visibility?: number; // meters
  timestamp: string;
  description?: string;
  seaState?: string;
}

export interface WeatherRequestLog {
  api: WeatherSource;
  latitude: number;
  longitude: number;
  status: "success" | "error" | "timeout";
  statusCode?: number;
  responseTimeMs: number;
  error?: string;
  timestamp: string;
}

export interface WeatherError extends Error {
  code: "ALL_SOURCES_FAILED" | "TIMEOUT" | "NETWORK_ERROR" | "API_ERROR";
  attempts: Array<{ source: WeatherSource; error: string }>;
}

interface CacheEntry {
  data: NormalizedWeatherData;
  timestamp: number;
}

// ===============================
// Configuration
// ===============================

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 10000; // 10 seconds
const ENABLE_LOGS = import.meta.env.VITE_ENABLE_WEATHER_LOGS === "true";

const weatherCache = new Map<string, CacheEntry>();

// ===============================
// Logging Functions
// ===============================

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/**
 * Log weather request details for monitoring and debugging
 */
export function logWeatherRequest(log: WeatherRequestLog): void {
  const logMessage = `[Weather:${log.api}] ${log.status.toUpperCase()} - (${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}) - ${log.responseTimeMs}ms`;

  if (log.status === "success") {
    if (ENABLE_LOGS) {
      logger.info(logMessage);
    }
  } else {
    logger.warn(logMessage, { error: log.error });

    // Send to Sentry for error tracking
    if (log.status === "error" || log.status === "timeout") {
      Sentry.captureMessage(`Weather API Error: ${log.api}`, {
        level: "warning",
        tags: {
          api: log.api,
          status: log.status,
        },
        extra: {
          latitude: log.latitude,
          longitude: log.longitude,
          responseTimeMs: log.responseTimeMs,
          statusCode: log.statusCode,
          error: log.error,
        },
      });
    }

    // Send to PostHog if available
    try {
      const posthog = (window as any).posthog;
      if (posthog?.capture) {
        posthog.capture("weather_error", {
          api: log.api,
          status: log.status,
          latitude: log.latitude,
          longitude: log.longitude,
          responseTimeMs: log.responseTimeMs,
          error: log.error,
        });
      }
    } catch {
      // PostHog not available, ignore
    }
  }
}

// ===============================
// Sea State Helper
// ===============================

function getSeaState(waveHeight: number | undefined): string | undefined {
  if (waveHeight === undefined) return undefined;
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

// ===============================
// API Fetchers
// ===============================

/**
 * Fetch weather from Windy API (primary source)
 */
async function fetchWindyData(lat: number, lon: number): Promise<NormalizedWeatherData> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const { data, error } = await supabase.functions.invoke("weather-integration", {
      body: {
        latitude: lat,
        longitude: lon,
        source: "windy",
        vessel_id: "weather-service",
      },
    });

    clearTimeout(timeoutId);

    if (error) throw error;

    const windSpeed = data?.weather?.current?.wind_speed ?? null;
    const waveHeight = data?.weather?.waves?.height ?? data?.weather?.marine_conditions?.wave_height ?? null;

    logWeatherRequest({
      api: "windy",
      latitude: lat,
      longitude: lon,
      status: "success",
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return {
      source: "windy",
      windSpeed: windSpeed ?? 0,
      windSpeedKnots: (windSpeed ?? 0) * 1.944,
      windDirection: data?.weather?.current?.wind_direction ?? 0,
      swellHeight: data?.weather?.marine_conditions?.swell_height ?? undefined,
      waveHeight: waveHeight ?? undefined,
      pressure: data?.weather?.current?.pressure ?? undefined,
      temperature: data?.weather?.current?.temperature ?? undefined,
      humidity: data?.weather?.current?.humidity ?? undefined,
      visibility: data?.weather?.current?.visibility ?? undefined,
      timestamp: new Date().toISOString(),
      description: data?.weather?.current?.weather_condition ?? "Windy",
      seaState: getSeaState(waveHeight),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === "AbortError";

    logWeatherRequest({
      api: "windy",
      latitude: lat,
      longitude: lon,
      status: isTimeout ? "timeout" : "error",
      responseTimeMs: responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Fetch weather from StormGlass API (secondary source)
 */
async function fetchStormGlassData(lat: number, lon: number): Promise<NormalizedWeatherData> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const { data, error } = await supabase.functions.invoke("stormglass-weather", {
      body: {
        action: "weather",
        lat,
        lng: lon,
      },
    });

    clearTimeout(timeoutId);

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "StormGlass request failed");

    const current = data?.data?.current;
    const windSpeed = current?.windSpeed ?? 0;
    const waveHeight = current?.waveHeight ?? undefined;

    logWeatherRequest({
      api: "stormglass",
      latitude: lat,
      longitude: lon,
      status: "success",
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return {
      source: "stormglass",
      windSpeed,
      windSpeedKnots: current?.windSpeedKnots ?? windSpeed * 1.944,
      windDirection: current?.windDirection ?? 0,
      swellHeight: undefined, // StormGlass uses waveHeight
      waveHeight,
      pressure: current?.pressure ?? undefined,
      temperature: current?.airTemperature ?? undefined,
      humidity: current?.humidity ?? undefined,
      visibility: current?.visibility ?? undefined,
      timestamp: new Date().toISOString(),
      description: "StormGlass Marine Data",
      seaState: getSeaState(waveHeight),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === "AbortError";

    logWeatherRequest({
      api: "stormglass",
      latitude: lat,
      longitude: lon,
      status: isTimeout ? "timeout" : "error",
      responseTimeMs: responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Fetch weather from OpenWeatherMap API (tertiary source)
 */
async function fetchOpenWeatherData(lat: number, lon: number): Promise<NormalizedWeatherData> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const { data, error } = await supabase.functions.invoke("weather-integration", {
      body: {
        latitude: lat,
        longitude: lon,
        source: "openweather",
        vessel_id: "weather-service",
      },
    });

    clearTimeout(timeoutId);

    if (error) throw error;

    const current = data?.weather?.current;
    const windSpeed = current?.wind_speed ?? 0;

    logWeatherRequest({
      api: "openweather",
      latitude: lat,
      longitude: lon,
      status: "success",
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return {
      source: "openweather",
      windSpeed,
      windSpeedKnots: windSpeed * 1.944,
      windDirection: current?.wind_direction ?? 0,
      pressure: current?.pressure ?? undefined,
      temperature: current?.temperature ?? undefined,
      humidity: current?.humidity ?? undefined,
      visibility: current?.visibility ?? undefined,
      timestamp: new Date().toISOString(),
      description: current?.weather_condition ?? "OpenWeather",
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === "AbortError";

    logWeatherRequest({
      api: "openweather",
      latitude: lat,
      longitude: lon,
      status: isTimeout ? "timeout" : "error",
      responseTimeMs: responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

// ===============================
// Main Function with Fallback
// ===============================

export interface GetWeatherOptions {
  forceRefresh?: boolean;
  preferredSource?: WeatherSource;
}

/**
 * Get weather data with automatic fallback
 * Order: Windy → StormGlass → OpenWeather
 */
export async function getWeatherData(
  lat: number,
  lon: number,
  options: GetWeatherOptions = {}
): Promise<NormalizedWeatherData> {
  const { forceRefresh = false, preferredSource } = options;
  const cacheKey = getCacheKey(lat, lon);

  // Check cache first
  if (!forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (ENABLE_LOGS) {
        console.log("[Weather] Using cached data");
      }
      return cached.data;
    }
  }

  const attempts: Array<{ source: WeatherSource; error: string }> = [];

  // Define fetch order
  const sources: Array<{
    name: WeatherSource;
    fetch: () => Promise<NormalizedWeatherData>;
  }> = [
    { name: "windy", fetch: () => fetchWindyData(lat, lon) },
    { name: "stormglass", fetch: () => fetchStormGlassData(lat, lon) },
    { name: "openweather", fetch: () => fetchOpenWeatherData(lat, lon) },
  ];

  // If preferred source specified, move it to front
  if (preferredSource && preferredSource !== "fallback") {
    const preferredIndex = sources.findIndex((s) => s.name === preferredSource);
    if (preferredIndex > 0) {
      const [preferred] = sources.splice(preferredIndex, 1);
      sources.unshift(preferred);
    }
  }

  // Try each source sequentially
  for (const source of sources) {
    try {
      logger.debug(`[Weather] Trying ${source.name}...`);
      const data = await source.fetch();

      // Cache successful result
      weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      logger.debug(`[Weather] Success from ${source.name}`);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      attempts.push({ source: source.name, error: errorMessage });
      logger.warn(`[Weather] ${source.name} failed: ${errorMessage}`);
    }
  }

  // All sources failed - try to use expired cache
  const expiredCache = weatherCache.get(cacheKey);
  if (expiredCache) {
    logger.warn("[Weather] All sources failed, using expired cache");
    return {
      ...expiredCache.data,
      source: "fallback",
      description: "Dados em cache (offline)",
    };
  }

  // Create structured error
  const weatherError = new Error("All weather API sources failed") as WeatherError;
  weatherError.code = "ALL_SOURCES_FAILED";
  weatherError.attempts = attempts;

  // Report to Sentry
  Sentry.captureException(weatherError, {
    tags: { component: "weather-service" },
    extra: { attempts, coordinates: { lat, lon } },
  });

  throw weatherError;
}

// ===============================
// Cache Management
// ===============================

/**
 * Clear all cached weather data
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
    oldestEntry: oldestTimestamp === Infinity ? null : new Date(oldestTimestamp),
  };
}

export default {
  getWeatherData,
  clearWeatherCache,
  getWeatherCacheStats,
  logWeatherRequest,
};
