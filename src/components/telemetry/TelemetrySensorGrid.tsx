/**
 * TelemetrySensorGrid - Grid de Sensores em Tempo Real
 * PATCH 860 - Visualização avançada de sensores IoT
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Thermometer,
  Gauge,
  Radio,
  Zap,
  Navigation,
  Droplets,
  Wind,
  Anchor,
  Radar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Sensor {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "vibration" | "fuel" | "gps" | "humidity" | "wind" | "depth" | "radar";
  value: number;
  unit: string;
  min: number;
  max: number;
  status: "normal" | "warning" | "critical" | "offline";
  trend: "up" | "down" | "stable";
  location: string;
  lastUpdate: string;
  history: number[];
}

interface TelemetrySensorGridProps {
  vesselId?: string;
  className?: string;
}

export function TelemetrySensorGrid({ vesselId, className }: TelemetrySensorGridProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  const generateMockSensors = useCallback(() => {
    const sensorTypes: Sensor["type"][] = [
      "temperature", "pressure", "vibration", "fuel", 
      "humidity", "wind", "depth", "radar"
    ];
    
    const locations = [
      "Motor Principal", "Motor Auxiliar", "Sala de Máquinas",
      "Ponte de Comando", "Casco", "Hélice", "Sistema Elétrico",
      "Tanque de Combustível", "Sistema de Refrigeração", "Gerador"
    ];

    const mockSensors: Sensor[] = [];

    sensorTypes.forEach((type, typeIdx) => {
      locations.slice(0, 3).forEach((location, locIdx) => {
        const baseValue = getBaseValueForType(type);
        const variance = (Math.random() - 0.5) * 0.2 * baseValue;
        const value = baseValue + variance;
        
        const status: Sensor["status"] = 
          Math.random() > 0.95 ? "critical" :
          Math.random() > 0.85 ? "warning" :
          Math.random() > 0.98 ? "offline" : "normal";

        mockSensors.push({
          id: `sensor-${typeIdx}-${locIdx}`,
          name: `${getTypeLabel(type)} - ${location}`,
          type,
          value: Number(value.toFixed(2)),
          unit: getUnitForType(type),
          min: getMinForType(type),
          max: getMaxForType(type),
          status,
          trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as Sensor["trend"],
          location,
          lastUpdate: new Date().toISOString(),
          history: Array.from({ length: 10 }, () => baseValue + (Math.random() - 0.5) * 0.3 * baseValue),
        });
      });
    });

    setSensors(mockSensors);
  }, []);

  useEffect(() => {
    generateMockSensors();
    const interval = setInterval(generateMockSensors, 5000);
    return () => clearInterval(interval);
  }, [generateMockSensors]);

  const getBaseValueForType = (type: Sensor["type"]): number => {
    const values: Record<Sensor["type"], number> = {
      temperature: 75,
      pressure: 1.2,
      vibration: 2.5,
      fuel: 65,
      gps: 0,
      humidity: 45,
      wind: 15,
      depth: 12,
      radar: 50,
    };
    return values[type];
  };

  const getUnitForType = (type: Sensor["type"]): string => {
    const units: Record<Sensor["type"], string> = {
      temperature: "°C",
      pressure: "bar",
      vibration: "mm/s",
      fuel: "%",
      gps: "°",
      humidity: "%",
      wind: "kt",
      depth: "m",
      radar: "nm",
    };
    return units[type];
  };

  const getMinForType = (type: Sensor["type"]): number => {
    const mins: Record<Sensor["type"], number> = {
      temperature: 0,
      pressure: 0,
      vibration: 0,
      fuel: 0,
      gps: -90,
      humidity: 0,
      wind: 0,
      depth: 0,
      radar: 0,
    };
    return mins[type];
  };

  const getMaxForType = (type: Sensor["type"]): number => {
    const maxs: Record<Sensor["type"], number> = {
      temperature: 150,
      pressure: 5,
      vibration: 10,
      fuel: 100,
      gps: 90,
      humidity: 100,
      wind: 100,
      depth: 100,
      radar: 200,
    };
    return maxs[type];
  };

  const getTypeLabel = (type: Sensor["type"]): string => {
    const labels: Record<Sensor["type"], string> = {
      temperature: "Temperatura",
      pressure: "Pressão",
      vibration: "Vibração",
      fuel: "Combustível",
      gps: "GPS",
      humidity: "Umidade",
      wind: "Vento",
      depth: "Profundidade",
      radar: "Radar",
    };
    return labels[type];
  };

  const getTypeIcon = (type: Sensor["type"]) => {
    const icons: Record<Sensor["type"], React.ReactNode> = {
      temperature: <Thermometer className="h-5 w-5" />,
      pressure: <Gauge className="h-5 w-5" />,
      vibration: <Radio className="h-5 w-5" />,
      fuel: <Zap className="h-5 w-5" />,
      gps: <Navigation className="h-5 w-5" />,
      humidity: <Droplets className="h-5 w-5" />,
      wind: <Wind className="h-5 w-5" />,
      depth: <Anchor className="h-5 w-5" />,
      radar: <Radar className="h-5 w-5" />,
    };
    return icons[type];
  };

  const getTrendIcon = (trend: Sensor["trend"]) => {
    const icons: Record<Sensor["trend"], React.ReactNode> = {
      up: <TrendingUp className="h-4 w-4 text-success" />,
      down: <TrendingDown className="h-4 w-4 text-destructive" />,
      stable: <Minus className="h-4 w-4 text-muted-foreground" />,
    };
    return icons[trend];
  };

  const getStatusColor = (status: Sensor["status"]) => {
    const colors: Record<Sensor["status"], string> = {
      normal: "bg-success/20 text-success border-success/50",
      warning: "bg-warning/20 text-warning border-warning/50",
      critical: "bg-destructive/20 text-destructive border-destructive/50",
      offline: "bg-muted text-muted-foreground border-muted",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Sensor["status"]) => {
    const icons: Record<Sensor["status"], React.ReactNode> = {
      normal: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      critical: <XCircle className="h-4 w-4" />,
      offline: <XCircle className="h-4 w-4" />,
    };
    return icons[status];
  };

  const filteredSensors = filter === "all" 
    ? sensors 
    : filter === "alerts"
    ? sensors.filter(s => s.status === "warning" || s.status === "critical")
    : sensors.filter(s => s.type === filter);

  const statusCounts = {
    normal: sensors.filter(s => s.status === "normal").length,
    warning: sensors.filter(s => s.status === "warning").length,
    critical: sensors.filter(s => s.status === "critical").length,
    offline: sensors.filter(s => s.status === "offline").length,
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Sensores IoT</CardTitle>
              <p className="text-xs text-muted-foreground">
                {sensors.length} sensores ativos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="alerts">Com Alertas</SelectItem>
                <SelectItem value="temperature">Temperatura</SelectItem>
                <SelectItem value="pressure">Pressão</SelectItem>
                <SelectItem value="vibration">Vibração</SelectItem>
                <SelectItem value="fuel">Combustível</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={generateMockSensors}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">{statusCounts.normal} Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs text-muted-foreground">{statusCounts.warning} Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs text-muted-foreground">{statusCounts.critical} Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">{statusCounts.offline} Offline</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSensors.map((sensor, index) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.02]",
                  sensor.status === "critical" && "border-destructive/50 bg-destructive/5 animate-pulse",
                  sensor.status === "warning" && "border-warning/50 bg-warning/5",
                  sensor.status === "normal" && "border-border bg-card hover:border-primary/30",
                  sensor.status === "offline" && "border-muted/50 bg-muted/5 opacity-60"
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      sensor.status === "critical" && "bg-destructive/20 text-destructive",
                      sensor.status === "warning" && "bg-warning/20 text-warning",
                      sensor.status === "normal" && "bg-primary/20 text-primary",
                      sensor.status === "offline" && "bg-muted/20 text-muted-foreground"
                    )}>
                      {getTypeIcon(sensor.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(sensor.trend)}
                      {getStatusIcon(sensor.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate">{sensor.name}</h4>
                    
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{sensor.value}</span>
                      <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                    </div>

                    <Progress 
                      value={((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100}
                      className={cn(
                        "h-1.5",
                        sensor.status === "critical" && "[&>div]:bg-destructive",
                        sensor.status === "warning" && "[&>div]:bg-warning",
                        sensor.status === "normal" && "[&>div]:bg-success",
                      )}
                    />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{sensor.min}{sensor.unit}</span>
                      <span>{sensor.max}{sensor.unit}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className="text-[10px]">
                        {sensor.location}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(sensor.lastUpdate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Mini Sparkline */}
                  <div className="mt-3 h-8 flex items-end gap-0.5">
                    {sensor.history.map((val, i) => {
                      const height = ((val - sensor.min) / (sensor.max - sensor.min)) * 100;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 rounded-t-sm transition-all",
                            sensor.status === "critical" && "bg-red-500/60",
                            sensor.status === "warning" && "bg-amber-500/60",
                            sensor.status === "normal" && "bg-primary/60",
                            sensor.status === "offline" && "bg-slate-500/60"
                          )}
                          style={{ height: `${Math.max(10, height)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSensors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum sensor encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TelemetrySensorGrid;
