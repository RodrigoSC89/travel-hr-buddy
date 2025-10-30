/**
 * PATCH 451 - Drone Fleet Overview Component
 * Displays real-time status of all drones in the fleet
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Battery, 
  Signal, 
  MapPin,
  Square,
  Home
} from "lucide-react";
import type { DroneStatus } from "../types";

interface DroneFleetOverviewProps {
  drones: DroneStatus[];
  onEmergencyStop: (droneId: string) => void;
  onReturnHome: (droneId: string) => void;
  onRefresh: () => void;
}

export const DroneFleetOverview: React.FC<DroneFleetOverviewProps> = ({
  drones,
  onEmergencyStop,
  onReturnHome,
  onRefresh
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
    case "in-mission":
      return "bg-green-500/20 text-green-500";
    case "idle":
      return "bg-blue-500/20 text-blue-500";
    case "offline":
    case "error":
      return "bg-red-500/20 text-red-500";
    case "maintenance":
      return "bg-yellow-500/20 text-yellow-500";
    default:
      return "bg-gray-500/20 text-gray-500";
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 70) return "text-green-500";
    if (battery >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drones registered in the fleet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drones.map(drone => (
                <Card key={drone.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{drone.name}</h4>
                        <p className="text-sm text-muted-foreground">{drone.id}</p>
                      </div>
                      <Badge className={getStatusColor(drone.status)}>
                        {drone.status}
                      </Badge>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Battery className={`h-4 w-4 ${getBatteryColor(drone.battery)}`} />
                        <span>{drone.battery}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4" />
                        <span>{drone.signal}%</span>
                      </div>
                      {drone.position && (
                        <>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{drone.position.altitude}m</span>
                          </div>
                          <div className="text-xs text-muted-foreground col-span-2">
                            {drone.position.latitude.toFixed(6)}, {drone.position.longitude.toFixed(6)}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onReturnHome(drone.id)}
                        disabled={drone.status === "idle" || drone.status === "offline"}
                      >
                        <Home className="h-3 w-3 mr-1" />
                        Home
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => onEmergencyStop(drone.id)}
                        disabled={drone.status === "idle" || drone.status === "offline"}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </div>

                    {/* Warnings */}
                    {(drone.battery < 20 || drone.signal < 30) && (
                      <div className="flex items-center gap-2 text-sm text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {drone.battery < 20 && "Low battery"}
                          {drone.battery < 20 && drone.signal < 30 && " • "}
                          {drone.signal < 30 && "Weak signal"}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
