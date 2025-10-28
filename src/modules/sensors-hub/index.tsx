/**
 * PATCH 174.0 - Sensors Hub UI
 * PATCH 441 - Enhanced with real-time updates, normalization, and alerts
 * Real-time sensor data visualization with anomaly detection
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  Power,
  TrendingUp,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { sensorStream, type SensorData } from "./sensorStream";
import { sensorRegistry } from "./sensorRegistry";
import { sensorSimulator } from "./services/sensor-simulator";
import { sensorDataService } from "./services/sensor-data-service";
import { SensorAlerts } from "./components/SensorAlerts";
import { SensorPanel } from "./components/SensorPanel";
import { SensorHistory } from "./components/SensorHistory";

export const SensorsHub: React.FC = () => {
  const [sensors, setSensors] = useState<string[]>([]);
  const [latestData, setLatestData] = useState<Map<string, SensorData>>(new Map());
  const [isSimulating, setIsSimulating] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  useEffect(() => {
    // Start simulation automatically
    handleStartSimulation();
    loadAlerts();

    // Cleanup on unmount
    return () => {
      sensorSimulator.stop();
    };
  }, []);

  useEffect(() => {
    // Update sensor data from stream
    const interval = setInterval(() => {
      const activeSensors = sensorStream.listActiveSensors();
      setSensors(activeSensors);

      const dataMap = new Map<string, SensorData>();
      activeSensors.forEach(id => {
        const data = sensorStream.getLatest(id);
        if (data) {
          dataMap.set(id, data);
          
          // Store in database periodically (every 10 readings)
          if (Math.random() < 0.1) {
            const sensorConfig = sensorSimulator.getSensors().find(s => s.id === id);
            if (sensorConfig) {
              sensorDataService.storeSensorData(data, sensorConfig.name).catch(err => {
                console.error("Failed to store sensor data:", err);
              });
              
              // Check for anomalies
              sensorDataService.detectAnomalies(
                id,
                sensorConfig.name,
                data.value,
                sensorConfig.anomalyThreshold
              ).catch(err => {
                console.error("Failed to detect anomalies:", err);
              });
            }
          }
        }
      });
      setLatestData(dataMap);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reload alerts periodically
  useEffect(() => {
    const interval = setInterval(loadAlerts, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const unresolvedAlerts = await sensorDataService.getUnresolvedAlerts();
      setAlerts(unresolvedAlerts);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const handleStartSimulation = () => {
    if (!isSimulating) {
      sensorSimulator.start();
      setIsSimulating(true);
      toast.success("Sensor simulation started");
    }
  };

  const handleStopSimulation = () => {
    if (isSimulating) {
      sensorSimulator.stop();
      setIsSimulating(false);
      toast.info("Sensor simulation stopped");
    }
  };

  const getSensorIcon = (sensorId: string) => {
    if (sensorId.startsWith("temp")) return Thermometer;
    if (sensorId.startsWith("vib")) return Activity;
    if (sensorId.startsWith("depth")) return Droplets;
    return Activity;
  };

  const getSensorColor = (value: number, sensorId: string) => {
    const sensorConfig = sensorSimulator.getSensors().find(s => s.id === sensorId);
    if (!sensorConfig) return "text-gray-500";
    
    if (value >= sensorConfig.anomalyThreshold) {
      return "text-red-500";
    } else if (value >= sensorConfig.anomalyThreshold * 0.85) {
      return "text-yellow-500";
    }
    return "text-green-500";
  };

  const unresolvedAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === "critical" && !a.resolved).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Sensors Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            PATCH 441 - Real-time sensor monitoring with anomaly detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isSimulating ? "default" : "secondary"}>
            <Power className="h-3 w-3 mr-1" />
            {isSimulating ? "Active" : "Inactive"}
          </Badge>
          {isSimulating ? (
            <Button onClick={handleStopSimulation} variant="outline" size="sm">
              Stop Simulation
            </Button>
          ) : (
            <Button onClick={handleStartSimulation} size="sm">
              Start Simulation
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensors.length}</div>
            <p className="text-xs text-muted-foreground">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unresolved Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalAlertsCount}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {sensors.length > 0 ? "98%" : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Overall status</p>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Real-time Sensor Metrics
          </CardTitle>
          <CardDescription>
            Live data from all active sensors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sensors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active sensors</p>
              <Button onClick={handleStartSimulation} className="mt-4" size="sm">
                Start Simulation
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sensors.map(sensorId => {
                const data = latestData.get(sensorId);
                const info = sensorRegistry.getSensor(sensorId);
                const sensorConfig = sensorSimulator.getSensors().find(s => s.id === sensorId);
                const Icon = getSensorIcon(sensorId);
                
                return (
                  <Card 
                    key={sensorId} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedSensor(sensorId)}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {sensorConfig?.name || info?.name || sensorId}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data && (
                        <div>
                          <div className={`text-2xl font-bold ${getSensorColor(data.value, sensorId)}`}>
                            {data.value.toFixed(2)} {data.unit}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(data.timestamp).toLocaleTimeString()}
                          </div>
                          {sensorConfig && data.value >= sensorConfig.anomalyThreshold * 0.85 && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              High
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <SensorAlerts 
          alerts={alerts}
          onAcknowledge={async (alertId) => {
            // In production, get actual user ID
            await sensorDataService.acknowledgeAlert(alertId, "system");
            await loadAlerts();
            toast.success("Alert acknowledged");
          }}
          onResolve={async (alertId) => {
            await sensorDataService.resolveAlert(alertId);
            await loadAlerts();
            toast.success("Alert resolved");
          }}
        />
      )}

      {/* Selected Sensor Details */}
      {selectedSensor && (
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <SensorPanel title="Sensor Details" sensors={[]} onRefresh={() => {}} />
  <SensorHistory sensorType="generic" />
</div>
      )}
    </div>
  );
};

export default SensorsHub;
