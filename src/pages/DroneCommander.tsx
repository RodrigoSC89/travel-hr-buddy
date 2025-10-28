// @ts-nocheck
/**
 * PATCH 427 - Drone Commander UI
 * Interface and orchestration for UAV drone control
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plane,
  MapPin,
  Battery,
  Signal,
  Clock,
  Play,
  Square,
  Home,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { DroneControlPanel } from "./components/DroneControlPanel";
import { DroneMap } from "./components/DroneMap";
import { FlightScheduler } from "./components/FlightScheduler";
import { droneCommanderService } from "./services/drone-service";
import type { DroneStatus, DroneFlight } from "./types";

const DroneCommanderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("control");
  const [drones, setDrones] = useState<DroneStatus[]>([]);
  const [flights, setFlights] = useState<DroneFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [dronesData, flightsData] = await Promise.all([
        droneCommanderService.getDrones(),
        droneCommanderService.getFlights()
      ]);
      setDrones(dronesData);
      setFlights(flightsData);
    } catch (error) {
      console.error("Error loading drone data:", error);
    }
  };

  const handleCommand = async (droneId: string, command: string) => {
    try {
      await droneCommanderService.sendCommand(droneId, command);
      toast.success(`Command ${command} sent to drone ${droneId}`);
      loadData();
    } catch (error) {
      console.error("Error sending command:", error);
      toast.error("Failed to send command");
    }
  };

  const activeDrones = drones.filter(d => d.status === "flying" || d.status === "hovering");
  const idleDrones = drones.filter(d => d.status === "idle");
  const scheduledFlights = flights.filter(f => f.status === "scheduled");
  const activeFlights = flights.filter(f => f.status === "in-flight");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plane className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Drone Commander</h1>
            <p className="text-sm text-muted-foreground">
              UAV control, monitoring, and flight scheduling
            </p>
          </div>
        </div>
        <Button onClick={loadData} variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drones.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeDrones.length} active, {idleDrones.length} idle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlights.length}</div>
            <p className="text-xs text-muted-foreground">Currently flying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledFlights.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming flights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Drone Status */}
      <Card>
        <CardHeader>
          <CardTitle>Drone Fleet Status</CardTitle>
          <CardDescription>Real-time status of all registered drones</CardDescription>
        </CardHeader>
        <CardContent>
          {drones.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No drones registered
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drones.map(drone => (
                <Card
                  key={drone.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedDrone === drone.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedDrone(drone.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{drone.name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          drone.status === "flying" || drone.status === "hovering"
                            ? "bg-green-500/10 text-green-500"
                            : drone.status === "idle"
                            ? "bg-blue-500/10 text-blue-500"
                            : drone.status === "emergency"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-gray-500/10 text-gray-500"
                        }
                      >
                        {drone.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                        <span>{drone.battery}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4 text-muted-foreground" />
                        <span>{drone.signal}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Alt: {drone.altitude}m • Speed: {drone.speed}m/s
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="control">
            <Plane className="mr-2 h-4 w-4" />
            Control
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="scheduler">
            <Calendar className="mr-2 h-4 w-4" />
            Scheduler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-4">
          <DroneControlPanel 
            drones={drones}
            selectedDrone={selectedDrone}
            onCommand={handleCommand}
            onSelectDrone={setSelectedDrone}
          />
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <DroneMap 
            drones={drones}
            flights={flights}
            selectedDrone={selectedDrone}
            onSelectDrone={setSelectedDrone}
          />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-4">
          <FlightScheduler 
            drones={drones}
            flights={flights}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DroneCommanderPage;
