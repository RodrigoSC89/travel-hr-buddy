/**
 * PATCH 452 - Mission Execution Component
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Activity } from "lucide-react";
import { toast } from "sonner";
import { missionControlService } from "../services/mission-control-service";
import type { Mission, MissionTask } from "../types";

interface MissionExecutionProps {
  missions: Mission[];
  tasks: MissionTask[];
  onRefresh: () => void;
}

export const MissionExecution: React.FC<MissionExecutionProps> = ({ missions, tasks, onRefresh }) => {
  const handleStart = async (id: string) => {
    try {
      await missionControlService.updateMission(id, { status: "in-progress" });
      toast.success("Mission started");
      onRefresh();
    } catch (error) {
      toast.error("Failed to start mission");
    }
  };

  const handlePause = async (id: string) => {
    try {
      await missionControlService.updateMission(id, { status: "paused" });
      toast.info("Mission paused");
      onRefresh();
    } catch (error) {
      toast.error("Failed to pause mission");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await missionControlService.updateMission(id, { status: "completed" });
      toast.success("Mission completed");
      onRefresh();
    } catch (error) {
      toast.error("Failed to complete mission");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission Execution</CardTitle>
        <CardDescription>Monitor and control active missions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {missions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active missions
            </div>
          ) : (
            missions.map(mission => {
              const missionTasks = tasks.filter(t => t.missionId === mission.id);
              const completedTasks = missionTasks.filter(t => t.status === "completed").length;
              const progress = missionTasks.length > 0 
                ? (completedTasks / missionTasks.length) * 100 
                : 0;

              return (
                <Card key={mission.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                        <span className="font-semibold">{mission.name}</span>
                        <Badge variant="outline">{mission.code}</Badge>
                      </div>
                      <Badge variant="default">{mission.status}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {mission.description}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {completedTasks}/{missionTasks.length} tasks</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleStart(mission.id)}>
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePause(mission.id)}>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleComplete(mission.id)}>
                        <Square className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
