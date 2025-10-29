// PATCH 487.0 - Drone Commander v1
// Command interface with simulator-backed fleet control

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Drone, 
  PlayCircle, 
  StopCircle, 
  Navigation, 
  Home, 
  AlertTriangle, 
  Gauge,
  Battery,
  Signal,
  Activity
} from "lucide-react";
import { droneSimulator, DroneStatus, CommandResult } from "@/modules/drone-commander/simulator/drone-simulator";
import { useToast } from "@/hooks/use-toast";

export default function DroneCommanderV1() {
  const [drones, setDrones] = useState<DroneStatus[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<DroneStatus | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [targetAltitude, setTargetAltitude] = useState("100");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize drones
    setDrones(droneSimulator.getDrones());
    setSelectedDrone(droneSimulator.getDrones()[0]);

    // Update drones every 2 seconds
    const interval = setInterval(() => {
      setDrones(droneSimulator.getDrones());
      if (selectedDrone) {
        setSelectedDrone(droneSimulator.getDrone(selectedDrone.id) || null);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedDrone?.id]);

  const executeCommand = async (command: string, params?: any) => {
    if (!selectedDrone) {
      toast({
        title: "No Drone Selected",
        description: "Please select a drone first",
        variant: "destructive",
      });
      return;
    }

    const result = await droneSimulator.sendCommand(
      selectedDrone.id,
      command as any,
      params
    );

    setCommandHistory((prev) => [result, ...prev].slice(0, 20));

    toast({
      title: result.success ? "Command Executed" : "Command Failed",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const toggleSimulation = () => {
    if (isSimulationRunning) {
      droneSimulator.stopSimulation();
      setIsSimulationRunning(false);
      toast({ title: "Simulation Stopped", description: "MQTT connection closed" });
    } else {
      droneSimulator.startSimulation();
      setIsSimulationRunning(true);
      toast({ title: "Simulation Started", description: "MQTT connection active" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      idle: "bg-gray-500",
      flying: "bg-blue-500",
      hovering: "bg-green-500",
      returning: "bg-yellow-500",
      landing: "bg-orange-500",
      offline: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 60) return "text-green-500";
    if (battery >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Drone className="h-8 w-8" />
            Drone Commander v1
          </h1>
          <p className="text-muted-foreground">
            Control and monitor UAV fleet with real-time telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">PATCH 487.0</Badge>
          <Button
            onClick={toggleSimulation}
            variant={isSimulationRunning ? "destructive" : "default"}
          >
            {isSimulationRunning ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop MQTT
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start MQTT
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Drone List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Fleet Status</CardTitle>
            <CardDescription>{drones.length} UAVs Active</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {drones.map((drone) => (
                  <div
                    key={drone.id}
                    onClick={() => setSelectedDrone(drone)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDrone?.id === drone.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{drone.name}</span>
                      <Badge className={getStatusColor(drone.status)}>
                        {drone.status}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Battery className={`h-3 w-3 ${getBatteryColor(drone.battery)}`} />
                        <span>{drone.battery.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Signal className="h-3 w-3" />
                        <span>{drone.signal}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-3 w-3" />
                        <span>{drone.altitude}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Command Interface */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDrone ? `${selectedDrone.name} Control` : "Select a Drone"}
            </CardTitle>
            <CardDescription>
              Execute commands to control the selected UAV
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDrone ? (
              <div className="space-y-4">
                {/* Drone Status Display */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Battery</Label>
                    <div className={`text-2xl font-bold ${getBatteryColor(selectedDrone.battery)}`}>
                      {selectedDrone.battery.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Altitude</Label>
                    <div className="text-2xl font-bold">{selectedDrone.altitude}m</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Speed</Label>
                    <div className="text-2xl font-bold">{selectedDrone.speed}m/s</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Signal</Label>
                    <div className="text-2xl font-bold">{selectedDrone.signal}%</div>
                  </div>
                </div>

                {/* Command Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => executeCommand("takeoff")}
                    disabled={selectedDrone.status !== "idle"}
                    className="w-full"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Takeoff
                  </Button>
                  <Button
                    onClick={() => executeCommand("land")}
                    disabled={selectedDrone.status === "idle" || selectedDrone.status === "landing"}
                    variant="outline"
                    className="w-full"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Land
                  </Button>
                  <Button
                    onClick={() => executeCommand("hover")}
                    disabled={selectedDrone.status !== "flying"}
                    variant="outline"
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Hover
                  </Button>
                  <Button
                    onClick={() => executeCommand("return_home")}
                    disabled={selectedDrone.status === "idle"}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Return Home
                  </Button>
                </div>

                {/* Set Altitude */}
                <div className="space-y-2">
                  <Label>Set Altitude (meters)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={targetAltitude}
                      onChange={(e) => setTargetAltitude(e.target.value)}
                      placeholder="Enter altitude (0-500)"
                      min="0"
                      max="500"
                    />
                    <Button
                      onClick={() =>
                        executeCommand("set_altitude", {
                          altitude: parseInt(targetAltitude),
                        })
                      }
                      disabled={
                        selectedDrone.status !== "flying" &&
                        selectedDrone.status !== "hovering"
                      }
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Set
                    </Button>
                  </div>
                </div>

                {/* Emergency Stop */}
                <Button
                  onClick={() => executeCommand("emergency_stop")}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  EMERGENCY STOP
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a drone from the fleet to begin operations
              </p>
            )}
          </CardContent>
        </Card>

        {/* Command History */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Command History</CardTitle>
            <CardDescription>
              {commandHistory.length} commands executed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {commandHistory.map((cmd, index) => (
                  <div
                    key={`${cmd.droneId}-${cmd.timestamp}-${index}`}
                    className={`p-2 rounded text-xs ${
                      cmd.success ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{cmd.command}</span>
                      <Badge
                        variant={cmd.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {cmd.success ? "OK" : "FAIL"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{cmd.message}</p>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{cmd.executionTime}ms</span>
                      <span>{new Date(cmd.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
                {commandHistory.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No commands executed yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
