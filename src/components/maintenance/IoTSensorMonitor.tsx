/**
 * IoT Sensor Monitor - Real-time sensor integration for Predictive Maintenance 2.0
 * Monitors vibration, temperature, pressure, RPM from vessel equipment
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Thermometer,
  Gauge,
  Waves,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface IoTSensor {
  id: string;
  name: string;
  type: "vibration" | "temperature" | "pressure" | "rpm" | "flow" | "level";
  equipmentId: string;
  equipmentName: string;
  value: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  status: "normal" | "warning" | "critical" | "offline";
  trend: "up" | "down" | "stable";
  lastUpdate: Date;
  history: { timestamp: Date; value: number }[];
}

interface IoTSensorMonitorProps {
  vesselId?: string;
  onAnomalyDetected?: (sensor: IoTSensor, anomaly: string) => void;
}

// Simulate real-time sensor data
const generateSensorData = (): IoTSensor[] => [
  {
    id: "vib-me1",
    name: "Vibração Motor Principal BB",
    type: "vibration",
    equipmentId: "601.0001.01",
    equipmentName: "Motor Principal BB",
    value: 2.4 + Math.random() * 0.8,
    unit: "mm/s",
    minThreshold: 0,
    maxThreshold: 4.5,
    status: "normal",
    trend: "stable",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 2.2 + Math.random() * 0.6
    }))
  },
  {
    id: "temp-me1",
    name: "Temperatura Motor Principal BB",
    type: "temperature",
    equipmentId: "601.0001.01",
    equipmentName: "Motor Principal BB",
    value: 78 + Math.random() * 8,
    unit: "°C",
    minThreshold: 40,
    maxThreshold: 95,
    status: "normal",
    trend: "up",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 75 + Math.random() * 10
    }))
  },
  {
    id: "press-hyd1",
    name: "Pressão Sistema Hidráulico",
    type: "pressure",
    equipmentId: "603.0004.02",
    equipmentName: "Bomba Hidráulica Popa",
    value: 185 + Math.random() * 30,
    unit: "bar",
    minThreshold: 150,
    maxThreshold: 250,
    status: Math.random() > 0.7 ? "warning" : "normal",
    trend: "down",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 195 + Math.random() * 25
    }))
  },
  {
    id: "rpm-gen1",
    name: "RPM Gerador 1",
    type: "rpm",
    equipmentId: "604.0002.01",
    equipmentName: "Gerador Diesel 1",
    value: 1500 + Math.random() * 20,
    unit: "RPM",
    minThreshold: 1450,
    maxThreshold: 1550,
    status: "normal",
    trend: "stable",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 1498 + Math.random() * 15
    }))
  },
  {
    id: "vib-thr1",
    name: "Vibração Thruster Bow",
    type: "vibration",
    equipmentId: "602.0003.01",
    equipmentName: "Thruster de Proa",
    value: 1.8 + Math.random() * 2.5,
    unit: "mm/s",
    minThreshold: 0,
    maxThreshold: 4.0,
    status: Math.random() > 0.6 ? "warning" : "normal",
    trend: "up",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 1.5 + Math.random() * 2
    }))
  },
  {
    id: "temp-exc1",
    name: "Temperatura Exaustão",
    type: "temperature",
    equipmentId: "601.0001.01",
    equipmentName: "Motor Principal BB",
    value: 380 + Math.random() * 50,
    unit: "°C",
    minThreshold: 300,
    maxThreshold: 450,
    status: Math.random() > 0.8 ? "critical" : "normal",
    trend: "up",
    lastUpdate: new Date(),
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000),
      value: 370 + Math.random() * 60
    }))
  }
];

export function IoTSensorMonitor({ vesselId, onAnomalyDetected }: IoTSensorMonitorProps) {
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Simulate real-time updates
  useEffect(() => {
    setSensors(generateSensorData());
    
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => ({
        ...sensor,
        value: sensor.value + (Math.random() - 0.5) * (sensor.maxThreshold - sensor.minThreshold) * 0.05,
        lastUpdate: new Date(),
        status: determineStatus(sensor),
        history: [...sensor.history.slice(1), { timestamp: new Date(), value: sensor.value }]
      })));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const determineStatus = (sensor: IoTSensor): "normal" | "warning" | "critical" | "offline" => {
    const range = sensor.maxThreshold - sensor.minThreshold;
    const warningThreshold = sensor.maxThreshold - range * 0.2;
    const criticalThreshold = sensor.maxThreshold - range * 0.1;
    
    if (sensor.value >= criticalThreshold) return "critical";
    if (sensor.value >= warningThreshold) return "warning";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-red-500 bg-red-500/10";
      case "warning": return "text-yellow-500 bg-yellow-500/10";
      case "offline": return "text-gray-500 bg-gray-500/10";
      default: return "text-green-500 bg-green-500/10";
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "vibration": return <Waves className="h-4 w-4" />;
      case "temperature": return <Thermometer className="h-4 w-4" />;
      case "pressure": return <Gauge className="h-4 w-4" />;
      case "rpm": return <Activity className="h-4 w-4" />;
      default: return <Radio className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3 text-orange-500" />;
      case "down": return <TrendingDown className="h-3 w-3 text-blue-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const criticalCount = sensors.filter(s => s.status === "critical").length;
  const warningCount = sensors.filter(s => s.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-info/20 to-primary/20 rounded-xl">
            <Radio className="h-6 w-6 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Monitor IoT Sensores
              {isConnected ? (
                <Badge className="bg-success/20 text-success">
                  <Wifi className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitoramento em tempo real • {sensors.length} sensores ativos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSensors(generateSensorData())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex gap-4">
          {criticalCount > 0 && (
            <Card className="border-destructive/50 bg-destructive/10 flex-1">
              <CardContent className="py-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">{criticalCount} sensor(es) em estado crítico</span>
              </CardContent>
            </Card>
          )}
          {warningCount > 0 && (
            <Card className="border-warning/50 bg-warning/10 flex-1">
              <CardContent className="py-3 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span className="font-medium text-warning">{warningCount} sensor(es) em alerta</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => (
          <Card
            key={sensor.id}
            className={`cursor-pointer hover:shadow-lg transition-all ${
              sensor.status === "critical" ? "border-red-500/50" :
              sensor.status === "warning" ? "border-yellow-500/50" : ""
            }`}
            onClick={() => setSelectedSensor(sensor)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getStatusColor(sensor.status)}`}>
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{sensor.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{sensor.equipmentName}</p>
                  </div>
                </div>
                {getTrendIcon(sensor.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">{sensor.value.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                </div>
                <Progress
                  value={(sensor.value / sensor.maxThreshold) * 100}
                  className={`h-2 ${
                    sensor.status === "critical" ? "[&>div]:bg-red-500" :
                    sensor.status === "warning" ? "[&>div]:bg-yellow-500" :
                    "[&>div]:bg-green-500"
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{sensor.minThreshold} {sensor.unit}</span>
                  <span>{sensor.maxThreshold} {sensor.unit}</span>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sensor.history.slice(-12)}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={sensor.status === "critical" ? "#ef4444" : sensor.status === "warning" ? "#eab308" : "#22c55e"}
                        fill={sensor.status === "critical" ? "#ef444420" : sensor.status === "warning" ? "#eab30820" : "#22c55e20"}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sensor Detail Modal */}
      {selectedSensor && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getSensorIcon(selectedSensor.type)}
                {selectedSensor.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSensor(null)}>
                ✕
              </Button>
            </div>
            <CardDescription>
              Equipamento: {selectedSensor.equipmentName} ({selectedSensor.equipmentId})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedSensor.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(val) => new Date(val).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  />
                  <YAxis domain={[selectedSensor.minThreshold, selectedSensor.maxThreshold]} />
                  <Tooltip
                    labelFormatter={(val) => new Date(val).toLocaleString("pt-BR")}
                    formatter={(val: number) => [`${val.toFixed(2)} ${selectedSensor.unit}`, "Valor"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default IoTSensorMonitor;
