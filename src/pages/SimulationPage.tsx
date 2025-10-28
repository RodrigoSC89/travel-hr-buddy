/**
 * PATCH 211.0 - Mission Simulation Page
 * 
 * UI panel for creating and running mission simulations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FlaskConical, Play, Trash2, Eye } from "lucide-react";
import { missionSimulationCore } from "@/ai/missionSimulationCore";
import type { SimulationBlueprint, FailureInjection } from "@/ai/missionSimulationCore";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [failureInjections, setFailureInjections] = useState<FailureInjection>({
    system_crash: false,
    comms_loss: false,
    crew_delay: false,
    weather_deterioration: false,
    equipment_failure: false,
  });

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      const sims = await missionSimulationCore.listSimulations();
      setSimulations(sims);
    } catch (error) {
      logger.error("[SimulationPage] Failed to load simulations", { error });
      toast.error("Failed to load simulations");
    }
  };

  const createSimulation = async () => {
    if (!name) {
      toast.error("Please provide a simulation name");
      return;
    }

    try {
      const blueprint: SimulationBlueprint = {
        name,
        description,
        vessels: [
          {
            id: "vessel-1",
            name: "MV Atlantic",
            type: "cargo",
            capacity: 50000,
            currentLocation: { latitude: -23.5505, longitude: -46.6333 },
            status: "operational",
            crew_count: 20,
          },
        ],
        weather: [
          {
            location: { latitude: -23.5505, longitude: -46.6333 },
            temperature: 25,
            wind_speed: 15,
            wind_direction: 180,
            visibility: 10000,
            sea_state: "moderate",
            timestamp: new Date(),
            risk_level: "safe",
          },
        ],
        crew: [
          {
            id: "crew-1",
            name: "Captain Smith",
            role: "Captain",
            experience_years: 15,
            certifications: ["Master Mariner", "STCW"],
            status: "available",
          },
          {
            id: "crew-2",
            name: "Engineer Jones",
            role: "Chief Engineer",
            experience_years: 10,
            certifications: ["Marine Engineering", "STCW"],
            status: "available",
          },
        ],
        payload: [
          {
            id: "payload-1",
            type: "general_cargo",
            weight: 25000,
            volume: 5000,
            hazard_level: "none",
            special_requirements: [],
          },
        ],
        riskFactors: [
          {
            id: "risk-1",
            category: "weather",
            description: "Potential storm in route",
            probability: 0.3,
            impact: 5,
            mitigation: "Monitor weather closely and adjust route if needed",
          },
        ],
        failureInjections,
        duration_hours: 24,
      };

      const simulationId = await missionSimulationCore.createSimulation(blueprint);
      toast.success("Simulation created successfully");
      
      // Reset form
      setName("");
      setDescription("");
      setFailureInjections({
        system_crash: false,
        comms_loss: false,
        crew_delay: false,
        weather_deterioration: false,
        equipment_failure: false,
      });

      await loadSimulations();
    } catch (error) {
      logger.error("[SimulationPage] Failed to create simulation", { error });
      toast.error("Failed to create simulation");
    }
  };

  const runSimulation = async (simulationId: string) => {
    setIsRunning(true);
    try {
      const outcome = await missionSimulationCore.runSimulation(simulationId);
      toast.success(`Simulation completed: ${outcome.success ? "Success" : "Failed"}`);
      await loadSimulations();
    } catch (error) {
      logger.error("[SimulationPage] Failed to run simulation", { error });
      toast.error("Failed to run simulation");
    } finally {
      setIsRunning(false);
    }
  };

  const deleteSimulation = async (simulationId: string) => {
    try {
      await missionSimulationCore.deleteSimulation(simulationId);
      toast.success("Simulation deleted");
      await loadSimulations();
    } catch (error) {
      logger.error("[SimulationPage] Failed to delete simulation", { error });
      toast.error("Failed to delete simulation");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
    case "completed":
      return "default";
    case "running":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8" />
            Mission Simulations
          </h1>
          <p className="text-muted-foreground">
            Create and run AI-powered mission simulations
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Simulation</TabsTrigger>
          <TabsTrigger value="list">Simulations List</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Simulation</CardTitle>
              <CardDescription>Configure mission parameters and failure scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Simulation Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Atlantic Cargo Transport"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the mission scenario..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Failure Injection Toggles</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-crash" className="cursor-pointer">
                      System Crash
                    </Label>
                    <Switch
                      id="system-crash"
                      checked={failureInjections.system_crash}
                      onCheckedChange={(checked) =>
                        setFailureInjections({ ...failureInjections, system_crash: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comms-loss" className="cursor-pointer">
                      Communications Loss
                    </Label>
                    <Switch
                      id="comms-loss"
                      checked={failureInjections.comms_loss}
                      onCheckedChange={(checked) =>
                        setFailureInjections({ ...failureInjections, comms_loss: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crew-delay" className="cursor-pointer">
                      Crew Delay
                    </Label>
                    <Switch
                      id="crew-delay"
                      checked={failureInjections.crew_delay}
                      onCheckedChange={(checked) =>
                        setFailureInjections({ ...failureInjections, crew_delay: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weather" className="cursor-pointer">
                      Weather Deterioration
                    </Label>
                    <Switch
                      id="weather"
                      checked={failureInjections.weather_deterioration}
                      onCheckedChange={(checked) =>
                        setFailureInjections({ ...failureInjections, weather_deterioration: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="equipment" className="cursor-pointer">
                      Equipment Failure
                    </Label>
                    <Switch
                      id="equipment"
                      checked={failureInjections.equipment_failure}
                      onCheckedChange={(checked) =>
                        setFailureInjections({ ...failureInjections, equipment_failure: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={createSimulation} className="w-full">
                Create Simulation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulations</CardTitle>
              <CardDescription>View and manage all simulations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {simulations.map((sim) => (
                    <Card key={sim.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{sim.name}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(sim.status)}>
                            {sim.status}
                          </Badge>
                        </div>
                        <CardDescription>{sim.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {sim.predictions && (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Success:</span>{" "}
                              {(sim.predictions.success_probability * 100).toFixed(0)}%
                            </div>
                            <div>
                              <span className="text-muted-foreground">Risk:</span>{" "}
                              {sim.predictions.risk_score.toFixed(1)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>{" "}
                              {sim.predictions.estimated_duration_hours.toFixed(0)}h
                            </div>
                          </div>
                        )}

                        {sim.outcome && (
                          <div className="p-3 bg-muted rounded space-y-2">
                            <div className="font-medium">Outcome</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Success: {sim.outcome.success ? "Yes" : "No"}</div>
                              <div>Completion: {sim.outcome.completion_percentage}%</div>
                              <div>Incidents: {sim.outcome.incidents?.length || 0}</div>
                              <div>
                                Safety: {sim.outcome.performance_metrics?.safety_score.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runSimulation(sim.id)}
                            disabled={isRunning || sim.status === "running"}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {sim.status === "running" ? "Running..." : "Run"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSimulation(sim)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSimulation(sim.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {simulations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No simulations created yet
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
}
