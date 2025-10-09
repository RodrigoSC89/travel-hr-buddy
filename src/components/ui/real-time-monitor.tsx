import React, { useState, useEffect } from "react";
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

interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "fuel" | "pressure" | "speed" | "power" | "heading";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical" | "offline";
  lastUpdate: Date;
  min?: number;
  max?: number;
  target?: number;
}

interface VesselMonitor {
  vesselId: string;
  vesselName: string;
  isOnline: boolean;
  lastSeen: Date;
  sensors: SensorData[];
}

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
  critical: "text-danger",
  offline: "text-muted-foreground"
};

const statusBadgeColors = {
  normal: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-danger/10 text-danger border-danger/20",
  offline: "bg-muted text-muted-foreground border-muted"
};

// Mock data para demonstração
const mockVessels: VesselMonitor[] = [
  {
    vesselId: "atlantida",
    vesselName: "Atlântida",
    isOnline: true,
    lastSeen: new Date(),
    sensors: [
      {
        id: "temp_engine",
        name: "Temperatura Motor",
        type: "temperature",
        value: 87.5,
        unit: "°C",
        status: "normal",
        lastUpdate: new Date(),
        min: 70,
        max: 95,
        target: 85
      },
      {
        id: "fuel_level",
        name: "Nível Combustível",
        type: "fuel",
        value: 15.2,
        unit: "%",
        status: "critical",
        lastUpdate: new Date(),
        min: 0,
        max: 100,
        target: 50
      },
      {
        id: "speed",
        name: "Velocidade",
        type: "speed",
        value: 12.8,
        unit: "kts",
        status: "normal",
        lastUpdate: new Date()
      },
      {
        id: "heading",
        name: "Rumo",
        type: "heading",
        value: 285,
        unit: "°",
        status: "normal",
        lastUpdate: new Date()
      }
    ]
  },
  {
    vesselId: "pacifico",
    vesselName: "Pacífico",
    isOnline: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    sensors: [
      {
        id: "dp_power",
        name: "Potência DP",
        type: "power",
        value: 1250,
        unit: "kW",
        status: "warning",
        lastUpdate: new Date(),
        min: 0,
        max: 2000,
        target: 1500
      },
      {
        id: "fuel_level",
        name: "Nível Combustível",
        type: "fuel",
        value: 78.5,
        unit: "%",
        status: "normal",
        lastUpdate: new Date()
      }
    ]
  },
  {
    vesselId: "artico",
    vesselName: "Ártico",
    isOnline: false,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    sensors: [
      {
        id: "dp_offline",
        name: "Sistema DP",
        type: "power",
        value: 0,
        unit: "kW",
        status: "offline",
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]
  }
];

interface RealTimeMonitorProps {
  className?: string;
}

export const RealTimeMonitor = ({ className }: RealTimeMonitorProps) => {
  const [vessels, setVessels] = useState<VesselMonitor[]>(mockVessels);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simular updates em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setVessels(prev => prev.map(vessel => {
        if (!vessel.isOnline) return vessel;
        
        return {
          ...vessel,
          lastSeen: new Date(),
          sensors: vessel.sensors.map(sensor => {
            // Se sensor está offline, manter como está
            if (sensor.status === "offline") {
              return sensor;
            }
            
            // Simular variação nos valores
            let newValue = sensor.value;
            const variation = (Math.random() - 0.5) * 2; // -1 a +1
            
            switch (sensor.type) {
            case "temperature":
              newValue = Math.max(70, Math.min(100, sensor.value + variation));
              break;
            case "fuel":
              newValue = Math.max(0, Math.min(100, sensor.value + variation * 0.1));
              break;
            case "speed":
              newValue = Math.max(0, Math.min(20, sensor.value + variation * 0.5));
              break;
            case "power":
              newValue = Math.max(0, Math.min(2000, sensor.value + variation * 50));
              break;
            case "heading":
              newValue = (sensor.value + variation * 2 + 360) % 360;
              break;
            }
            
            // Determinar novo status baseado no valor
            let newStatus: SensorData["status"] = "normal";
            if (sensor.type === "fuel" && newValue < 20) {
              newStatus = "critical";
            } else if (sensor.type === "fuel" && newValue < 30) {
              newStatus = "warning";
            } else if (sensor.type === "temperature" && (newValue > 95 || newValue < 70)) {
              newStatus = "critical";
            } else if (sensor.type === "temperature" && newValue > 90) {
              newStatus = "warning";
            } else {
              newStatus = "normal";
            }
            
            return {
              ...sensor,
              value: Number(newValue.toFixed(1)),
              status: newStatus,
              lastUpdate: new Date()
            };
          })
        };
      }));
    }, 3000); // Update a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular delay de refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  const onlineVessels = vessels.filter(v => v.isOnline).length;
  const criticalAlerts = vessels.reduce((count, vessel) => 
    count + vessel.sensors.filter(s => s.status === "critical").length, 0
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Embarcações Online</p>
              <p className="text-2xl font-bold text-success">{onlineVessels}/{vessels.length}</p>
            </div>
            <Wifi className="text-success" size={24} />
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alertas Críticos</p>
              <p className="text-2xl font-bold text-danger">{criticalAlerts}</p>
            </div>
            <Activity className="text-danger" size={24} />
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sensores Ativos</p>
              <p className="text-2xl font-bold text-primary">
                {vessels.reduce((count, vessel) => 
                  count + vessel.sensors.filter(s => s.status !== "offline").length, 0
                )}
              </p>
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
        {vessels.map((vessel) => (
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
                    <WifiOff className="text-danger" size={20} />
                  )}
                  <Badge 
                    className={cn(
                      vessel.isOnline 
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-danger/10 text-danger border-danger/20"
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
                                sensor.status === "critical" && "bg-danger",
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
        ))}
      </div>
    </div>
  );
};