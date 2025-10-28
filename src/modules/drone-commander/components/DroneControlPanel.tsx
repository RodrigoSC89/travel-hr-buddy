/**
 * PATCH 427 - Drone Control Panel Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Home, AlertTriangle } from "lucide-react";
import type { DroneStatus } from "../types";

interface DroneControlPanelProps {
  drones: DroneStatus[];
  selectedDrone: string | null;
  onCommand: (droneId: string, command: string) => void;
  onSelectDrone: (droneId: string) => void;
}

export const DroneControlPanel: React.FC<DroneControlPanelProps> = ({
  drones,
  selectedDrone,
  onCommand,
  onSelectDrone
}) => {
  const drone = drones.find(d => d.id === selectedDrone);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drone Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!drone ? (
          <p className="text-center text-muted-foreground py-8">
            Select a drone to control
          </p>
        ) : (
          <div className="space-y-6">
            {/* Drone Info */}
            <div className="p-4 border rounded space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{drone.name}</h3>
                <Badge>{drone.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Battery:</span>{" "}
                  <span className="font-medium">{drone.battery}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signal:</span>{" "}
                  <span className="font-medium">{drone.signal}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Altitude:</span>{" "}
                  <span className="font-medium">{drone.altitude}m</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Speed:</span>{" "}
                  <span className="font-medium">{drone.speed}m/s</span>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <h4 className="font-medium">Quick Commands</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => onCommand(drone.id, "takeoff")}
                  disabled={drone.status !== "idle"}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Takeoff
                </Button>
                <Button
                  onClick={() => onCommand(drone.id, "land")}
                  disabled={drone.status === "idle"}
                  className="w-full"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Land
                </Button>
                <Button
                  onClick={() => onCommand(drone.id, "return_home")}
                  disabled={drone.status === "idle"}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
                <Button
                  onClick={() => onCommand(drone.id, "emergency_stop")}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Emergency Stop
                </Button>
              </div>
            </div>

            {/* Position Info */}
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Current Position</h4>
              <div className="space-y-1 text-sm">
                <div>Latitude: {drone.position.latitude.toFixed(6)}°</div>
                <div>Longitude: {drone.position.longitude.toFixed(6)}°</div>
                <div>Altitude: {drone.position.altitude}m</div>
                <div>Heading: {drone.position.heading}°</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
