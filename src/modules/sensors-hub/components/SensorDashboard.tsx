/**
 * PATCH 453 - Sensor Dashboard Component
 * Real-time sensor readings with charts
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Gauge, Droplets, Wind, Waves, Activity } from "lucide-react";
import type { SensorReading } from "../types";

interface SensorDashboardProps {
  readings: SensorReading[];
  onRefresh: () => void;
}

export const SensorDashboard: React.FC<SensorDashboardProps> = ({ readings }) => {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="h-5 w-5" />;
      case "pressure": return <Gauge className="h-5 w-5" />;
      case "humidity": return <Droplets className="h-5 w-5" />;
      case "wind": return <Wind className="h-5 w-5" />;
      case "sonar": return <Waves className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-500";
      case "warning": return "bg-yellow-500/20 text-yellow-500";
      case "error": return "bg-red-500/20 text-red-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  const getValueColor = (type: string, value: number) => {
    switch (type) {
      case "temperature":
        if (value < 0 || value > 40) return "text-red-500";
        if (value < 5 || value > 35) return "text-yellow-500";
        return "text-green-500";
      case "pressure":
        if (value < 980 || value > 1030) return "text-red-500";
        if (value < 990 || value > 1020) return "text-yellow-500";
        return "text-green-500";
      case "humidity":
        if (value < 30 || value > 80) return "text-red-500";
        if (value < 40 || value > 70) return "text-yellow-500";
        return "text-green-500";
      default:
        return "text-primary";
    }
  };

  const getUnit = (type: string) => {
    switch (type) {
      case "temperature": return "°C";
      case "pressure": return "hPa";
      case "humidity": return "%";
      case "wind": return "m/s";
      case "sonar": return "m";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readings.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No sensor readings available
            </div>
          ) : (
            readings.map(reading => (
              <Card key={reading.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(reading.type)}
                      <span className="font-semibold">{reading.name}</span>
                    </div>
                    <Badge className={getStatusColor(reading.status)}>
                      {reading.status}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getValueColor(reading.type, reading.value)}`}>
                      {reading.value.toFixed(1)}{getUnit(reading.type)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {reading.location}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Last update: {new Date(reading.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
