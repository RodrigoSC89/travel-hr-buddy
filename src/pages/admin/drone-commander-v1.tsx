/**
 * PATCH 487 - Enhanced Drone Commander v1
 * Central control for autonomous drone fleet with simulator
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Radio, 
  Activity, 
  FileText, 
  Plane,
  Battery,
  Signal,
  Play,
  Square,
  Home,
  AlertTriangle,
  Send,
  ArrowUp,
  ArrowDown,
  Pause
} from "lucide-react";
import { toast } from "sonner";
import { droneSimulator, type DroneSimulation, type CommandResponse } from "@/modules/drone-commander/simulator/drone-simulator";

const DroneCommanderEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [drones, setDrones] = useState<DroneSimulation[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandResponse[]>([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadDrones();
    connectToMQTT();
    
    return () => {
      droneSimulator.stopSimulation();
      droneSimulator.disconnectMQTT();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (simulating) {
      droneSimulator.startSimulation();
      interval = setInterval(() => {
        loadDrones();
      }, 2000);
    } else {
      droneSimulator.stopSimulation();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulating]);

  const loadDrones = () => {
    const dronesData = droneSimulator.getDrones();
    setDrones(dronesData);
    setCommandHistory(droneSimulator.getCommandHistory(20));
  };

  const connectToMQTT = async () => {
    try {
      const connected = await droneSimulator.connectMQTT();
      setMqttConnected(connected);
      toast.success("MQTT connection established");
    } catch (error) {
      toast.error("Failed to connect to MQTT");
    }
  };

  const sendCommand = async (droneId: string, command: string, params?: any) => {
    try {
      const response = await droneSimulator.sendCommand(droneId, command, params);
      
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
      
      loadDrones();
    } catch (error) {
      toast.error("Failed to send command");
    }
  };

  const activeDrones = drones.filter(d => d.status === "flying" || d.status === "hovering");
  const idleDrones = drones.filter(d => d.status === "idle" || d.status === "online");
  const offlineDrones = drones.filter(d => d.status === "offline");
  const averageBattery = drones.length > 0 
    ? drones.reduce((sum, d) => sum + d.battery, 0) / drones.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Drone Commander v1</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 487 - Autonomous UAV fleet control center with simulator
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mqttConnected ? "default" : "secondary"}>
            {mqttConnected ? "● MQTT Connected" : "○ MQTT Offline"}
          </Badge>
          <Badge variant={simulating ? "default" : "secondary"}>
            {simulating ? "● Simulating" : "○ Paused"}
          </Badge>
          <Button 
            onClick={() => setSimulating(!simulating)} 
            variant={simulating ? "destructive" : "default"}
            size="sm"
          >
            {simulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {simulating ? "Stop Simulation" : "Start Simulation"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              Flying or hovering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Idle/Ready</CardTitle>
            <Plane className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{idleDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for deployment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageBattery.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Fleet average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Plane className="h-4 w-4 mr-2" />
            Fleet Overview
          </TabsTrigger>
          <TabsTrigger value="control">
            <Send className="h-4 w-4 mr-2" />
            Command Center
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Command History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {drones.map((drone) => (
              <DroneStatusCard 
                key={drone.id} 
                drone={drone} 
                onSelect={() => setSelectedDrone(drone.id)}
                isSelected={selectedDrone === drone.id}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Drone Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Drone</CardTitle>
                <CardDescription>Choose a drone to send commands</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {drones.map((drone) => (
                      <Button
                        key={drone.id}
                        variant={selectedDrone === drone.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedDrone(drone.id)}
                      >
                        <Plane className="h-4 w-4 mr-2" />
                        {drone.name} - {drone.status}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Command Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Command Interface</CardTitle>
                <CardDescription>
                  {selectedDrone 
                    ? `Control ${drones.find(d => d.id === selectedDrone)?.name}`
                    : "Select a drone to send commands"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "takeoff")}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Take Off
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "land")}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Land
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "hover")}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Hover
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "return_home")}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Return Home
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "set_altitude", { altitude: 100 })}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    Set Alt 100m
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "set_altitude", { altitude: 200 })}
                    disabled={!selectedDrone}
                    className="w-full"
                  >
                    Set Alt 200m
                  </Button>
                  <Button
                    onClick={() => selectedDrone && sendCommand(selectedDrone, "emergency_stop")}
                    disabled={!selectedDrone}
                    variant="destructive"
                    className="w-full col-span-2"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    EMERGENCY STOP
                  </Button>
                </div>

                {selectedDrone && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Selected Drone Status</h4>
                    {(() => {
                      const drone = drones.find(d => d.id === selectedDrone);
                      if (!drone) return null;
                      return (
                        <div className="space-y-1 text-xs">
                          <div>Status: <Badge variant="outline">{drone.status}</Badge></div>
                          <div>Battery: {drone.battery.toFixed(1)}%</div>
                          <div>Signal: {drone.signal.toFixed(0)}%</div>
                          <div>Altitude: {drone.position.altitude.toFixed(0)}m</div>
                          <div>Speed: {drone.speed.toFixed(1)}m/s</div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command History & Responses</CardTitle>
              <CardDescription>Real-time log of all commands and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {commandHistory.map((cmd, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 border rounded-lg ${
                        cmd.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {cmd.command.toUpperCase()} → {cmd.droneId}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {cmd.message}
                          </div>
                        </div>
                        <Badge variant={cmd.success ? "default" : "destructive"}>
                          {cmd.success ? "✓ OK" : "✗ FAIL"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                        <span>{cmd.timestamp.toLocaleTimeString()}</span>
                        <span>Exec: {cmd.executionTime}ms</span>
                      </div>
                    </div>
                  ))}
                  {commandHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No commands sent yet. Use the Command Center to control drones.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper Component
const DroneStatusCard: React.FC<{
  drone: DroneSimulation;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ drone, onSelect, isSelected }) => {
  const statusColor = {
    online: "text-green-500",
    offline: "text-red-500",
    flying: "text-blue-500",
    hovering: "text-yellow-500",
    idle: "text-gray-500",
    emergency: "text-red-700"
  }[drone.status];

  return (
    <Card 
      className={`cursor-pointer transition-colors ${isSelected ? "border-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className={`h-6 w-6 ${statusColor}`} />
            <div>
              <div className="font-bold">{drone.name}</div>
              <div className="text-xs text-muted-foreground">{drone.model}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Battery className="h-4 w-4" />
                <span className="text-sm font-medium">{drone.battery.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Signal className="h-4 w-4" />
                <span className="text-sm">{drone.signal.toFixed(0)}%</span>
              </div>
            </div>
            <Badge variant={drone.status === "online" || drone.status === "flying" || drone.status === "hovering" ? "default" : "secondary"}>
              {drone.status}
            </Badge>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>Alt: {drone.position.altitude.toFixed(0)}m</div>
          <div>Spd: {drone.speed.toFixed(1)}m/s</div>
          <div>Hdg: {drone.position.heading.toFixed(0)}°</div>
          <div>Upd: {new Date(drone.lastUpdate).toLocaleTimeString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DroneCommanderEnhanced;
