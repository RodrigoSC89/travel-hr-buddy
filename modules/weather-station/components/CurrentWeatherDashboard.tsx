/**
 * Current Weather Dashboard Component
 * PATCH 105.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
} from "lucide-react";
import type { CurrentConditions } from "../types";

interface CurrentWeatherDashboardProps {
  conditions: CurrentConditions;
  locationName: string;
}

export function CurrentWeatherDashboard({
  conditions,
  locationName,
}: CurrentWeatherDashboardProps) {
  const getSeverityColor = (windSpeed: number) => {
    if (windSpeed > 25) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (windSpeed > 20) return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    if (windSpeed > 15) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-green-500/20 text-green-300 border-green-500/30";
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Current Weather - {locationName}
          </CardTitle>
          <Badge variant="outline" className={getSeverityColor(conditions.wind_speed)}>
            {conditions.wind_speed > 25
              ? "Severe"
              : conditions.wind_speed > 20
              ? "High Winds"
              : conditions.wind_speed > 15
              ? "Moderate"
              : "Normal"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Temperature */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Thermometer className="h-4 w-4" />
              <span>Temperature</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {conditions.temperature.toFixed(1)}°C
            </p>
            {conditions.feels_like && (
              <p className="text-xs text-gray-400 mt-1">
                Feels like {conditions.feels_like.toFixed(1)}°C
              </p>
            )}
          </div>

          {/* Wind Speed */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wind className="h-4 w-4" />
              <span>Wind Speed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {conditions.wind_speed.toFixed(1)} m/s
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {conditions.wind_direction}° ({getWindDirection(conditions.wind_direction)})
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Droplets className="h-4 w-4" />
              <span>Humidity</span>
            </div>
            <p className="text-2xl font-bold text-white">{conditions.humidity}%</p>
          </div>

          {/* Visibility */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Eye className="h-4 w-4" />
              <span>Visibility</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {conditions.visibility.toFixed(1)} km
            </p>
          </div>

          {/* Pressure */}
          {conditions.pressure && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Gauge className="h-4 w-4" />
                <span>Pressure</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {conditions.pressure} hPa
              </p>
            </div>
          )}

          {/* Conditions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Cloud className="h-4 w-4" />
              <span>Conditions</span>
            </div>
            <p className="text-sm font-medium text-white capitalize">
              {conditions.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
}
