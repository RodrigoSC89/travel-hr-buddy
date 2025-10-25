/**
 * PATCH 172.0 - Drone Telemetry Stream
 * Real-time UI for drone status and telemetry with simulated video feed
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Plane, 
  Battery, 
  Signal, 
  MapPin, 
  Activity,
  Video,
  AlertTriangle,
  Power,
  Navigation
} from "lucide-react";
import { droneCommander, type DroneStatus } from "./droneCommander";
import { cn } from "@/lib/utils";

interface DroneTelemetryStreamProps {
  droneId: string;
  showVideo?: boolean;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export const DroneTelemetryStream: React.FC<DroneTelemetryStreamProps> = ({
  droneId,
  showVideo = true,
  showControls = true,
  autoRefresh = true,
  refreshIntervalMs = 1000
}) => {
  const [drone, setDrone] = useState<DroneStatus | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(true);

  // Load drone data
  useEffect(() => {
    const updateDrone = () => {
      const status = droneCommander.getDroneStatus(droneId);
      setDrone(status);
    };

    updateDrone();

    if (autoRefresh) {
      const interval = setInterval(updateDrone, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [droneId, autoRefresh, refreshIntervalMs]);

  if (!drone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Drone Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Drone {droneId} is not registered in the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: DroneStatus["status"]) => {
    switch (status) {
      case "flying":
      case "hovering":
        return "text-green-500";
      case "idle":
        return "text-gray-500";
      case "takeoff":
      case "landing":
        return "text-blue-500";
      case "emergency":
        return "text-red-500";
      case "offline":
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  const getStatusLabel = (status: DroneStatus["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return "bg-green-500";
    if (battery > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSignalColor = (signal: number) => {
    if (signal > 70) return "text-green-500";
    if (signal > 40) return "text-yellow-500";
    return "text-red-500";
  };

  const handleCommand = async (command: string) => {
    switch (command) {
      case "takeoff":
        droneCommander.sendCommand(droneId, "takeoff");
        break;
      case "land":
        droneCommander.sendCommand(droneId, "land");
        break;
      case "hover":
        droneCommander.sendCommand(droneId, "hover");
        break;
      case "return_home":
        droneCommander.sendCommand(droneId, "return_home");
        break;
      case "emergency_stop":
        droneCommander.sendCommand(droneId, "emergency_stop");
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className={cn("h-5 w-5", getStatusColor(drone.status))} />
              {drone.name}
            </div>
            <Badge variant={drone.status === "offline" ? "destructive" : "default"}>
              {getStatusLabel(drone.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Battery */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Battery className="h-4 w-4" />
                Battery
              </div>
              <div className="space-y-1">
                <Progress 
                  value={drone.battery} 
                  className={`h-2 ${getBatteryColor(drone.battery)}`}
                />
                <div className="text-xs font-medium">{drone.battery}%</div>
              </div>
            </div>

            {/* Signal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Signal className="h-4 w-4" />
                Signal
              </div>
              <div className="space-y-1">
                <div className={cn("text-2xl font-bold", getSignalColor(drone.signal))}>
                  {drone.signal}%
                </div>
              </div>
            </div>

            {/* Altitude */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4" />
                Altitude
              </div>
              <div className="text-2xl font-bold">
                {drone.position.altitude.toFixed(1)}m
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Speed
              </div>
              <div className="text-2xl font-bold">
                {drone.speed.toFixed(1)} m/s
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Position</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Latitude</div>
                <div className="font-mono">{drone.position.latitude.toFixed(6)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Longitude</div>
                <div className="font-mono">{drone.position.longitude.toFixed(6)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Heading</div>
                <div className="font-mono">{drone.position.heading.toFixed(0)}°</div>
              </div>
            </div>
          </div>

          {/* Active Route Info */}
          {drone.activeRoute && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Active Route</div>
                  <div className="font-medium">{drone.activeRoute}</div>
                </div>
                {drone.currentWaypoint !== undefined && (
                  <Badge variant="outline">
                    Waypoint {drone.currentWaypoint + 1}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Feed */}
      {showVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Live Video Feed
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVideoActive(!isVideoActive)}
              >
                {isVideoActive ? "Pause" : "Resume"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {isVideoActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Video className="h-16 w-16 text-gray-600 mx-auto" />
                    <div className="text-gray-400">
                      <p className="text-lg font-medium">Simulated Video Feed</p>
                      <p className="text-sm">Live stream from {drone.name}</p>
                    </div>
                    {/* Simulated telemetry overlay */}
                    <div className="absolute top-4 left-4 text-white font-mono text-xs space-y-1 bg-black/50 p-2 rounded">
                      <div>ALT: {drone.position.altitude.toFixed(1)}m</div>
                      <div>SPD: {drone.speed.toFixed(1)} m/s</div>
                      <div>BAT: {drone.battery}%</div>
                      <div>SIG: {drone.signal}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <p className="text-gray-400">Video Paused</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="h-5 w-5" />
              Drone Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button
                onClick={() => handleCommand("takeoff")}
                disabled={drone.status !== "idle"}
                variant="default"
              >
                Takeoff
              </Button>
              <Button
                onClick={() => handleCommand("land")}
                disabled={drone.status === "idle" || drone.status === "offline"}
                variant="default"
              >
                Land
              </Button>
              <Button
                onClick={() => handleCommand("hover")}
                disabled={drone.status !== "flying"}
                variant="outline"
              >
                Hover
              </Button>
              <Button
                onClick={() => handleCommand("return_home")}
                disabled={drone.status === "idle" || drone.status === "offline"}
                variant="outline"
              >
                Return Home
              </Button>
              <Button
                onClick={() => handleCommand("emergency_stop")}
                disabled={drone.status === "offline"}
                variant="destructive"
              >
                Emergency Stop
              </Button>
            </div>

            {(drone.battery < 20 || drone.signal < 30) && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-medium text-yellow-900 dark:text-yellow-100">
                      Warning
                    </div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      {drone.battery < 20 && <p>• Low battery: Consider landing soon</p>}
                      {drone.signal < 30 && <p>• Weak signal: Connection may be unstable</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DroneTelemetryStream;
