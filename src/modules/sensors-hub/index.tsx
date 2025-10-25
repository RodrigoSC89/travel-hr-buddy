/**
 * PATCH 174.0 - Sensors Hub UI
 * Real-time sensor data visualization
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Thermometer, Droplets } from "lucide-react";
import { sensorStream, type SensorData } from "./sensorStream";
import { sensorRegistry } from "./sensorRegistry";

export const SensorsHub: React.FC = () => {
  const [sensors, setSensors] = useState<string[]>([]);
  const [latestData, setLatestData] = useState<Map<string, SensorData>>(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      const activeSensors = sensorStream.listActiveSensors();
      setSensors(activeSensors);

      const dataMap = new Map<string, SensorData>();
      activeSensors.forEach(id => {
        const data = sensorStream.getLatest(id);
        if (data) dataMap.set(id, data);
      });
      setLatestData(dataMap);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Remote Sensors Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sensors.length === 0 ? (
            <p className="text-muted-foreground">No active sensors</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map(sensorId => {
                const data = latestData.get(sensorId);
                const info = sensorRegistry.getSensor(sensorId);
                
                return (
                  <Card key={sensorId}>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        {info?.name || sensorId}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data && (
                        <div>
                          <div className="text-2xl font-bold">
                            {data.value.toFixed(2)} {data.unit}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(data.timestamp).toLocaleTimeString()}
                          </div>
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
    </div>
  );
};

export default SensorsHub;
