/**
 * PATCH 534 - Drone Commander v2 with AI
 * Enhanced drone fleet control with AI task assignment and mission simulation
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Activity,
  Cpu,
  PlayCircle,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { droneCommanderService } from "@/modules/drone-commander/services/drone-service";
import { aiTaskAssignmentService, type FleetSimulation } from "@/modules/drone-commander/services/aiTaskAssignmentService";
import { MissionSimulationPanel } from "@/modules/drone-commander/components/MissionSimulationPanel";
import type { DroneStatus } from "@/modules/drone-commander/types";

const DroneCommanderV2Page: React.FC = () => {
  const [drones, setDrones] = useState<DroneStatus[]>([]);
  const [simulation, setSimulation] = useState<FleetSimulation | null>(null);
  const [missionName, setMissionName] = useState("");
  const [taskCount, setTaskCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState({
    totalDrones: 0,
    activeDrones: 0,
    totalSimulations: 0,
  });

  useEffect(() => {
    loadDrones();
  }, []);

  const loadDrones = async () => {
    setIsLoading(true);
    try {
      const data = await droneCommanderService.getDrones();
      setDrones(data);
      
      setStats({
        totalDrones: data.length,
        activeDrones: data.filter(d => d.status === 'flying' || d.status === 'hovering').length,
        totalSimulations: stats.totalSimulations,
      });
    } catch (error) {
      console.error("Error loading drones:", error);
      toast.error("Failed to load drone fleet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateMission = async () => {
    if (!missionName.trim()) {
      toast.error("Please enter a mission name");
      return;
    }

    if (drones.length === 0) {
      toast.error("No drones available for simulation");
      return;
    }

    try {
      toast.info("Generating mission simulation...");
      
      const newSimulation = await aiTaskAssignmentService.simulateMission(
        missionName,
        drones,
        taskCount
      );

      setSimulation(newSimulation);
      
      setStats(prev => ({
        ...prev,
        totalSimulations: prev.totalSimulations + 1,
      }));

      toast.success(`Mission simulation created with ${newSimulation.assignments.length} task assignments`);
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast.error("Failed to create simulation");
    }
  };

  const handleUpdateSimulation = (updatedSimulation: FleetSimulation) => {
    const updated = aiTaskAssignmentService.updateSimulation(updatedSimulation);
    setSimulation(updated);

    if (updated.status === 'completed') {
      toast.success("Mission simulation completed!");
    }
  };

  const handleStopSimulation = () => {
    setSimulation(null);
    toast.info("Simulation stopped");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Drone Commander v2</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 534 - AI-powered fleet control and mission simulation
            </p>
          </div>
        </div>
        <Badge variant="default" className="gap-2">
          <Cpu className="h-4 w-4" />
          AI Enabled
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrones}</div>
            <p className="text-xs text-muted-foreground">Fleet size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDrones}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Simulations Run</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSimulations}</div>
            <p className="text-xs text-muted-foreground">Total missions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="simulate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulate">
            <PlayCircle className="mr-2 h-4 w-4" />
            Mission Simulation
          </TabsTrigger>
          <TabsTrigger value="fleet">
            <List className="mr-2 h-4 w-4" />
            Fleet Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulate" className="space-y-4">
          {!simulation ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Mission Simulation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use AI to automatically assign tasks to your drone fleet
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mission Name</label>
                    <Input
                      value={missionName}
                      onChange={(e) => setMissionName(e.target.value)}
                      placeholder="Enter mission name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Tasks</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={taskCount}
                      onChange={(e) => setTaskCount(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSimulateMission}
                  disabled={isLoading || !missionName.trim()}
                  className="w-full"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Simulate Mission
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">AI will automatically:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Generate diverse tasks (patrol, inspection, delivery, etc.)</li>
                    <li>Analyze drone capabilities and availability</li>
                    <li>Assign tasks based on priority, battery, distance, and signal</li>
                    <li>Calculate estimated completion times</li>
                    <li>Provide real-time mission tracking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <MissionSimulationPanel
              simulation={simulation}
              onUpdate={handleUpdateSimulation}
              onStop={handleStopSimulation}
            />
          )}
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No drones available
                  </div>
                ) : (
                  drones.map((drone) => (
                    <div
                      key={drone.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{drone.name}</h4>
                          <Badge variant={
                            drone.status === 'flying' ? 'default' :
                            drone.status === 'idle' ? 'secondary' :
                            'destructive'
                          }>
                            {drone.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Battery: {drone.battery}% | Signal: {drone.signal}% | Speed: {drone.speed} km/h
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DroneCommanderV2Page;
