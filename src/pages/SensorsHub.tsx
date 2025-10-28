/**
 * PATCH 428 - Sensors Hub
 * Complete sensor monitoring with simulation and alerts
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Activity,
  Thermometer,
  Gauge,
  Waves,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { SensorPanel } from "./components/SensorPanel";
import { SensorAlerts } from "./components/SensorAlerts";
import { SensorHistory } from "./components/SensorHistory";
import { sensorsService } from "./services/sensors-service";
import { sensorSimulator } from "./services/sensor-simulator";
import type { SensorReading, SensorAlert } from "./types";

const SensorsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    loadData();
    // Refresh data every 3 seconds for real-time updates
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start simulation automatically
    startSimulation();
    return () => stopSimulation();
  }, []);

  const loadData = async () => {
    try {
      const [sensorsData, alertsData] = await Promise.all([
        sensorsService.getLatestReadings(),
        sensorsService.getAlerts({ acknowledged: false })
      ]);
      setSensors(sensorsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error loading sensor data:", error);
    }
  };

  const startSimulation = () => {
    sensorSimulator.start();
    setSimulationRunning(true);
    toast.success("Sensor simulation started");
  };

  const stopSimulation = () => {
    sensorSimulator.stop();
    setSimulationRunning(false);
    toast.info("Sensor simulation stopped");
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await sensorsService.acknowledgeAlert(alertId);
      toast.success("Alert acknowledged");
      loadData();
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  // Group sensors by type
  const temperatureSensors = sensors.filter(s => s.sensorType === "temperature");
  const pressureSensors = sensors.filter(s => s.sensorType === "pressure");
  const depthSensors = sensors.filter(s => s.sensorType === "depth");
  const criticalAlerts = alerts.filter(a => a.severity === "critical");

  const getSensorStatus = (reading: SensorReading) => {
    if (reading.value > reading.maxThreshold || reading.value < reading.minThreshold) {
      return "critical";
    }
    if (reading.value > reading.maxThreshold * 0.9 || reading.value < reading.minThreshold * 1.1) {
      return "warning";
    }
    return "normal";
  };

  const getStatusCounts = () => {
    return {
      normal: sensors.filter(s => getSensorStatus(s) === "normal").length,
      warning: sensors.filter(s => getSensorStatus(s) === "warning").length,
      critical: sensors.filter(s => getSensorStatus(s) === "critical").length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sensors Hub</h1>
            <p className="text-sm text-muted-foreground">
              Real-time sensor monitoring and alert system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => (simulationRunning ? stopSimulation() : startSimulation())}
          >
            {simulationRunning ? "Stop" : "Start"} Simulation
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensors.length}</div>
            <p className="text-xs text-muted-foreground">Active sensors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Normal Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{statusCounts.normal}</div>
            <p className="text-xs text-muted-foreground">Within thresholds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{statusCounts.warning}</div>
            <p className="text-xs text-muted-foreground">Approaching limits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require action</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="temperature">
            <Thermometer className="mr-2 h-4 w-4" />
            Temperature
          </TabsTrigger>
          <TabsTrigger value="pressure">
            <Gauge className="mr-2 h-4 w-4" />
            Pressure
          </TabsTrigger>
          <TabsTrigger value="depth">
            <Waves className="mr-2 h-4 w-4" />
            Depth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorPanel
              title="All Sensors"
              sensors={sensors}
              onRefresh={loadData}
            />
            <SensorAlerts
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>
          <SensorHistory sensorType="all" />
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          <SensorPanel
            title="Temperature Sensors"
            sensors={temperatureSensors}
            onRefresh={loadData}
          />
          <SensorHistory sensorType="temperature" />
        </TabsContent>

        <TabsContent value="pressure" className="space-y-4">
          <SensorPanel
            title="Pressure Sensors"
            sensors={pressureSensors}
            onRefresh={loadData}
          />
          <SensorHistory sensorType="pressure" />
        </TabsContent>

        <TabsContent value="depth" className="space-y-4">
          <SensorPanel
            title="Depth Sensors"
            sensors={depthSensors}
            onRefresh={loadData}
          />
          <SensorHistory sensorType="depth" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SensorsHubPage;
