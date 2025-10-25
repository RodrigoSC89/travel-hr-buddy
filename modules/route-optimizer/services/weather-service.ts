/**
 * Weather Service for Route Optimization
 * PATCH 104.0
 */

import type { WeatherWaypoint, Coordinates } from "../types";

interface OpenWeatherResponse {
  coord?: { lat: number; lon: number };
  weather?: Array<{ main: string; description: string }>;
  main?: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind?: {
    speed: number;
    deg: number;
  };
  visibility?: number;
}

/**
 * Fetch weather data for a specific location
 */
export async function fetchWeatherForLocation(
  location: Coordinates
): Promise<WeatherWaypoint | null> {
  const apiKey = import.meta.env.OPENWEATHER_API_KEY || import.meta.env.VITE_OPENWEATHER_API_KEY;

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

    const data: OpenWeatherResponse = await response.json();

    return {
      location,
      distance_from_origin: 0,
      timestamp: new Date().toISOString(),
      conditions: {
        temperature: data.main?.temp || 0,
        wind_speed: data.wind?.speed || 0,
        wind_direction: data.wind?.deg || 0,
        visibility: data.visibility ? data.visibility / 1000 : undefined, // Convert to km
        description: data.weather?.[0]?.description || "Unknown",
      },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

/**
 * Fetch weather forecast along a route
 */
export async function fetchRouteWeatherForecast(
  waypoints: Coordinates[]
): Promise<WeatherWaypoint[]> {
  const forecasts = await Promise.all(
    waypoints.map((waypoint, index) =>
      fetchWeatherForLocation(waypoint).then((forecast) =>
        forecast
          ? {
              ...forecast,
              distance_from_origin: index * 100, // Approximate distance in nm
            }
          : null
      )
    )
  );

  return forecasts.filter((f): f is WeatherWaypoint => f !== null);
}

/**
 * Generate waypoints along a great circle route
 */
export function generateRouteWaypoints(
  origin: Coordinates,
  destination: Coordinates,
  numWaypoints = 5
): Coordinates[] {
  const waypoints: Coordinates[] = [origin];

  for (let i = 1; i < numWaypoints; i++) {
    const fraction = i / numWaypoints;
    const lat = origin.lat + (destination.lat - origin.lat) * fraction;
    const lng = origin.lng + (destination.lng - origin.lng) * fraction;
    waypoints.push({ lat, lng });
  }

  waypoints.push(destination);
  return waypoints;
}
