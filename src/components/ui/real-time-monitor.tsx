import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Gauge
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVesselsMonitor, useVesselStats, type SensorData, type VesselMonitor } from "@/hooks/useVesselsRealData";

const sensorIcons = {
  temperature: Thermometer,
  fuel: Droplets,
  pressure: Gauge,
  speed: Activity,
  power: Zap,
  heading: Compass
};

const statusColors = {
  normal: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
  offline: "text-muted-foreground"
};

const statusBadgeColors = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  offline: "bg-muted text-muted-foreground border-muted"
};

interface RealTimeMonitorProps {
  className?: string;
}

export const RealTimeMonitor = ({ className }: RealTimeMonitorProps) => {
  const { data: vessels = [], isLoading, refetch } = useVesselsMonitor();
  const { total, online, criticalAlerts, activeSensors } = useVesselStats();
  
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor(diff / 1000);
    
    if (minutes > 0) return `${minutes}m atrás`;
    return `${seconds}s atrás`;
  };

  const getSensorProgress = (sensor: SensorData) => {
    if (!sensor.min || !sensor.max) return 0;
    return ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Embarcações Online</p>
              <p className="text-2xl font-bold text-success">{online}/{total}</p>
            </div>
            <Wifi className="text-success" size={24} />
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alertas Críticos</p>
              <p className="text-2xl font-bold text-destructive">{criticalAlerts}</p>
            </div>
            <Activity className="text-destructive" size={24} />
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sensores Ativos</p>
              <p className="text-2xl font-bold text-primary">{activeSensors}</p>
            </div>
            <Activity className="text-primary" size={24} />
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className={cn("mr-2", isRefreshing && "animate-spin")} size={16} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vessels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma embarcação encontrada. Configure sensores no sistema.
          </div>
        ) : (
          vessels.map((vessel) => (
          <div
            key={vessel.vesselId}
            className={cn(
              "bg-card rounded-xl border transition-all duration-200 hover:shadow-wave",
              vessel.isOnline ? "border-border" : "border-danger/30",
              selectedVessel === vessel.vesselId && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedVessel(
              selectedVessel === vessel.vesselId ? null : vessel.vesselId
            )}
          >
            {/* Vessel Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{vessel.vesselName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(vessel.lastSeen)}
                  </p>
                </div>
              <div className="flex items-center space-x-2">
                  {vessel.isOnline ? (
                    <Wifi className="text-success" size={20} />
                  ) : (
                    <WifiOff className="text-destructive" size={20} />
                  )}
                  <Badge 
                    className={cn(
                      vessel.isOnline 
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {vessel.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sensors */}
            <div className="p-4 space-y-3">
              {vessel.sensors.map((sensor) => {
                const Icon = sensorIcons[sensor.type];
                const progress = getSensorProgress(sensor);
                
                return (
                  <div key={sensor.id} className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      statusBadgeColors[sensor.status]
                    )}>
                      <Icon size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {sensor.name}
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          statusColors[sensor.status]
                        )}>
                          {sensor.value} {sensor.unit}
                        </span>
                      </div>
                      
                      {sensor.min !== undefined && sensor.max !== undefined && (
                        <div className="mt-1">
                          <div className="w-full bg-accent rounded-full h-1.5">
                            <div 
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                sensor.status === "normal" && "bg-success",
                                sensor.status === "warning" && "bg-warning",
                                sensor.status === "critical" && "bg-destructive",
                                sensor.status === "offline" && "bg-muted-foreground"
                              )}
                              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
                {vessel.sensors.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum sensor disponível
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};