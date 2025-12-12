/**
 * Digital Twin - Real-time 3D vessel visualization with telemetry
 * PATCH 549 - Advanced Maritime Intelligence
 */

import { useEffect, useRef, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Ship,
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  Wind,
  AlertTriangle,
  Activity,
  Settings,
  RefreshCw,
  Maximize2,
  Waves,
  Anchor,
  Navigation,
  Fuel,
  Battery,
  CircleDot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemStatus {
  id: string;
  name: string;
  type: "propulsion" | "electrical" | "hydraulic" | "navigation" | "safety";
  status: "operational" | "warning" | "critical" | "offline";
  health: number;
  temperature?: number;
  pressure?: number;
  rpm?: number;
  voltage?: number;
  current?: number;
  fuelRate?: number;
  lastUpdate: Date;
}

interface TelemetryData {
  timestamp: Date;
  systems: SystemStatus[];
  vessel: {
    heading: number;
    speed: number;
    position: { lat: number; lng: number };
    draft: number;
    trim: number;
    heel: number;
  };
  environment: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    seaState: number;
    visibility: number;
  };
  dp: {
    mode: string;
    status: "active" | "standby" | "off";
    alertLevel: number;
    thrusterUtilization: number[];
  };
}

// Simulated real-time telemetry
const generateTelemetry = (): TelemetryData => ({
  timestamp: new Date(),
  systems: [
    {
      id: "me1",
      name: "Main Engine Port",
      type: "propulsion",
      status: "operational",
      health: 94,
      temperature: 78 + Math.random() * 5,
      rpm: 720 + Math.random() * 30,
      fuelRate: 245 + Math.random() * 20,
      lastUpdate: new Date()
    },
    {
      id: "me2",
      name: "Main Engine Starboard",
      type: "propulsion",
      status: "operational",
      health: 91,
      temperature: 76 + Math.random() * 5,
      rpm: 715 + Math.random() * 30,
      fuelRate: 238 + Math.random() * 20,
      lastUpdate: new Date()
    },
    {
      id: "gen1",
      name: "Generator #1",
      type: "electrical",
      status: "operational",
      health: 97,
      voltage: 440 + Math.random() * 5,
      current: 850 + Math.random() * 50,
      temperature: 65 + Math.random() * 3,
      lastUpdate: new Date()
    },
    {
      id: "gen2",
      name: "Generator #2",
      type: "electrical",
      status: "warning",
      health: 78,
      voltage: 438 + Math.random() * 5,
      current: 820 + Math.random() * 50,
      temperature: 72 + Math.random() * 5,
      lastUpdate: new Date()
    },
    {
      id: "thruster1",
      name: "Bow Thruster",
      type: "propulsion",
      status: "operational",
      health: 89,
      rpm: 180 + Math.random() * 20,
      pressure: 280 + Math.random() * 10,
      lastUpdate: new Date()
    },
    {
      id: "thruster2",
      name: "Stern Thruster",
      type: "propulsion",
      status: "operational",
      health: 92,
      rpm: 175 + Math.random() * 20,
      pressure: 275 + Math.random() * 10,
      lastUpdate: new Date()
    },
    {
      id: "hpu1",
      name: "HPU Main",
      type: "hydraulic",
      status: "operational",
      health: 95,
      pressure: 210 + Math.random() * 5,
      temperature: 55 + Math.random() * 3,
      lastUpdate: new Date()
    },
    {
      id: "nav1",
      name: "Navigation System",
      type: "navigation",
      status: "operational",
      health: 100,
      lastUpdate: new Date()
    }
  ],
  vessel: {
    heading: 125 + Math.random() * 2,
    speed: 8.5 + Math.random() * 0.5,
    position: { lat: -22.9068 + Math.random() * 0.001, lng: -43.1729 + Math.random() * 0.001 },
    draft: 6.2,
    trim: 0.3 + Math.random() * 0.1,
    heel: 1.2 + Math.random() * 0.5
  },
  environment: {
    windSpeed: 18 + Math.random() * 5,
    windDirection: 45 + Math.random() * 10,
    waveHeight: 1.8 + Math.random() * 0.3,
    seaState: 4,
    visibility: 8 + Math.random() * 2
  },
  dp: {
    mode: "AUTO",
    status: "active",
    alertLevel: 1,
    thrusterUtilization: [65, 72, 58, 45]
  }
});

const SystemCard = ({ system }: { system: SystemStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "operational": return "bg-green-500";
    case "warning": return "bg-yellow-500";
    case "critical": return "bg-red-500";
    case "offline": return "bg-gray-500";
    default: return "bg-gray-500";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
    case "propulsion": return <Ship className="h-4 w-4" />;
    case "electrical": return <Zap className="h-4 w-4" />;
    case "hydraulic": return <Droplets className="h-4 w-4" />;
    case "navigation": return <Navigation className="h-4 w-4" />;
    case "safety": return <AlertTriangle className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcon(system.type)}
            <span className="text-sm font-medium">{system.name}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(system.status)} animate-pulse`} />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Health</span>
            <span className={system.health < 80 ? "text-yellow-500" : "text-green-500"}>
              {system.health}%
            </span>
          </div>
          <Progress value={system.health} className="h-1" />
          
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {system.temperature && (
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-red-400" />
                <span>{system.temperature.toFixed(1)}°C</span>
              </div>
            )}
            {system.rpm && (
              <div className="flex items-center gap-1">
                <Gauge className="h-3 w-3 text-blue-400" />
                <span>{system.rpm.toFixed(0)} RPM</span>
              </div>
            )}
            {system.voltage && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span>{system.voltage.toFixed(0)}V</span>
              </div>
            )}
            {system.pressure && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-purple-400" />
                <span>{system.pressure.toFixed(0)} bar</span>
              </div>
            )}
            {system.fuelRate && (
              <div className="flex items-center gap-1">
                <Fuel className="h-3 w-3 text-orange-400" />
                <span>{system.fuelRate.toFixed(0)} L/h</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VesselVisualization = ({ telemetry }: { telemetry: TelemetryData }) => {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-background to-muted/30 rounded-lg border overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Vessel representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-48 h-96 transition-transform duration-1000"
          style={{ transform: `rotate(${telemetry.vessel.heel}deg)` }}
        >
          {/* Ship outline */}
          <svg viewBox="0 0 100 200" className="w-full h-full">
            <defs>
              <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Hull */}
            <path 
              d="M 50 10 L 80 50 L 85 150 L 70 190 L 30 190 L 15 150 L 20 50 Z" 
              fill="url(#shipGradient)" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2"
            />
            {/* Bridge */}
            <rect x="35" y="60" width="30" height="25" fill="hsl(var(--muted))" stroke="hsl(var(--border))" />
            {/* Bow thruster indicator */}
            <circle 
              cx="50" cy="35" r="8" 
              fill={telemetry.dp.thrusterUtilization[0] > 50 ? "hsl(var(--chart-1))" : "hsl(var(--muted))"} 
              opacity={telemetry.dp.thrusterUtilization[0] / 100}
            />
            {/* Stern thruster indicator */}
            <circle 
              cx="50" cy="175" r="8" 
              fill={telemetry.dp.thrusterUtilization[1] > 50 ? "hsl(var(--chart-2))" : "hsl(var(--muted))"} 
              opacity={telemetry.dp.thrusterUtilization[1] / 100}
            />
            {/* Port engine */}
            <rect 
              x="22" y="140" width="12" height="20" rx="2"
              fill={telemetry.systems[0].status === "operational" ? "hsl(var(--chart-3))" : "hsl(var(--destructive))"}
            />
            {/* Starboard engine */}
            <rect 
              x="66" y="140" width="12" height="20" rx="2"
              fill={telemetry.systems[1].status === "operational" ? "hsl(var(--chart-3))" : "hsl(var(--destructive))"}
            />
          </svg>

          {/* System status indicators */}
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 flex gap-1">
            {telemetry.systems.slice(2, 4).map((sys, i) => (
              <div
                key={sys.id}
                className={`w-3 h-3 rounded-full ${
                  sys.status === "operational" ? "bg-green-500" :
                    sys.status === "warning" ? "bg-yellow-500 animate-pulse" :
                      "bg-red-500 animate-pulse"
                }`}
                title={sys.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heading indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <Navigation className="h-6 w-6 text-primary" style={{ transform: `rotate(${telemetry.vessel.heading}deg)` }} />
        <span className="text-xs font-mono mt-1">{telemetry.vessel.heading.toFixed(1)}°</span>
      </div>

      {/* Speed indicator */}
      <div className="absolute bottom-4 left-4 bg-background/80 rounded-lg p-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-sm font-mono">{telemetry.vessel.speed.toFixed(1)} kts</span>
        </div>
      </div>

      {/* DP Status */}
      <div className="absolute top-4 right-4 bg-background/80 rounded-lg p-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <Anchor className={`h-4 w-4 ${telemetry.dp.status === "active" ? "text-green-500" : "text-muted-foreground"}`} />
          <span className="text-sm">DP {telemetry.dp.mode}</span>
          <Badge variant={telemetry.dp.alertLevel <= 1 ? "outline" : "destructive"} className="text-xs">
            AL{telemetry.dp.alertLevel}
          </Badge>
        </div>
      </div>

      {/* Environment info */}
      <div className="absolute bottom-4 right-4 bg-background/80 rounded-lg p-2 backdrop-blur">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3" />
            <span>{telemetry.environment.windSpeed.toFixed(0)} kts</span>
          </div>
          <div className="flex items-center gap-1">
            <Waves className="h-3 w-3" />
            <span>{telemetry.environment.waveHeight.toFixed(1)}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DigitalTwin() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(generateTelemetry());
  const [isLive, setIsLive] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<SystemStatus | null>(null);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        setTelemetry(generateTelemetry());
      }, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive]);

  const getOverallHealth = () => {
    const avg = telemetry.systems.reduce((acc, sys) => acc + sys.health, 0) / telemetry.systems.length;
    return avg;
  };

  const criticalSystems = telemetry.systems.filter(s => s.status === "critical" || s.status === "warning");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Ship className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Digital Twin - PSV Marítimo One</h3>
            <p className="text-xs text-muted-foreground">
              Telemetria em tempo real • {telemetry.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <CircleDot className="h-4 w-4 mr-1 animate-pulse text-red-500" />
                LIVE
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Paused
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {criticalSystems.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {criticalSystems.length} sistema(s) requerem atenção
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalSystems.map(sys => (
                <Badge key={sys.id} variant="outline" className="text-yellow-600">
                  {sys.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vessel visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Visualização 3D</CardTitle>
                <Badge variant="outline">
                  Health: {getOverallHealth().toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <VesselVisualization telemetry={telemetry} />
            </CardContent>
          </Card>
        </div>

        {/* Systems panel */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sistemas</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                  <TabsTrigger value="propulsion" className="text-xs">Propulsão</TabsTrigger>
                  <TabsTrigger value="electrical" className="text-xs">Elétrico</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[380px] mt-3">
                  <TabsContent value="all" className="mt-0 space-y-2">
                    {telemetry.systems.map(system => (
                      <SystemCard key={system.id} system={system} />
                    ))}
                  </TabsContent>
                  <TabsContent value="propulsion" className="mt-0 space-y-2">
                    {telemetry.systems
                      .filter(s => s.type === "propulsion")
                      .map(system => (
                        <SystemCard key={system.id} system={system} />
                      ))}
                  </TabsContent>
                  <TabsContent value="electrical" className="mt-0 space-y-2">
                    {telemetry.systems
                      .filter(s => s.type === "electrical")
                      .map(system => (
                        <SystemCard key={system.id} system={system} />
                      ))}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Consumo Total</p>
                <p className="text-lg font-semibold">
                  {(telemetry.systems[0].fuelRate! + telemetry.systems[1].fuelRate!).toFixed(0)} L/h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Carga Elétrica</p>
                <p className="text-lg font-semibold">
                  {((telemetry.systems[2].current! + telemetry.systems[3].current!) / 20).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Anchor className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">DP Utilização</p>
                <p className="text-lg font-semibold">
                  {(telemetry.dp.thrusterUtilization.reduce((a, b) => a + b, 0) / 4).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-xs text-muted-foreground">Sea State</p>
                <p className="text-lg font-semibold">{telemetry.environment.seaState}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
