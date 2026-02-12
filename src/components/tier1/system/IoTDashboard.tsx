/**
 * IoT Dashboard - Tier-1
 * Benchmark: AWS IoT + Azure IoT Hub + Nautical Systems
 * Features:
 * - Real-time sensor data visualization
 * - Equipment monitoring & alerts
 * - Telemetry data streams
 * - Predictive maintenance triggers
 * - MQTT integration status
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Thermometer, Gauge, Zap, Droplet, Wind,
  AlertTriangle, CheckCircle, Wifi, WifiOff, RefreshCw,
  BarChart3, Settings, Radio, Sparkles, Cpu
} from "lucide-react";

interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "pressure" | "fuel" | "vibration" | "humidity";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  location: string;
  lastUpdate: string;
  trend: "up" | "down" | "stable";
}

export default function IoTDashboard() {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // Sample sensor data
  const sensors: SensorData[] = [
    { id: "1", name: "Main Engine Temp", type: "temperature", value: 85, unit: "°C", status: "normal", location: "Engine Room", lastUpdate: "2s ago", trend: "stable" },
    { id: "2", name: "Aux Engine Temp", type: "temperature", value: 72, unit: "°C", status: "normal", location: "Engine Room", lastUpdate: "2s ago", trend: "up" },
    { id: "3", name: "Lube Oil Pressure", type: "pressure", value: 4.2, unit: "bar", status: "normal", location: "Engine Room", lastUpdate: "1s ago", trend: "stable" },
    { id: "4", name: "Fuel Level Tank 1", type: "fuel", value: 78, unit: "%", status: "normal", location: "Tank Deck", lastUpdate: "5s ago", trend: "down" },
    { id: "5", name: "Fuel Level Tank 2", type: "fuel", value: 45, unit: "%", status: "warning", location: "Tank Deck", lastUpdate: "5s ago", trend: "down" },
    { id: "6", name: "Main Engine Vibration", type: "vibration", value: 2.4, unit: "mm/s", status: "normal", location: "Engine Room", lastUpdate: "1s ago", trend: "stable" },
    { id: "7", name: "Bridge Humidity", type: "humidity", value: 65, unit: "%", status: "normal", location: "Bridge", lastUpdate: "10s ago", trend: "stable" },
    { id: "8", name: "Exhaust Gas Temp", type: "temperature", value: 320, unit: "°C", status: "warning", location: "Funnel", lastUpdate: "2s ago", trend: "up" },
  ];

  // KPIs
  const kpis = {
    totalSensors: sensors.length,
    online: sensors.length,
    warnings: sensors.filter(s => s.status === "warning").length,
    critical: sensors.filter(s => s.status === "critical").length,
    dataPoints: "1.2M/day",
    mqttStatus: "connected"
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="h-4 w-4" />;
      case "pressure": return <Gauge className="h-4 w-4" />;
      case "fuel": return <Droplet className="h-4 w-4" />;
      case "vibration": return <Activity className="h-4 w-4" />;
      case "humidity": return <Wind className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-success";
      case "warning": return "bg-warning";
      case "critical": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↑";
      case "down": return "↓";
      default: return "→";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Radio className="h-7 w-7 text-cyan-500" />
            IoT Dashboard
          </h2>
          <p className="text-muted-foreground">Real-time sensor monitoring & telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success gap-1">
            <Wifi className="h-3 w-3" />
            MQTT Connected
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Sparkles className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">AI Predictive Alert</h3>
              <p className="text-sm text-muted-foreground">
                Exhaust Gas Temperature trending 8% above baseline. Recommend inspection within 48 hours to prevent potential issues.
              </p>
            </div>
            <Button variant="outline" size="sm">Schedule Inspection</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Radio className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.totalSensors}</p>
            <p className="text-xs text-muted-foreground">Total Sensors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <Wifi className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.online}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.warnings}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${kpis.critical > 0 ? "from-destructive/10 to-destructive/5 border-destructive/20" : "from-success/10 to-success/5 border-success/20"}`}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`h-5 w-5 mx-auto mb-2 ${kpis.critical > 0 ? "text-destructive" : "text-success"}`} />
            <p className="text-2xl font-bold">{kpis.critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.dataPoints}</p>
            <p className="text-xs text-muted-foreground">Data Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">Real-time</p>
            <p className="text-xs text-muted-foreground">Data Stream</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sensors">Live Sensors</TabsTrigger>
          <TabsTrigger value="engine">Engine Room</TabsTrigger>
          <TabsTrigger value="fuel">Fuel System</TabsTrigger>
          <TabsTrigger value="alerts">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Live Sensor Data
                  </CardTitle>
                  <CardDescription>Real-time readings from all sensors</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sensors.map((sensor) => (
                  <Card
                    key={sensor.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedSensor === sensor.id ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                    onClick={() => setSelectedSensor(sensor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getSensorIcon(sensor.type)}
                        </div>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(sensor.status)} animate-pulse`} />
                      </div>
                      <h4 className="font-medium text-sm mb-1">{sensor.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{sensor.location}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold">
                          {sensor.value}
                          <span className="text-sm font-normal text-muted-foreground ml-1">{sensor.unit}</span>
                        </p>
                        <span className="text-lg">{getTrendIcon(sensor.trend)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Updated {sensor.lastUpdate}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Engine Room Monitoring
              </CardTitle>
              <CardDescription>Critical engine parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sensors.filter(s => s.location === "Engine Room").map((sensor) => (
                  <Card key={sensor.id} className={`border-l-4 ${getStatusColor(sensor.status).replace("bg-", "border-l-")}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getSensorIcon(sensor.type)}
                        <span className="font-medium">{sensor.name}</span>
                      </div>
                      <p className="text-3xl font-bold">
                        {sensor.value}
                        <span className="text-sm font-normal text-muted-foreground ml-1">{sensor.unit}</span>
                      </p>
                      <Progress value={sensor.type === "temperature" ? (sensor.value / 400) * 100 : sensor.value} className="mt-3 h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                Fuel System Monitoring
              </CardTitle>
              <CardDescription>Tank levels and consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sensors.filter(s => s.type === "fuel").map((sensor) => (
                  <Card key={sensor.id} className={sensor.status === "warning" ? "border-warning" : ""}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{sensor.name}</h4>
                        <Badge className={getStatusColor(sensor.status) + " text-white"}>
                          {sensor.status === "normal" ? "OK" : sensor.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/50 transition-all"
                          style={{ height: `${sensor.value}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">{sensor.value}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Estimated range: {Math.round(sensor.value * 50)} nautical miles
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alert History
              </CardTitle>
              <CardDescription>Recent sensor alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "10 min ago", sensor: "Exhaust Gas Temp", message: "Temperature above threshold (320°C)", level: "warning" },
                  { time: "2 hours ago", sensor: "Fuel Level Tank 2", message: "Level dropped below 50%", level: "warning" },
                  { time: "1 day ago", sensor: "Main Engine Vibration", message: "Vibration spike detected (3.1 mm/s)", level: "warning" },
                  { time: "2 days ago", sensor: "Lube Oil Pressure", message: "Pressure normalized after adjustment", level: "info" },
                ].map((alert) => (
                  <div
                    key={alert.sensor}
                    className={`p-3 rounded-lg border ${
                      alert.level === "warning" ? "bg-warning/5 border-warning/20" :
                      alert.level === "critical" ? "bg-destructive/5 border-destructive/20" :
                      "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{alert.sensor}</span>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
