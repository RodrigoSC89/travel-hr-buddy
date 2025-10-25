/**
 * 72-Hour Forecast Component
 * PATCH 105.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Thermometer, Wind, Droplets } from "lucide-react";
import type { WeatherForecastHour } from "../types";
import { format } from "date-fns";

interface ForecastPanelProps {
  forecast: WeatherForecastHour[];
}

export function ForecastPanel({ forecast }: ForecastPanelProps) {
  if (forecast.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-400">
            <p>No forecast data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          72-Hour Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {forecast.map((hour, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-800 rounded-lg p-4 min-w-[160px]"
              >
                {/* Time */}
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-400">
                    {format(new Date(hour.timestamp), "MMM d")}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(hour.timestamp), "HH:mm")}
                  </p>
                </div>

                {/* Weather Icon/Description */}
                <div className="text-center mb-3">
                  <p className="text-xs text-gray-300 capitalize line-clamp-2">
                    {hour.description}
                  </p>
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Thermometer className="h-4 w-4 text-gray-400" />
                  <span className="text-white font-medium">
                    {hour.temperature.toFixed(1)}°C
                  </span>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Wind className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">
                    {hour.wind_speed.toFixed(1)} m/s
                  </span>
                </div>

                {/* Humidity */}
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{hour.humidity}%</span>
                </div>

                {/* Precipitation Probability */}
                {hour.precipitation_probability !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      Rain: {hour.precipitation_probability.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
