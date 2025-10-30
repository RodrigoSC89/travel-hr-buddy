/**
 * PATCH 539 - Drone Commander Page
 * UI for submarine drone control and monitoring
 */

import React from "react";
import { useDroneState } from "@/hooks/useDroneState";
import { DroneCommand, DroneState } from "@/lib/drone/command-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, 
  Pause, 
  Home, 
  ArrowDown, 
  ArrowUp, 
  Scan, 
  AlertTriangle,
  Plus,
  Trash2,
  Battery,
  Signal,
  Thermometer
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  idle: "bg-gray-500",
  active: "bg-green-500",
  paused: "bg-yellow-500",
  returning: "bg-blue-500",
  error: "bg-red-500",
  offline: "bg-gray-700"
};

const commandButtons: { cmd: DroneCommand; label: string; icon: React.ReactNode; variant?: "default" | "destructive" }[] = [
  { cmd: "pause", label: "Pause", icon: <Pause className="w-4 h-4" /> },
  { cmd: "resume", label: "Resume", icon: <Play className="w-4 h-4" /> },
  { cmd: "return", label: "Return", icon: <Home className="w-4 h-4" /> },
  { cmd: "dive", label: "Dive", icon: <ArrowDown className="w-4 h-4" /> },
  { cmd: "surface", label: "Surface", icon: <ArrowUp className="w-4 h-4" /> },
  { cmd: "scan", label: "Scan", icon: <Scan className="w-4 h-4" /> },
  { cmd: "emergency_stop", label: "Emergency", icon: <AlertTriangle className="w-4 h-4" />, variant: "destructive" }
];

export default function DroneCommanderPage() {
  const {
    drones,
    selectedDrone,
    setSelectedDrone,
    isConnected,
    isSending,
    sendCommand,
    isDroneAvailable,
    registerMockDrone,
    clearDrones
  } = useDroneState({
    enableSupabase: false,
    autoRefresh: true
  });

  // Add sample drones for testing
  const addSampleDrones = () => {
    const samples: DroneState[] = [
      {
        id: "sub-alpha",
        name: "Submarine Alpha",
        status: "active",
        position: { lat: -23.5505, lng: -46.6333, depth: 150 },
        battery: 75,
        signal: 85,
        temperature: 15,
        lastUpdate: new Date().toISOString(),
        mission: "Deep Sea Survey"
      },
      {
        id: "sub-beta",
        name: "Submarine Beta",
        status: "idle",
        position: { lat: -23.5520, lng: -46.6350, depth: 0 },
        battery: 92,
        signal: 95,
        temperature: 18,
        lastUpdate: new Date().toISOString()
      }
    ];

    samples.forEach(drone => registerMockDrone(drone));
  };

  const handleCommand = async (droneId: string, command: DroneCommand) => {
    const params = command === "dive" ? { depth: 200 } : undefined;
    await sendCommand(droneId, command, params);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drone Commander</h1>
          <p className="text-muted-foreground">
            Control and monitor submarine drones
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button
            variant="outline"
            onClick={addSampleDrones}
            disabled={drones.length > 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample Drones
          </Button>
          <Button
            variant="outline"
            onClick={clearDrones}
            disabled={drones.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {drones.filter(d => d.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {drones.filter(d => d.status === "idle").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drones.length > 0 
                ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drones Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Submarine Drones</CardTitle>
          <CardDescription>
            Select a drone to view details and send commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No drones registered. Click "Add Sample Drones" to get started.
            </div>
          ) : (
            <Accordion type="single" collapsible value={selectedDrone || undefined} onValueChange={setSelectedDrone}>
              {drones.map((drone) => (
                <AccordionItem key={drone.id} value={drone.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn("w-3 h-3 rounded-full", statusColors[drone.status])} />
                      <div className="text-left">
                        <div className="font-medium">{drone.name}</div>
                        <div className="text-sm text-muted-foreground">{drone.id}</div>
                      </div>
                      <div className="ml-auto flex gap-2 mr-4">
                        <Badge variant="outline" className="gap-1">
                          <Battery className="w-3 h-3" />
                          {drone.battery}%
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Signal className="w-3 h-3" />
                          {drone.signal}%
                        </Badge>
                        <Badge variant="secondary">
                          {drone.status}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Drone Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {drone.position && (
                          <div>
                            <div className="text-muted-foreground">Position</div>
                            <div className="font-mono">
                              {drone.position.lat.toFixed(4)}, {drone.position.lng.toFixed(4)}
                            </div>
                            <div className="font-mono text-xs">Depth: {drone.position.depth}m</div>
                          </div>
                        )}
                        {drone.temperature !== undefined && (
                          <div>
                            <div className="text-muted-foreground">Temperature</div>
                            <div className="flex items-center gap-1">
                              <Thermometer className="w-4 h-4" />
                              {drone.temperature}°C
                            </div>
                          </div>
                        )}
                        {drone.mission && (
                          <div>
                            <div className="text-muted-foreground">Mission</div>
                            <div>{drone.mission}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-muted-foreground">Last Update</div>
                          <div className="text-xs">
                            {new Date(drone.lastUpdate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {/* Commands */}
                      <div>
                        <div className="text-sm font-medium mb-2">Commands</div>
                        <div className="flex flex-wrap gap-2">
                          {commandButtons.map(({ cmd, label, icon, variant }) => (
                            <Button
                              key={cmd}
                              size="sm"
                              variant={variant || "outline"}
                              disabled={!isDroneAvailable(drone.id) || isSending}
                              onClick={() => handleCommand(drone.id, cmd)}
                            >
                              {icon}
                              <span className="ml-2">{label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Errors */}
                      {drone.errors && drone.errors.length > 0 && (
                        <div className="text-sm text-red-600">
                          <div className="font-medium">Errors:</div>
                          <ul className="list-disc list-inside">
                            {drone.errors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
