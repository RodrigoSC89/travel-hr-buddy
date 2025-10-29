/**
 * PATCH 451 - Drone Mission Assignment Component
 * Integrates with mission-engine for task assignment
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Play, Clock } from "lucide-react";
import { toast } from "sonner";
import { droneCommanderService } from "../services/drone-service";
import { missionEngineService } from "@/modules/mission-engine/services/mission-service";
import type { DroneStatus } from "../types";
import type { Mission } from "@/modules/mission-engine/types";

interface DroneMissionAssignmentProps {
  drones: DroneStatus[];
  onRefresh: () => void;
}

export const DroneMissionAssignment: React.FC<DroneMissionAssignmentProps> = ({
  drones,
  onRefresh
}) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string>("");
  const [selectedMission, setSelectedMission] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const data = await missionEngineService.getMissions();
      // Filter for planned missions that can be assigned
      setMissions(data.filter(m => m.status === "planned"));
    } catch (error) {
      console.error("Error loading missions:", error);
    }
  };

  const handleAssignMission = async () => {
    if (!selectedDrone || !selectedMission) {
      toast.error("Please select both a drone and a mission");
      return;
    }

    setLoading(true);
    try {
      // Create task for the drone
      await droneCommanderService.createTask({
        droneId: selectedDrone,
        flightId: undefined,
        type: "patrol",
        priority: "high",
        status: "pending",
        assignedAt: new Date().toISOString(),
        completedAt: undefined,
        result: undefined,
        metadata: {
          missionId: selectedMission
        }
      });

      // Log the assignment
      await droneCommanderService.logFleetEvent({
        droneId: selectedDrone,
        eventType: "mission_assigned",
        severity: "info",
        message: `Mission ${selectedMission} assigned to drone ${selectedDrone}`,
        metadata: {
          missionId: selectedMission
        }
      });

      toast.success("Mission assigned successfully");
      setSelectedDrone("");
      setSelectedMission("");
      onRefresh();
      loadMissions();
    } catch (error) {
      console.error("Error assigning mission:", error);
      toast.error("Failed to assign mission");
    } finally {
      setLoading(false);
    }
  };

  const availableDrones = drones.filter(d => d.status === "idle");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission Assignment</CardTitle>
        <CardDescription>
          Assign missions from the mission engine to available drones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Assignment Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Drone</label>
              <Select value={selectedDrone} onValueChange={setSelectedDrone}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a drone..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDrones.map(drone => (
                    <SelectItem key={drone.id} value={drone.id}>
                      {drone.name} (Battery: {drone.battery}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Mission</label>
              <Select value={selectedMission} onValueChange={setSelectedMission}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mission..." />
                </SelectTrigger>
                <SelectContent>
                  {missions.map(mission => (
                    <SelectItem key={mission.id} value={mission.id}>
                      {mission.name} ({mission.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAssignMission}
                disabled={!selectedDrone || !selectedMission || loading}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Assign Mission
              </Button>
            </div>
          </div>

          {/* Available Drones */}
          <div>
            <h4 className="font-semibold mb-3">Available Drones ({availableDrones.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableDrones.map(drone => (
                <Card key={drone.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{drone.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Battery: {drone.battery}% • Signal: {drone.signal}%
                      </div>
                    </div>
                    <Badge variant="secondary">Ready</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Available Missions */}
          <div>
            <h4 className="font-semibold mb-3">Available Missions ({missions.length})</h4>
            <div className="space-y-2">
              {missions.map(mission => (
                <Card key={mission.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">{mission.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {mission.code} • Priority: {mission.priority}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(mission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
