/**
 * PATCH 367 - Fleet Management - Telemetry & Maintenance Alerts
 * Real-time fleet telemetry monitoring with predictive maintenance
 * Migrated: removed chart.js registration (no charts used in this component)
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
  RefreshCw,
  Download,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { logger } from '@/lib/logger';

// Use schema types
type IotSensorData = Database["public"]["Tables"]["iot_sensor_data"]["Row"];
type Vessel = Database["public"]["Tables"]["vessels"]["Row"];

// Extended sensor reading with computed fields
interface SensorReading extends IotSensorData {
  sensor_location: string;
  threshold_min: number;
  threshold_max: number;
  is_alert: boolean;
}

interface MaintenanceAlert {
  id: string;
  vessel_id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  sensor_data: SensorReading | null;
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

const SENSOR_THRESHOLDS: Record<string, { min: number; max: number; critical: number }> = {
  temperature: { min: -20, max: 80, critical: 90 },
  pressure: { min: 0, max: 150, critical: 180 },
  vibration: { min: 0, max: 5, critical: 8 },
  fuel_level: { min: 10, max: 100, critical: 5 },
  engine_rpm: { min: 0, max: 3000, critical: 3500 },
};

// Helper to extract metadata safely
function extractMetadata<T>(json: Json | null, key: string, fallback: T): T {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const value = (json as Record<string, unknown>)[key];
  return (value as T) ?? fallback;
}

export const FleetTelemetryDashboard: React.FC = () => {
  const [vessels, setVessels] = useState<VesselTelemetry[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const loadTelemetryData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .order("name");

      if (vesselsError) throw vesselsError;

      const { data: sensorReadings, error: sensorError } = await supabase
        .from("iot_sensor_data")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (sensorError) throw sensorError;

      const transformedSensors: SensorReading[] = (sensorReadings || []).map((sensor) => {
        const threshold = SENSOR_THRESHOLDS[sensor.sensor_type] || { min: 0, max: 100, critical: 120 };
        const isAlert = sensor.status === "critical" || sensor.status === "warning" || sensor.value > threshold.max;
        
        return {
          ...sensor,
          sensor_location: sensor.location || extractMetadata(sensor.metadata, "location", "Unknown"),
          threshold_min: extractMetadata(sensor.metadata, "threshold_min", threshold.min),
          threshold_max: extractMetadata(sensor.metadata, "threshold_max", threshold.max),
          is_alert: isAlert,
        };
      });

      setSensorData(transformedSensors);

      const telemetryByVessel: VesselTelemetry[] = (vesselsData || []).map((vessel: Vessel) => {
        const vesselSensors = transformedSensors.filter(
          (s) => s.vessel_id === vessel.id
        );
        
        const healthScore = calculateHealthScore(vesselSensors);

        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          sensors: vesselSensors.slice(0, 20),
          health_score: healthScore,
          last_update: vesselSensors[0]?.timestamp || new Date().toISOString(),
        };
      });

      setVessels(telemetryByVessel);
      await checkAndGenerateAlerts(transformedSensors);
    } catch (error) {
      logger.error("Error loading telemetry:", error);
      toast.error("Failed to load telemetry data");
    } finally {
      setLoading(false);
    }
  }, []);

  const simulateSensorReadings = useCallback(async () => {
    const { data: vesselsData } = await supabase.from("vessels").select("id").limit(3);

    if (!vesselsData) return;

    const sensorTypes = ["temperature", "pressure", "vibration", "fuel_level", "engine_rpm"];
    const newReadings: Database["public"]["Tables"]["iot_sensor_data"]["Insert"][] = [];

    vesselsData.forEach((vessel) => {
      sensorTypes.forEach((type) => {
        const threshold = SENSOR_THRESHOLDS[type];
        const baseValue = (threshold.min + threshold.max) / 2;
        const variation = (threshold.max - threshold.min) * 0.2;
        const value = baseValue + ((vesselsData.indexOf(vessel) * 7 + sensorTypes.indexOf(type) * 13) % 20 - 10) * variation * 0.1;
        const anomalyValue = value;

        const status = 
          anomalyValue > threshold.critical ? "critical" :
            anomalyValue > threshold.max ? "warning" :
              "normal";

        newReadings.push({
          vessel_id: vessel.id,
          sensor_id: `sensor-${type}-${vessel.id}`,
          sensor_type: type,
          location: `Engine Room ${type}`,
          value: Math.round(anomalyValue * 10) / 10,
          unit: type === "temperature" ? "°C" : type === "pressure" ? "bar" : type === "vibration" ? "mm/s" : type === "fuel_level" ? "%" : "RPM",
          status,
          timestamp: new Date().toISOString(),
          metadata: {
            threshold_min: threshold.min,
            threshold_max: threshold.max,
          } as unknown as Json,
        });
      });
    });

    try {
      const { error } = await supabase.from("iot_sensor_data").insert(newReadings);
      if (error) throw error;
    } catch (error) {
      logger.error("Error inserting sensor data:", error);
    }
  }, []);

  useEffect(() => {
    loadTelemetryData();
    
    const subscription = supabase
      .channel("telemetry-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "iot_sensor_data" },
        () => {
          loadTelemetryData();
        }
      )
      .subscribe();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        simulateSensorReadings();
      }, 10000);
      setRefreshInterval(interval);
    }

    return () => {
      subscription.unsubscribe();
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, loadTelemetryData, simulateSensorReadings]);

  const calculateHealthScore = (sensors: SensorReading[]): number => {
    if (sensors.length === 0) return 100;

    const statusWeights: Record<string, number> = {
      normal: 1,
      warning: 0.7,
      critical: 0.3,
      offline: 0,
    };

    const totalWeight = sensors.reduce(
      (sum, sensor) => sum + (statusWeights[sensor.status || "normal"] || 0),
      0
    );

    return Math.round((totalWeight / sensors.length) * 100);
  };

  const checkAndGenerateAlerts = async (readings: SensorReading[]) => {
    const newAlerts: MaintenanceAlert[] = [];

    readings.forEach((reading) => {
      if (reading.value > reading.threshold_max) {
        newAlerts.push({
          id: `alert-${reading.id}`,
          vessel_id: reading.vessel_id || "",
          alert_type: "threshold_exceeded",
          severity: reading.value > reading.threshold_max * 1.2 ? "critical" : "high",
          message: `${reading.sensor_type} exceeded threshold: ${reading.value}${reading.unit || ""}`,
          sensor_data: reading,
          recommended_action: `Inspect ${reading.sensor_location} immediately`,
          status: "active",
          created_at: reading.timestamp,
        });
      }

      if (reading.sensor_type === "vibration" && reading.value > 7) {
        newAlerts.push({
          id: `alert-vibration-${reading.id}`,
          vessel_id: reading.vessel_id || "",
          alert_type: "vibration_anomaly",
          severity: "high",
          message: `Abnormal vibration detected: ${reading.value}${reading.unit || ""}`,
          sensor_data: reading,
          predicted_failure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          recommended_action: "Schedule bearing inspection within 7 days",
          status: "active",
          created_at: reading.timestamp,
        });
      }

      if (reading.sensor_type === "temperature" && reading.value > 75) {
        newAlerts.push({
          id: `alert-temp-${reading.id}`,
          vessel_id: reading.vessel_id || "",
          alert_type: "temperature_warning",
          severity: "medium",
          message: `Elevated temperature: ${reading.value}${reading.unit || ""}`,
          sensor_data: reading,
          recommended_action: "Monitor cooling system",
          status: "active",
          created_at: reading.timestamp,
        });
      }
    });

    setAlerts(newAlerts);

    if (newAlerts.length > 0) {
      const criticalAlerts = newAlerts.filter((a) => a.severity === "critical");
      if (criticalAlerts.length > 0) {
        toast.error(`${criticalAlerts.length} critical alert(s) detected!`, {
          duration: 10000,
        });
      }
    }
  };

  const getSensorIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      temperature: Thermometer,
      pressure: Gauge,
      vibration: Activity,
      fuel_level: Waves,
      engine_rpm: Zap,
    };
    const Icon = icons[type] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string | null) => {
    const colors: Record<string, string> = {
      normal: "text-success",
      warning: "text-warning",
      critical: "text-destructive",
      offline: "text-muted-foreground",
    };
    return colors[status || "normal"] || "text-muted-foreground";
  };

  const exportTelemetryData = () => {
    if (sensorData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvData = sensorData.map((s) => ({
      vessel_id: s.vessel_id,
      sensor_type: s.sensor_type,
      value: s.value,
      unit: s.unit,
      status: s.status,
      timestamp: s.timestamp,
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
            onClick={() => setAutoRefresh(!autoRefresh)}
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
            <AlertTriangle className="h-4 w-4 text-warning" />
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
            <CheckCircle className="h-4 w-4 text-success" />
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
              Critical Alerts ({alerts.filter((a) => a.severity === "critical").length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts
                .filter((a) => a.severity === "critical")
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.recommended_action}
                      </p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vessel Telemetry */}
      <Card>
        <CardHeader>
          <CardTitle>Vessel Sensor Overview</CardTitle>
          <CardDescription>
            Latest sensor readings by vessel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {vessels.map((vessel) => (
              <div key={vessel.vessel_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{vessel.vessel_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last update: {format(new Date(vessel.last_update), "HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="font-bold">{vessel.health_score}%</p>
                    </div>
                    <Progress value={vessel.health_score} className="w-20" />
                  </div>
                </div>

                {vessel.sensors.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {vessel.sensors.slice(0, 5).map((sensor) => (
                      <div
                        key={sensor.id}
                        className={`p-3 rounded-lg border ${
                          sensor.is_alert ? "border-destructive bg-destructive/5" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getSensorIcon(sensor.sensor_type)}
                          <span className="text-xs font-medium capitalize">
                            {sensor.sensor_type.replace("_", " ")}
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${getStatusColor(sensor.status)}`}>
                          {sensor.value}{sensor.unit || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sensor.sensor_location}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sensor data available
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              All Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.recommended_action}
                    </p>
                    {alert.predicted_failure_date && (
                      <p className="text-xs text-destructive mt-1">
                        Predicted failure: {format(new Date(alert.predicted_failure_date), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      alert.severity === "critical"
                        ? "destructive"
                        : alert.severity === "high"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FleetTelemetryDashboard;
