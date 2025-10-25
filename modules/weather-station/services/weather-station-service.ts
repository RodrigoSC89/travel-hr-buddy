/**
 * Weather Station Service
 * PATCH 105.0
 */

import { supabase } from "../../../src/integrations/supabase/client";
import type {
  WeatherData,
  WeatherAlert,
  WeatherLocation,
  CurrentConditions,
  WeatherForecastHour,
  WeatherSeverity,
} from "../types";

/**
 * Fetch current weather for a location from OpenWeather API
 */
export async function fetchCurrentWeather(
  location: WeatherLocation
): Promise<CurrentConditions | null> {
  const apiKey =
    import.meta.env.OPENWEATHER_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn("OpenWeather API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      console.error("OpenWeather API error:", response.status);
      return null;
    }

    const data = await response.json();

    return {
      temperature: data.main?.temp || 0,
      feels_like: data.main?.feels_like,
      wind_speed: data.wind?.speed || 0,
      wind_direction: data.wind?.deg || 0,
      humidity: data.main?.humidity || 0,
      pressure: data.main?.pressure,
      visibility: data.visibility ? data.visibility / 1000 : 10,
      description: data.weather?.[0]?.description || "Unknown",
      icon: data.weather?.[0]?.icon,
    };
  } catch (error) {
    console.error("Error fetching current weather:", error);
    return null;
  }
}

/**
 * Fetch 72-hour weather forecast from OpenWeather API
 */
export async function fetch72HourForecast(
  location: WeatherLocation
): Promise<WeatherForecastHour[]> {
  const apiKey =
    import.meta.env.OPENWEATHER_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn("OpenWeather API key not configured");
    return [];
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric&cnt=24` // 24 * 3-hour intervals = 72 hours
    );

    if (!response.ok) {
      console.error("OpenWeather API forecast error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.list) {
      return [];
    }

    return data.list.map((item: { dt: number; main: { temp: number; humidity: number }; wind: { speed: number; deg: number }; weather: Array<{ description: string; icon: string }>; pop?: number }) => ({
      timestamp: new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp,
      wind_speed: item.wind.speed,
      wind_direction: item.wind.deg,
      humidity: item.main.humidity,
      precipitation_probability: item.pop ? item.pop * 100 : undefined,
      description: item.weather[0]?.description || "Unknown",
      icon: item.weather[0]?.icon,
    }));
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return [];
  }
}

/**
 * Fetch all weather data from database
 */
export async function fetchWeatherData(): Promise<WeatherData[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("weather_data")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching weather data:", error);
      return [];
    }

    return (data as WeatherData[]) || [];
  } catch (err) {
    console.warn("Weather data table may not exist yet");
    return [];
  }
}

/**
 * Fetch weather data for a specific vessel
 */
export async function fetchVesselWeatherData(vesselId: string): Promise<WeatherData[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("weather_data")
      .select("*")
      .eq("vessel_id", vesselId)
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching vessel weather data:", error);
      return [];
    }

    return (data as WeatherData[]) || [];
  } catch (err) {
    console.warn("Weather data table may not exist yet");
    return [];
  }
}

/**
 * Save weather data to database
 */
export async function saveWeatherData(
  vesselId: string | undefined,
  location: WeatherLocation,
  locationName: string,
  currentConditions: CurrentConditions,
  forecast: WeatherForecastHour[]
): Promise<void> {
  try {
    const severity = calculateSeverity(currentConditions, forecast);

    const { error } = await (supabase as any).from("weather_data").insert([
      {
        vessel_id: vesselId,
        location,
        location_name: locationName,
        current_conditions: currentConditions,
        forecast: { hourly: forecast },
        severity,
        alert_sent: false,
      },
    ]);

    if (error) {
      console.warn("Weather data table may not exist yet:", error.message);
    }
  } catch (err) {
    console.warn("Failed to save weather data - table may not exist yet");
  }
}

/**
 * Calculate weather severity based on conditions
 */
function calculateSeverity(
  current: CurrentConditions,
  forecast: WeatherForecastHour[]
): WeatherSeverity {
  // Check current conditions
  if (current.wind_speed > 25) return "severe";
  if (current.wind_speed > 20) return "high";
  if (current.wind_speed > 15) return "moderate";

  // Check forecast for severe conditions
  if (forecast.length > 0) {
    const maxWindSpeed = Math.max(...forecast.map((f) => f.wind_speed));
    if (maxWindSpeed > 25) return "high";
    if (maxWindSpeed > 20) return "moderate";
  }

  // Check visibility
  if (current.visibility < 1) return "high";
  if (current.visibility < 3) return "moderate";

  return "none";
}

/**
 * Fetch all weather alerts
 */
export async function fetchWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("weather_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching weather alerts:", error);
      return [];
    }

    return (data as WeatherAlert[]) || [];
  } catch (err) {
    console.warn("Weather alerts table may not exist yet");
    return [];
  }
}

/**
 * Fetch active (unacknowledged) weather alerts
 */
export async function fetchActiveWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("weather_alerts")
      .select("*")
      .eq("acknowledged", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active alerts:", error);
      return [];
    }

    return (data as WeatherAlert[]) || [];
  } catch (err) {
    console.warn("Weather alerts table may not exist yet");
    return [];
  }
}

/**
 * Acknowledge a weather alert
 */
export async function acknowledgeWeatherAlert(
  alertId: string,
  acknowledgedBy: string
): Promise<void> {
  try {
    const { error } = await (supabase as any)
      .from("weather_alerts")
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: acknowledgedBy,
      })
      .eq("id", alertId);

    if (error) {
      console.warn("Weather alerts table may not exist yet:", error.message);
    }
  } catch (err) {
    console.warn("Failed to acknowledge alert - table may not exist yet");
  }
}

/**
 * Create a new weather alert
 */
export async function createWeatherAlert(
  alert: Omit<WeatherAlert, "id" | "created_at" | "acknowledged" | "acknowledged_at" | "acknowledged_by">
): Promise<void> {
  try {
    const { error } = await (supabase as any).from("weather_alerts").insert([alert]);

    if (error) {
      console.warn("Weather alerts table may not exist yet:", error.message);
    }
  } catch (err) {
    console.warn("Failed to create alert - table may not exist yet");
  }
}
