/**
 * IoT Dashboard - Real-time sensor monitoring
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIoT } from "@/hooks/useIoT";
import { motion } from "framer-motion";
import {
  Fuel, Thermometer, Gauge, Navigation, Anchor, Radio,
  Activity, Waves, AlertTriangle, CheckCircle
} from "lucide-react";

interface IoTDashboardProps {
  vesselId: string;
  vesselName?: string;
  compact?: boolean;
}

export const IoTDashboard: React.FC<IoTDashboardProps> = ({ 
  vesselId, 
  vesselName = "Vessel",
  compact = false 
}) => {
  const { isConnected, telemetry, latestReadings, error } = useIoT({ vesselId });

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Erro ao conectar sensores: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!telemetry) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Conectando aos sensores...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sensors = [
    {
      id: "fuel",
      label: "Combustível",
      value: telemetry.fuelLevel,
      unit: "%",
      icon: Fuel,
      color: telemetry.fuelLevel > 30 ? "text-green-500" : telemetry.fuelLevel > 15 ? "text-yellow-500" : "text-red-500",
      showProgress: true
    },
    {
      id: "speed",
      label: "Velocidade",
      value: telemetry.speed.toFixed(1),
      unit: "nós",
      icon: Navigation,
      color: "text-blue-500"
    },
    {
      id: "heading",
      label: "Rumo",
      value: telemetry.heading,
      unit: "°",
      icon: Waves,
      color: "text-cyan-500"
    },
    {
      id: "engine",
      label: "Motor RPM",
      value: telemetry.engineRPM,
      unit: "RPM",
      icon: Gauge,
      color: "text-orange-500"
    },
    {
      id: "temperature",
      label: "Temperatura",
      value: telemetry.temperature.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: telemetry.temperature < 90 ? "text-green-500" : "text-red-500"
    },
    {
      id: "hours",
      label: "Horas Motor",
      value: telemetry.engineHours.toLocaleString(),
      unit: "h",
      icon: Activity,
      color: "text-purple-500"
    }
  ];

  if (compact) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Anchor className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{vesselName}</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <Radio className={`h-2 w-2 ${isConnected ? "text-green-500 animate-pulse" : "text-red-500"}`} />
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sensors.slice(0, 3).map((sensor) => (
              <div key={sensor.id} className="text-center">
                <sensor.icon className={`h-4 w-4 mx-auto ${sensor.color}`} />
                <p className="text-xs text-muted-foreground mt-1">{sensor.label}</p>
                <p className="font-medium text-sm">{sensor.value}{sensor.unit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary" />
              {vesselName} - Telemetria
            </CardTitle>
            <CardDescription>
              Dados em tempo real dos sensores IoT
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            <Radio className={`h-3 w-3 ${isConnected ? "animate-pulse" : ""}`} />
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sensors.map((sensor, index) => (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <sensor.icon className={`h-4 w-4 ${sensor.color}`} />
                <span className="text-sm text-muted-foreground">{sensor.label}</span>
              </div>
              <p className="text-2xl font-bold">
                {sensor.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {sensor.unit}
                </span>
              </p>
              {sensor.showProgress && (
                <Progress 
                  value={Number(sensor.value)} 
                  className="h-1.5 mt-2"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Position Info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm">
              Posição: {telemetry.position.lat.toFixed(4)}°, {telemetry.position.lng.toFixed(4)}°
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Atualizado: {telemetry.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
