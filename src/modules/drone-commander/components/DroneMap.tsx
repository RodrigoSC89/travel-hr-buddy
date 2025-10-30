/**
 * PATCH 427 - Drone Map Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { DroneStatus, DroneFlight } from "../types";

interface DroneMapProps {
  drones: DroneStatus[];
  flights: DroneFlight[];
  selectedDrone: string | null;
  onSelectDrone: (droneId: string) => void;
}

export const DroneMap: React.FC<DroneMapProps> = ({
  drones,
  flights,
  selectedDrone,
  onSelectDrone
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Drone Map View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Interactive map with drone positions
            </p>
            <p className="text-xs text-muted-foreground">
              {drones.length} drone{drones.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 p-4 border rounded space-y-2">
          <h4 className="font-medium text-sm">Map Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Active Drone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Idle Drone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Scheduled Flight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Emergency</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
