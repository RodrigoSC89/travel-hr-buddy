/**
 * Real-Time Weather Data Component
 * PATCH 386 - Autonomous weather data updates with OpenWeather API
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Droplets, Thermometer, Gauge, Eye, Sunrise, Sunset } from "lucide-react";
import { logger } from "@/lib/logger";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  description: string;
  sunrise: number;
  sunset: number;
  lastUpdated: Date;
}

interface RealTimeWeatherDataProps {
  latitude?: number;
  longitude?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const RealTimeWeatherData: React.FC<RealTimeWeatherDataProps> = ({
  latitude = -15,
  longitude = -45,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes default
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchWeatherData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [latitude, longitude, autoRefresh, refreshInterval]);

  const fetchWeatherData = async () => {
    try {
      // In production, use actual OpenWeather API key from environment
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "demo-key";
      
      // Note: For demo purposes, we'll use mock data if API key is not available
      if (apiKey === "demo-key") {
        // Use mock data for demonstration
        setWeather(generateMockWeatherData());
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      setWeather({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000, // Convert to km
        description: data.weather[0]?.description || "Unknown",
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        lastUpdated: new Date(),
      });

      logger.info("Weather data updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      logger.error("Error fetching weather data:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateMockWeatherData = (): WeatherData => {
    // Generate realistic mock data for demo
    return {
      temperature: 24 + Math.random() * 4,
      feelsLike: 26 + Math.random() * 4,
      humidity: 65 + Math.random() * 10,
      pressure: 1013 + Math.random() * 10,
      windSpeed: 10 + Math.random() * 8,
      windDirection: Math.random() * 360,
      visibility: 8 + Math.random() * 2,
      description: ["clear sky", "few clouds", "scattered clouds", "partly cloudy"][Math.floor(Math.random() * 4)],
      sunrise: Date.now() / 1000 - 3600 * 6,
      sunset: Date.now() / 1000 + 3600 * 6,
      lastUpdated: new Date(),
    };
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading weather data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather.temperature.toFixed(1)}°C</div>
          <p className="text-xs text-muted-foreground">
            Feels like {weather.feelsLike.toFixed(1)}°C
          </p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {weather.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Wind</CardTitle>
          <Wind className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather.windSpeed.toFixed(1)} m/s</div>
          <p className="text-xs text-muted-foreground">
            Direction: {getWindDirection(weather.windDirection)} ({weather.windDirection.toFixed(0)}°)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather.humidity.toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">
            Pressure: {weather.pressure.toFixed(0)} hPa
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Visibility</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weather.visibility.toFixed(1)} km</div>
          <div className="flex items-center gap-2 mt-1">
            <Sunrise className="h-3 w-3 text-orange-500" />
            <p className="text-xs text-muted-foreground">{formatTime(weather.sunrise)}</p>
            <Sunset className="h-3 w-3 text-orange-700" />
            <p className="text-xs text-muted-foreground">{formatTime(weather.sunset)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {weather.lastUpdated.toLocaleString()}
            {autoRefresh && ` • Auto-refreshing every ${refreshInterval / 60000} minutes`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
