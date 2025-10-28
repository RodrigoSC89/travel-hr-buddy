/**
 * PATCH 427 - Flight Scheduler Component
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { droneCommanderService } from "../services/drone-service";
import type { DroneStatus, DroneFlight } from "../types";

interface FlightSchedulerProps {
  drones: DroneStatus[];
  flights: DroneFlight[];
  onRefresh: () => void;
}

export const FlightScheduler: React.FC<FlightSchedulerProps> = ({
  drones,
  flights,
  onRefresh
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    droneId: "",
    name: "",
    scheduledStart: new Date().toISOString().slice(0, 16)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await droneCommanderService.createFlight({
        droneId: formData.droneId,
        name: formData.name,
        status: "scheduled",
        scheduledStart: formData.scheduledStart,
        waypoints: []
      });
      toast.success("Flight scheduled successfully");
      setShowForm(false);
      setFormData({ droneId: "", name: "", scheduledStart: new Date().toISOString().slice(0, 16) });
      onRefresh();
    } catch (error) {
      toast.error("Failed to schedule flight");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Flight Scheduler</CardTitle>
            <CardDescription>Schedule and manage drone flights</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Flight
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drone">Drone</Label>
                <Select value={formData.droneId} onValueChange={(value) => setFormData({ ...formData, droneId: value })}>
                  <SelectTrigger id="drone">
                    <SelectValue placeholder="Select drone" />
                  </SelectTrigger>
                  <SelectContent>
                    {drones.map(drone => (
                      <SelectItem key={drone.id} value={drone.id}>
                        {drone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Flight Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Patrol"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledStart">Scheduled Start</Label>
                <Input
                  id="scheduledStart"
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Flights List */}
          <div className="space-y-2">
            {flights.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No scheduled flights
              </p>
            ) : (
              flights.map(flight => (
                <div key={flight.id} className="p-4 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{flight.name}</h4>
                    <Badge
                      variant="outline"
                      className={
                        flight.status === "in-flight"
                          ? "bg-green-500/10 text-green-500"
                          : flight.status === "scheduled"
                          ? "bg-blue-500/10 text-blue-500"
                          : flight.status === "completed"
                          ? "bg-gray-500/10 text-gray-500"
                          : "bg-red-500/10 text-red-500"
                      }
                    >
                      {flight.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(flight.scheduledStart).toLocaleString()}</span>
                    </div>
                    <div>
                      Drone: {drones.find(d => d.id === flight.droneId)?.name || "Unknown"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
