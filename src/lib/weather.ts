/**
 * PATCH 89.3 - Weather Service
 * OpenWeather API integration for real-time weather data
 */

import { logger } from "./logger";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  description: string;
  alerts: WeatherAlert[];
  location: string;
}

export interface WeatherAlert {
  event: string;
  severity: string;
  description: string;
  start: Date;
  end: Date;
}

export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  precipitationProbability: number;
}

/**
 * Get current weather data from OpenWeather API
 * Requires VITE_OPENWEATHER_API_KEY environment variable
 */
export async function getCurrentWeather(
  latitude: number = -23.5505, // Default: São Paulo, Brazil
  longitude: number = -46.6333
): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    logger.warn("OpenWeather API key not configured, using mock data");
    return getMockWeatherData();
  }

  try {
    logger.info("Fetching weather data from OpenWeather API", { latitude, longitude });

    // Current weather endpoint
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`OpenWeather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // Weather alerts endpoint (OneCall API)
    const alertsUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&exclude=minutely,hourly`;
    let alerts: WeatherAlert[] = [];

    try {
      const alertsResponse = await fetch(alertsUrl);
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        alerts = (alertsData.alerts || []).map((alert: any) => ({
          event: alert.event,
          severity: getSeverityLevel(alert.event),
          description: alert.description,
          start: new Date(alert.start * 1000),
          end: new Date(alert.end * 1000),
        }));
      }
    } catch (alertError) {
      logger.warn("Could not fetch weather alerts", alertError);
    }

    const result: WeatherData = {
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 1.94384), // Convert m/s to knots
      windDirection: getWindDirection(weatherData.wind.deg),
      description: weatherData.weather[0].description,
      alerts,
      location: weatherData.name,
    };

    logger.info("Weather data fetched successfully", result);
    return result;
  } catch (error) {
    logger.error("Failed to fetch weather data", error);
    return getMockWeatherData();
  }
}

/**
 * Get weather forecast for the next 5 days
 */
export async function getWeatherForecast(
  latitude: number = -23.5505,
  longitude: number = -46.6333
): Promise<WeatherForecast[]> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  if (!apiKey) {
    logger.warn("OpenWeather API key not configured, using mock forecast");
    return getMockForecast();
  }

  try {
    logger.info("Fetching weather forecast from OpenWeather API");

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();

    // Group forecasts by day (API returns 3-hour intervals)
    const dailyForecasts = new Map<string, any[]>();

    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    // Calculate daily min/max temperatures
    const forecasts: WeatherForecast[] = [];
    let count = 0;

    for (const [date, items] of dailyForecasts.entries()) {
      if (count >= 5) break;

      const temps = items.map(item => item.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));

      // Use midday forecast for description
      const middayItem = items.find(item => item.dt_txt.includes('12:00:00')) || items[0];
      const precipProb = Math.max(...items.map(item => item.pop || 0)) * 100;

      forecasts.push({
        date: new Date(date),
        temperature: {
          min: minTemp,
          max: maxTemp,
        },
        description: middayItem.weather[0].description,
        precipitationProbability: Math.round(precipProb),
      });

      count++;
    }

    logger.info("Weather forecast fetched successfully", { days: forecasts.length });
    return forecasts;
  } catch (error) {
    logger.error("Failed to fetch weather forecast", error);
    return getMockForecast();
  }
}

/**
 * Convert wind degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Determine severity level from alert event
 */
function getSeverityLevel(event: string): string {
  const highSeverityEvents = ['hurricane', 'typhoon', 'tornado', 'tsunami'];
  const mediumSeverityEvents = ['storm', 'wind', 'flood', 'rain'];
  
  const lowerEvent = event.toLowerCase();
  
  if (highSeverityEvents.some(e => lowerEvent.includes(e))) {
    return 'high';
  } else if (mediumSeverityEvents.some(e => lowerEvent.includes(e))) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Mock weather data for development/fallback
 */
function getMockWeatherData(): WeatherData {
  return {
    temperature: 24,
    humidity: 68,
    windSpeed: 12,
    windDirection: 'NE',
    description: 'partly cloudy',
    alerts: [
      {
        event: 'Strong Wind Advisory',
        severity: 'medium',
        description: 'Wind speeds may reach 25 knots',
        start: new Date(),
        end: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
    ],
    location: 'Mock Location',
  };
}

/**
 * Mock forecast data for development/fallback
 */
function getMockForecast(): WeatherForecast[] {
  const forecasts: WeatherForecast[] = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecasts.push({
      date,
      temperature: {
        min: 18 + Math.floor(Math.random() * 5),
        max: 26 + Math.floor(Math.random() * 5),
      },
      description: ['clear sky', 'partly cloudy', 'cloudy', 'light rain'][Math.floor(Math.random() * 4)],
      precipitationProbability: Math.floor(Math.random() * 60),
    });
  }
  
  return forecasts;
}
