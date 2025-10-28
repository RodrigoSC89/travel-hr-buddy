/**
 * PATCH 426 - Mission Executor Component
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Zap, Target } from "lucide-react";
import type { Mission } from "../types";

interface MissionExecutorProps {
  missions: Mission[];
  onExecute: (missionId: string, simulationMode: boolean) => void;
}

export const MissionExecutor: React.FC<MissionExecutorProps> = ({ missions, onExecute }) => {
  const [selectedMission, setSelectedMission] = useState<string>("");
  const [simulationMode, setSimulationMode] = useState(false);

  const plannedMissions = missions.filter(m => m.status === "planned");

  const handleExecute = () => {
    if (selectedMission) {
      onExecute(selectedMission, simulationMode);
      setSelectedMission("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tactical Execution Simulator</CardTitle>
          <CardDescription>
            Execute missions in simulation or live mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simulation Mode Toggle */}
          <div className="flex items-center space-x-2 p-4 border rounded">
            <Switch
              id="simulation-mode"
              checked={simulationMode}
              onCheckedChange={setSimulationMode}
            />
            <div className="flex-1">
              <Label htmlFor="simulation-mode" className="font-medium">
                Simulation Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Run mission in safe simulation environment before live deployment
              </p>
            </div>
            <Zap className={simulationMode ? "h-5 w-5 text-yellow-500" : "h-5 w-5 text-muted-foreground"} />
          </div>

          {/* Mission Selection */}
          <div className="space-y-3">
            <Label>Select Mission to Execute</Label>
            {plannedMissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No planned missions available for execution
              </p>
            ) : (
              <div className="space-y-2">
                {plannedMissions.map(mission => (
                  <div
                    key={mission.id}
                    className={`p-4 border rounded cursor-pointer transition-colors ${
                      selectedMission === mission.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedMission(mission.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{mission.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mission.code} • {mission.type}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          mission.priority === "critical"
                            ? "bg-red-500/10 text-red-500"
                            : mission.priority === "high"
                            ? "bg-orange-500/10 text-orange-500"
                            : mission.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-green-500/10 text-green-500"
                        }
                      >
                        {mission.priority}
                      </Badge>
                    </div>
                    {mission.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {mission.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execute Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedMission}
            onClick={handleExecute}
          >
            <Play className="mr-2 h-4 w-4" />
            Execute Mission {simulationMode && "(Simulation)"}
          </Button>
        </CardContent>
      </Card>

      {/* Execution Phases Info */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Phases</CardTitle>
          <CardDescription>Standard mission execution workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { phase: "Pre-flight Check", description: "Verify all systems and personnel" },
              { phase: "Deploy Assets", description: "Deploy vessels, agents, and resources" },
              { phase: "Execute Mission", description: "Perform mission objectives and tasks" },
              { phase: "Monitor Progress", description: "Track real-time mission execution" },
              { phase: "Mission Debrief", description: "Review and document results" }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.phase}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
