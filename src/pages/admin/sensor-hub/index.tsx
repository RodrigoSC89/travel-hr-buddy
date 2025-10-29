// @ts-nocheck
/**
 * PATCH 453 - Sensors Hub Complete
 * Central hub for sensor monitoring and analysis
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Wind,
  AlertTriangle,
  TrendingUp,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { SensorDashboard } from "@/modules/sensors-hub/components/SensorDashboard";
import { SensorAlerts } from "@/modules/sensors-hub/components/SensorAlerts";
import { SensorHistory } from "@/modules/sensors-hub/components/SensorHistory";
import { sensorService } from "@/modules/sensors-hub/services/sensors-service";
import type { SensorReading, SensorAlert } from "@/modules/sensors-hub/types";

const SensorsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    // Setup real-time updates every 2 seconds
    const interval = setInterval(loadData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [readingsData, alertsData] = await Promise.all([
        sensorService.getLatestReadings(),
        sensorService.getActiveAlerts()
      ]);
      setReadings(readingsData);
      setAlerts(alertsData as SensorAlert[]);
    } catch (error) {
      console.error("Error loading sensor data:", error);
    }
  };

  // Calculate metrics
  const activeSensors = readings.filter(r => r.status === "active").length;
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const avgTemperature = readings
    .filter(r => r.type === "temperature")
    .reduce((sum, r) => sum + r.value, 0) / readings.filter(r => r.type === "temperature").length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sensors Hub</h1>
            <p className="text-sm text-muted-foreground">
              Real-time sensor monitoring and analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">● Live</Badge>
          <Button onClick={loadData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSensors}</div>
            <p className="text-xs text-muted-foreground">
              {readings.length} total sensors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTemperature.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Environmental sensors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(readings.length * 30).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="history">
            <TrendingUp className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SensorDashboard 
            readings={readings}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SensorAlerts 
            alerts={alerts}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <SensorHistory 
            sensorType="all"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SensorsHubPage;
