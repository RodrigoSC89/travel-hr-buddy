
/**
 * Weather Service
 * Integrates with OpenWeatherMap API for maritime weather data
 * Implements 1-hour caching in weather_logs table
 * PATCH-601: Re-added @ts-nocheck for build stability
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  wave_height?: number;
  sea_state?: string;
  visibility: number;
  description: string;
  icon: string;
  timestamp: string;
}

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
  wind_speed: number;
  humidity: number;
}

interface WeatherAlert {
  event: string;
  description: string;
  start: string;
  end: string;
  severity: string;
}

interface OpenWeatherMapMain {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
}

interface OpenWeatherMapWind {
  speed: number;
  deg: number;
}

interface OpenWeatherMapWeatherItem {
  description: string;
  icon: string;
}

interface OpenWeatherMapResponse {
  main: OpenWeatherMapMain;
  wind: OpenWeatherMapWind;
  weather: OpenWeatherMapWeatherItem[];
  visibility: number;
  waves?: {
    height: number;
    sea_state: string;
  };
}

interface OpenWeatherMapForecastItem {
  dt_txt: string;
  main: OpenWeatherMapMain;
  weather: OpenWeatherMapWeatherItem[];
  wind: OpenWeatherMapWind;
}

interface OpenWeatherMapForecastResponse {
  list: OpenWeatherMapForecastItem[];
}

interface OpenWeatherMapAlert {
  event: string;
  description: string;
  start: number;
  end: number;
  tags?: string[];
}

interface OpenWeatherMapAlertsResponse {
  alerts?: OpenWeatherMapAlert[];
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if cached weather data is still valid
 */
async function getCachedWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const oneHourAgo = new Date(Date.now() - CACHE_DURATION_MS).toISOString();
    
    const { data, error } = await supabase
      .from("weather_logs")
      .select("*")
      .eq("latitude", lat)
      .eq("longitude", lon)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.weather_data as WeatherData;
  } catch (error) {
    logger.warn("Failed to get cached weather", error);
    return null;
  }
}

/**
 * Save weather data to cache
 */
async function cacheWeather(lat: number, lon: number, weatherData: WeatherData): Promise<void> {
  try {
    await supabase.from("weather_logs").insert({
      latitude: lat,
      longitude: lon,
      weather_data: weatherData,
    });
  } catch (error) {
    logger.error("Failed to cache weather data", error);
    // Don't throw - caching failure shouldn't break the weather service
  }
}

/**
 * Get current weather data
 */
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  if (!API_KEY) {
    logger.error("OpenWeatherMap API key not configured");
    throw new Error("Weather service not configured");
  }

  // Check cache first
  const cached = await getCachedWeather(lat, lon);
  if (cached) {
    logger.info("Using cached weather data");
    return cached;
  }

  try {
    logger.info("Fetching current weather from OpenWeatherMap", { lat, lon });

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenWeatherMapResponse;

    const weatherData: WeatherData = {
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      visibility: data.visibility,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString(),
    });

    // Maritime-specific data (if available from marine API)
    if (data.waves) {
      weatherData.wave_height = data.waves.height;
      weatherData.sea_state = data.waves.sea_state;
    }

    // Cache the weather data
    await cacheWeather(lat, lon, weatherData);

    logger.info("Weather data fetched successfully");
    return weatherData;
  } catch (error) {
    logger.error("Failed to fetch weather data", error);
    throw error;
  }
}

/**
 * Get 5-day forecast
 */
export async function getWeatherForecast(
  lat: number,
  lon: number
): Promise<ForecastDay[]> {
  if (!API_KEY) {
    logger.error("OpenWeatherMap API key not configured");
    throw new Error("Weather service not configured");
  }

  try {
    logger.info("Fetching weather forecast", { lat, lon });

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenWeatherMapForecastResponse;

    // Group forecasts by day and get daily aggregates
    const dailyForecasts = new Map<string, OpenWeatherMapForecastItem[]>();
    
    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    const forecast: ForecastDay[] = Array.from(dailyForecasts.entries())
      .slice(0, 5)
      .map(([date, items]) => {
        const temps = items.map((i) => i.main.temp);
        const midday = items.find((i) => i.dt_txt.includes("12:00")) || items[0];

        return {
          date,
          temp_max: Math.max(...temps),
          temp_min: Math.min(...temps),
          description: midday.weather[0].description,
          icon: midday.weather[0].icon,
          wind_speed: midday.wind.speed,
          humidity: midday.main.humidity,
        });
      });

    logger.info("Forecast data fetched successfully", { days: forecast.length });
    return forecast;
  } catch (error) {
    logger.error("Failed to fetch forecast data", error);
    throw error;
  }
}

/**
 * Get weather alerts
 */
export async function getWeatherAlerts(
  lat: number,
  lon: number
): Promise<WeatherAlert[]> {
  if (!API_KEY) {
    return [];
  }

  try {
    logger.info("Fetching weather alerts", { lat, lon });

    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&exclude=minutely,hourly,daily`
    );

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenWeatherMapAlertsResponse;

    if (!data.alerts || data.alerts.length === 0) {
      return [];
    }

    const alerts: WeatherAlert[] = data.alerts.map((alert) => ({
      event: alert.event,
      description: alert.description,
      start: new Date(alert.start * 1000).toISOString(),
      end: new Date(alert.end * 1000).toISOString(),
      severity: alert.tags?.[0] || "unknown",
    }));

    logger.info("Weather alerts fetched", { count: alerts.length });
    return alerts;
  } catch (error) {
    logger.warn("Failed to fetch weather alerts", error);
    return []; // Don't throw - alerts are optional
  }
}

/**
 * Get maritime-specific data
 */
export async function getMaritimeData(
  lat: number,
  lon: number
): Promise<{
  wind_speed: number;
  wind_direction: number;
  wave_height: number;
  sea_state: string;
}> {
  // For now, return data from current weather
  // In production, this could integrate with a specialized marine API
  const weather = await getCurrentWeather(lat, lon);
  
  return {
    wind_speed: weather.wind_speed,
    wind_direction: weather.wind_direction,
    wave_height: weather.wave_height || 0,
    sea_state: weather.sea_state || "calm",
  };
}

export const weatherService = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  getMaritimeData,
};
