import { useCallback, useMemo, useEffect, useState } from "react";;

/**
 * PATCH 367 - Fleet Management - Telemetry & Maintenance Alerts
 * Real-time fleet telemetry monitoring with predictive maintenance
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Gauge,
  Thermometer,
  Waves,
  Zap,
  TrendingUp,
  TrendingDown,
  Bell,
  Settings,
  RefreshCw,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SensorReading {
  id: string;
  vessel_id: string;
  sensor_id: string;
  sensor_type: string;
  sensor_location: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical" | "offline";
  threshold_min: number;
  threshold_max: number;
  is_alert: boolean;
  reading_timestamp: string;
  metadata: unknown;
}

interface MaintenanceAlert {
  id: string;
  vessel_id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  sensor_data: unknown;
  predicted_failure_date?: string;
  recommended_action: string;
  status: "active" | "acknowledged" | "resolved";
  created_at: string;
}

interface VesselTelemetry {
  vessel_id: string;
  vessel_name: string;
  sensors: SensorReading[];
  health_score: number;
  last_update: string;
}

const SENSOR_THRESHOLDS = {
  temperature: { min: -20, max: 80, critical: 90 },
  pressure: { min: 0, max: 150, critical: 180 },
  vibration: { min: 0, max: 5, critical: 8 },
  fuel_level: { min: 10, max: 100, critical: 5 },
  engine_rpm: { min: 0, max: 3000, critical: 3500 },
};

export const FleetTelemetryDashboard: React.FC = () => {
  const [vessels, setVessels] = useState<VesselTelemetry[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTelemetryData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel("telemetry-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iot_sensor_data" },
        (payload) => {
          loadTelemetryData();
        }
      )
      .subscribe();

    // Auto-refresh every 10 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        simulateSensorReadings();
      }, 10000);
      setRefreshInterval(interval);
    }

    return () => {
      subscription.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadTelemetryData = async () => {
    try {
      setLoading(true);

      // Load vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .order("name");

      if (vesselsError) throw vesselsError;

      // Load recent sensor data
      const { data: sensorReadings, error: sensorError } = await supabase
        .from("iot_sensor_data")
        .select("*")
        .order("reading_timestamp", { ascending: false })
        .limit(1000);

      if (sensorError) throw sensorError;

      setSensorData(sensorReadings || []);

      // Process telemetry by vessel
      const telemetryByVessel: VesselTelemetry[] = (vesselsData || []).map((vessel) => {
        const vesselSensors = (sensorReadings || []).filter(
          (s) => s.vessel_id === vessel.id
        );
        
        // Calculate health score based on sensor status
        const healthScore = calculateHealthScore(vesselSensors);

        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          sensors: vesselSensors.slice(0, 20), // Last 20 readings
          health_score: healthScore,
          last_update: vesselSensors[0]?.reading_timestamp || new Date().toISOString(),
        };
      };

      setVessels(telemetryByVessel);

      // Check for alerts
      await checkAndGenerateAlerts(sensorReadings || []);
    } catch (error) {
      console.error("Error loading telemetry:", error);
      console.error("Error loading telemetry:", error);
      toast.error("Failed to load telemetry data");
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (sensors: SensorReading[]): number => {
    if (sensors.length === 0) return 100;

    const statusWeights = {
      normal: 1,
      warning: 0.7,
      critical: 0.3,
      offline: 0,
    };

    const totalWeight = sensors.reduce(
      (sum, sensor) => sum + (statusWeights[sensor.status] || 0),
      0
    );

    return Math.round((totalWeight / sensors.length) * 100);
  };

  const checkAndGenerateAlerts = async (readings: SensorReading[]) => {
    const newAlerts: MaintenanceAlert[] = [];

    readings.forEach((reading) => {
      // Check threshold violations
      if (reading.value > reading.threshold_max) {
        newAlerts.push({
          id: `alert-${reading.id}`,
          vessel_id: reading.vessel_id,
          alert_type: "threshold_exceeded",
          severity: reading.value > reading.threshold_max * 1.2 ? "critical" : "high",
          message: `${reading.sensor_type} exceeded threshold: ${reading.value}${reading.unit}`,
          sensor_data: reading,
          recommended_action: `Inspect ${reading.sensor_location} immediately`,
          status: "active",
          created_at: reading.reading_timestamp,
        };
      }

      // Check for anomalous patterns (vibration)
      if (reading.sensor_type === "vibration" && reading.value > 7) {
        newAlerts.push({
          id: `alert-vibration-${reading.id}`,
          vessel_id: reading.vessel_id,
          alert_type: "vibration_anomaly",
          severity: "high",
          message: `Abnormal vibration detected: ${reading.value}${reading.unit}`,
          sensor_data: reading,
          predicted_failure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          recommended_action: "Schedule bearing inspection within 7 days",
          status: "active",
          created_at: reading.reading_timestamp,
        });
      }

      // Check temperature trends
      if (reading.sensor_type === "temperature" && reading.value > 75) {
        newAlerts.push({
          id: `alert-temp-${reading.id}`,
          vessel_id: reading.vessel_id,
          alert_type: "temperature_warning",
          severity: "medium",
          message: `Elevated temperature: ${reading.value}${reading.unit}`,
          sensor_data: reading,
          recommended_action: "Monitor cooling system",
          status: "active",
          created_at: reading.reading_timestamp,
        });
      }
    });

    setAlerts(newAlerts);

    // Store alerts in database if any
    if (newAlerts.length > 0) {
      // Send notifications for critical alerts
      const criticalAlerts = newAlerts.filter((a) => a.severity === "critical");
      if (criticalAlerts.length > 0) {
        toast.error(`${criticalAlerts.length} critical alert(s) detected!`, {
          duration: 10000,
        };
      }
    }
  };

  const simulateSensorReadings = async () => {
    // Simulate new sensor readings for demo purposes
    const { data: vesselsData } = await supabase.from("vessels").select("id").limit(3);

    if (!vesselsData) return;

    const sensorTypes = ["temperature", "pressure", "vibration", "fuel_level", "engine_rpm"];
    const newReadings: unknown[] = [];

    vesselsData.forEach((vessel) => {
      sensorTypes.forEach((type) => {
        const threshold = SENSOR_THRESHOLDS[type];
        const baseValue = (threshold.min + threshold.max) / 2;
        const variation = (threshold.max - threshold.min) * 0.2;
        const value = baseValue + (Math.random() - 0.5) * variation;
        
        // Occasionally generate anomalies
        const anomalyValue = Math.random() > 0.95 ? threshold.critical : value;

        const status = 
          anomalyValue > threshold.critical ? "critical" :
            anomalyValue > threshold.max ? "warning" :
              "normal";

        newReadings.push({
          vessel_id: vessel.id,
          sensor_id: `sensor-${type}-${vessel.id}`,
          sensor_type: type,
          sensor_location: `Engine Room ${type}`,
          value: Math.round(anomalyValue * 10) / 10,
          unit: type === "temperature" ? "°C" : type === "pressure" ? "bar" : type === "vibration" ? "mm/s" : type === "fuel_level" ? "%" : "RPM",
          status,
          threshold_min: threshold.min,
          threshold_max: threshold.max,
          is_alert: status !== "normal",
          reading_timestamp: new Date().toISOString(),
          metadata: {},
        });
      });
    });

    try {
      const { error } = await supabase.from("iot_sensor_data").insert(newReadings);
      if (error) throw error;
    } catch (error) {
      console.error("Error inserting sensor data:", error);
      console.error("Error inserting sensor data:", error);
    }
  };

  const getSensorIcon = (type: string) => {
    const icons = {
      temperature: Thermometer,
      pressure: Gauge,
      vibration: Activity,
      fuel_level: Waves,
      engine_rpm: Zap,
    };
    const Icon = icons[type] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      normal: "text-green-500",
      warning: "text-yellow-500",
      critical: "text-red-500",
      offline: "text-gray-500",
    };
    return colors[status] || "text-gray-500";
  };

  const exportTelemetryData = () => {
    const csvData = sensorData.map((s) => ({
      vessel_id: s.vessel_id,
      sensor_type: s.sensor_type,
      value: s.value,
      unit: s.unit,
      status: s.status,
      timestamp: s.reading_timestamp,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry-${format(new Date(), "yyyy-MM-dd-HH-mm")}.csv`;
    a.click();

    toast.success("Telemetry data exported");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ship className="h-8 w-8 text-primary" />
            Fleet Telemetry & Maintenance
          </h1>
          <p className="text-muted-foreground">
            Real-time sensor monitoring with predictive maintenance alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSetAutoRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto" : "Manual"}
          </Button>
          <Button variant="outline" onClick={exportTelemetryData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadTelemetryData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vessels.length}</div>
            <p className="text-xs text-muted-foreground">
              {vessels.filter((v) => v.health_score > 80).length} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensorData.length}</div>
            <p className="text-xs text-muted-foreground">
              {sensorData.filter((s) => s.status === "normal").length} normal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter((a) => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                vessels.reduce((sum, v) => sum + v.health_score, 0) / vessels.length || 0
              )}
              %
            </div>
            <Progress
              value={
                vessels.reduce((sum, v) => sum + v.health_score, 0) / vessels.length || 0
              }
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter((a) => a.severity === "critical").length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts
                .filter((a) => a.severity === "critical")
                .map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.recommended_action}</p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vessels.map((vessel) => (
              <Card key={vessel.vessel_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{vessel.vessel_name}</CardTitle>
                    <Badge
                      variant={
                        vessel.health_score > 80
                          ? "default"
                          : vessel.health_score > 60
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {vessel.health_score}%
                    </Badge>
                  </div>
                  <CardDescription>
                    Last update: {format(new Date(vessel.last_update), "PPp")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {vessel.sensors.slice(0, 5).map((sensor) => (
                      <div key={sensor.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getSensorIcon(sensor.sensor_type)}
                          <span>{sensor.sensor_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {sensor.value}
                            {sensor.unit}
                          </span>
                          <span className={getStatusColor(sensor.status)}>●</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleSetSelectedVessel}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          {vessels.map((vessel) => (
            <Card key={vessel.vessel_id}>
              <CardHeader>
                <CardTitle>{vessel.vessel_name} - Sensor Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vessel.sensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSensorIcon(sensor.sensor_type)}
                          <span className="font-medium">{sensor.sensor_type}</span>
                        </div>
                        <Badge
                          variant={
                            sensor.status === "normal"
                              ? "default"
                              : sensor.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {sensor.status}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {sensor.value}
                        {sensor.unit}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sensor.sensor_location}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Range: {sensor.threshold_min} - {sensor.threshold_max}
                        {sensor.unit}
                      </div>
                      {sensor.is_alert && (
                        <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Threshold exceeded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
              <CardDescription>
                Active alerts requiring attention and action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems operating normally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-4 border rounded-lg"
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          alert.severity === "critical"
                            ? "text-red-500"
                            : alert.severity === "high"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.recommended_action}
                            </p>
                            {alert.predicted_failure_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Predicted failure: {format(new Date(alert.predicted_failure_date), "PPP")}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              alert.severity === "critical" ? "destructive" : "secondary"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                          <Button size="sm">Create Work Order</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Maintenance Dashboard</CardTitle>
              <CardDescription>
                AI-powered maintenance predictions and KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Maintenance Efficiency</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">92.5%</div>
                  <Progress value={92.5} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    +5.2% from last month
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Predicted Failures</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {alerts.filter((a) => a.predicted_failure_date).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next 30 days
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cost Savings</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">$45.2K</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This quarter
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Upcoming Maintenance</h3>
                  <div className="space-y-2">
                    {alerts
                      .filter((a) => a.predicted_failure_date)
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                Scheduled: {format(new Date(alert.predicted_failure_date!), "PPP")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm">Schedule</Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetTelemetryDashboard;
