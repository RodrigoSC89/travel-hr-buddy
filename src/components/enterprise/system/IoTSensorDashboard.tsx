/**
 * IoT Sensor Dashboard Component
 * Sensores em tempo real, alertas de threshold, histórico
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Thermometer, Droplets, Wind, Gauge,
  Zap, AlertTriangle, CheckCircle2, RefreshCw,
  Ship, Waves, Compass, Battery, Wifi, Signal
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Sensor {
  id: string;
  name: string;
  type: string;
  vessel: string;
  location: string;
  value: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  status: "normal" | "warning" | "critical" | "offline";
  lastUpdate: string;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
}

const sensors: Sensor[] = [
  {
    id: "1",
    name: "Engine Room Temp",
    type: "Temperature",
    vessel: "MV Atlantic Star",
    location: "Engine Room - Main",
    value: 72,
    unit: "°C",
    minThreshold: 20,
    maxThreshold: 85,
    status: "normal",
    lastUpdate: "2024-02-05T14:32:00",
    trend: "stable",
    icon: Thermometer
  },
  {
    id: "2",
    name: "Fuel Tank Level",
    type: "Level",
    vessel: "MV Atlantic Star",
    location: "Tank 1 - Port",
    value: 45,
    unit: "%",
    minThreshold: 20,
    maxThreshold: 100,
    status: "warning",
    lastUpdate: "2024-02-05T14:32:00",
    trend: "down",
    icon: Droplets
  },
  {
    id: "3",
    name: "Wind Speed",
    type: "Weather",
    vessel: "MV Atlantic Star",
    location: "Bridge - Anemometer",
    value: 28,
    unit: "kts",
    minThreshold: 0,
    maxThreshold: 50,
    status: "normal",
    lastUpdate: "2024-02-05T14:32:00",
    trend: "up",
    icon: Wind
  },
  {
    id: "4",
    name: "Main Engine RPM",
    type: "Engine",
    vessel: "MV Pacific Dream",
    location: "Engine Room",
    value: 125,
    unit: "RPM",
    minThreshold: 50,
    maxThreshold: 180,
    status: "normal",
    lastUpdate: "2024-02-05T14:31:00",
    trend: "stable",
    icon: Gauge
  },
  {
    id: "5",
    name: "Generator Load",
    type: "Power",
    vessel: "MV Pacific Dream",
    location: "Generator Room",
    value: 92,
    unit: "%",
    minThreshold: 0,
    maxThreshold: 95,
    status: "critical",
    lastUpdate: "2024-02-05T14:32:00",
    trend: "up",
    icon: Zap
  },
  {
    id: "6",
    name: "Sea Water Temp",
    type: "Temperature",
    vessel: "MV Nordic Wind",
    location: "Hull Sensor",
    value: 18,
    unit: "°C",
    minThreshold: -2,
    maxThreshold: 35,
    status: "normal",
    lastUpdate: "2024-02-05T14:30:00",
    trend: "stable",
    icon: Waves
  },
  {
    id: "7",
    name: "GPS Signal",
    type: "Navigation",
    vessel: "MV Nordic Wind",
    location: "Bridge",
    value: 98,
    unit: "%",
    minThreshold: 80,
    maxThreshold: 100,
    status: "normal",
    lastUpdate: "2024-02-05T14:32:00",
    trend: "stable",
    icon: Signal
  },
  {
    id: "8",
    name: "Battery Bank",
    type: "Power",
    vessel: "MV Southern Cross",
    location: "Battery Room",
    value: 15,
    unit: "%",
    minThreshold: 20,
    maxThreshold: 100,
    status: "critical",
    lastUpdate: "2024-02-05T14:28:00",
    trend: "down",
    icon: Battery
  }
];

const historicalData = [
  { time: "14:00", temp: 68, fuel: 52, power: 78 },
  { time: "14:05", temp: 69, fuel: 51, power: 82 },
  { time: "14:10", temp: 70, fuel: 50, power: 85 },
  { time: "14:15", temp: 71, fuel: 49, power: 88 },
  { time: "14:20", temp: 72, fuel: 47, power: 90 },
  { time: "14:25", temp: 71, fuel: 46, power: 91 },
  { time: "14:30", temp: 72, fuel: 45, power: 92 }
];

const alerts = [
  { id: "1", sensor: "Generator Load", message: "Carga acima de 90% - risco de sobrecarga", severity: "critical", time: "14:32" },
  { id: "2", sensor: "Battery Bank", message: "Nível de bateria crítico - 15%", severity: "critical", time: "14:28" },
  { id: "3", sensor: "Fuel Tank Level", message: "Nível de combustível abaixo de 50%", severity: "warning", time: "14:20" },
  { id: "4", sensor: "Wind Speed", message: "Velocidade do vento aumentando", severity: "info", time: "14:15" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "normal": return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
    case "warning": return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning";
    case "critical": return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
    case "offline": return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getValuePosition = (value: number, min: number, max: number) => {
  return ((value - min) / (max - min)) * 100;
};

export function IoTSensorDashboard() {
  const [selectedVessel, setSelectedVessel] = useState("all");

  const vessels = [...new Set(sensors.map(s => s.vessel))];
  const filteredSensors = selectedVessel === "all" 
    ? sensors 
    : sensors.filter(s => s.vessel === selectedVessel);

  const stats = {
    total: sensors.length,
    normal: sensors.filter(s => s.status === "normal").length,
    warning: sensors.filter(s => s.status === "warning").length,
    critical: sensors.filter(s => s.status === "critical").length
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sensores Ativos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Em 4 embarcações</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400">Normal</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">{stats.normal}</p>
                <Progress value={(stats.normal / stats.total) * 100} className="h-2 mt-2" />
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Atenção</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{stats.warning}</p>
                <p className="text-xs text-yellow-600">Monitorar</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">Crítico</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">{stats.critical}</p>
                <p className="text-xs text-red-600">Ação imediata</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sensores em Tempo Real
              </CardTitle>
              <div className="flex gap-2">
                <select 
                  className="px-3 py-1.5 text-sm border rounded-md bg-background"
                  value={selectedVessel}
                  onChange={(e) => setSelectedVessel(e.target.value)}
                >
                  <option value="all">Todas Embarcações</option>
                  {vessels.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSensors.map((sensor) => {
                const Icon = sensor.icon;
                const valuePosition = getValuePosition(sensor.value, sensor.minThreshold, sensor.maxThreshold);
                
                return (
                  <div
                    key={sensor.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      sensor.status === "critical" ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" :
                      sensor.status === "warning" ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20" :
                      "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          sensor.status === "critical" ? "bg-red-100" :
                          sensor.status === "warning" ? "bg-yellow-100" :
                          "bg-primary/10"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            sensor.status === "critical" ? "text-red-600" :
                            sensor.status === "warning" ? "text-yellow-600" :
                            "text-primary"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sensor.name}</p>
                          <p className="text-xs text-muted-foreground">{sensor.location}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(sensor.status)} variant="secondary">
                        {sensor.status === "normal" ? "Normal" :
                         sensor.status === "warning" ? "Atenção" :
                         sensor.status === "critical" ? "Crítico" : "Offline"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <span className="text-3xl font-bold">{sensor.value}</span>
                        <span className="text-lg text-muted-foreground ml-1">{sensor.unit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Wifi className="h-3 w-3" />
                        {new Date(sensor.lastUpdate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Gauge Bar */}
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`absolute h-full rounded-full transition-all ${
                          sensor.status === "critical" ? "bg-red-500" :
                          sensor.status === "warning" ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(valuePosition, 100)}%` }}
                      />
                      {/* Threshold markers */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-red-600"
                        style={{ left: `${(sensor.maxThreshold / (sensor.maxThreshold * 1.2)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{sensor.minThreshold}{sensor.unit}</span>
                      <span>{sensor.maxThreshold}{sensor.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${
                  alert.severity === "critical" ? "border-red-300 bg-red-50 dark:bg-red-950/20" :
                  alert.severity === "warning" ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20" :
                  "border-blue-300 bg-blue-50 dark:bg-blue-950/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === "critical" ? "text-red-600" :
                      alert.severity === "warning" ? "text-yellow-600" :
                      "text-blue-600"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{alert.sensor}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">Ver Todos os Alertas</Button>
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Leituras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="Temperatura (°C)" />
                <Area type="monotone" dataKey="fuel" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Combustível (%)" />
                <Area type="monotone" dataKey="power" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Carga (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default IoTSensorDashboard;
