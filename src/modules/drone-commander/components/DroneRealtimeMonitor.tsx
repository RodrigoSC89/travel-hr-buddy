/**
 * PATCH 451 - Drone Real-time Monitor Component
 * WebSocket-based real-time monitoring
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, WifiOff } from "lucide-react";
import type { DroneStatus } from "../types";

interface DroneRealtimeMonitorProps {
  drones: DroneStatus[];
  wsConnected: boolean;
}

export const DroneRealtimeMonitor: React.FC<DroneRealtimeMonitorProps> = ({
  drones,
  wsConnected
}) => {
  const [telemetryData, setTelemetryData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Simulate real-time telemetry updates
    const interval = setInterval(() => {
      const newData: Record<string, any> = {};
      drones.forEach(drone => {
        newData[drone.id] = {
          timestamp: new Date().toISOString(),
          battery: drone.battery,
          signal: drone.signal,
          altitude: drone.position?.altitude || 0,
          speed: drone.speed || 0
        };
      });
      setTelemetryData(newData);
    }, 1000);

    return () => clearInterval(interval);
  }, [drones]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-time Telemetry</CardTitle>
          <Badge variant={wsConnected ? "default" : "secondary"}>
            {wsConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active drones to monitor
            </div>
          ) : (
            <div className="space-y-3">
              {drones.map(drone => {
                const telemetry = telemetryData[drone.id];
                return (
                  <Card key={drone.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                          <span className="font-semibold">{drone.name}</span>
                        </div>
                        {telemetry && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(telemetry.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      
                      {telemetry && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Battery</div>
                            <div className="font-semibold">{telemetry.battery}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Signal</div>
                            <div className="font-semibold">{telemetry.signal}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Altitude</div>
                            <div className="font-semibold">{telemetry.altitude}m</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Speed</div>
                            <div className="font-semibold">{telemetry.speed}m/s</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
