/**
 * PATCH 534 - Mission Simulation Panel
 * Display and control fleet mission simulations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { FleetSimulation, TaskAssignment } from "../services/aiTaskAssignmentService";

interface MissionSimulationPanelProps {
  simulation: FleetSimulation;
  onUpdate: (simulation: FleetSimulation) => void;
  onStop: () => void;
}

export const MissionSimulationPanel: React.FC<MissionSimulationPanelProps> = ({
  simulation,
  onUpdate,
  onStop,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      onUpdate(simulation);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, simulation, onUpdate]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    onStop();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'assigned': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'in_progress': return <Badge variant="secondary">In Progress</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'assigned': return <Badge variant="outline">Assigned</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  const getTaskProgress = (assignment: TaskAssignment): number => {
    const now = Date.now();
    const elapsed = now - assignment.assignedAt;
    const duration = assignment.estimatedCompletion - assignment.assignedAt;
    return Math.min(100, (elapsed / duration) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{simulation.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fleet Simulation - {simulation.drones.length} Drones, {simulation.tasks.length} Tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={isRunning ? "destructive" : "default"}
                onClick={handlePlayPause}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" onClick={handleStop}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulation.statistics.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {simulation.statistics.completedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {simulation.statistics.failedTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((simulation.statistics.completedTasks / simulation.statistics.totalTasks) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Task Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {simulation.assignments.map((assignment, index) => {
              const progress = getTaskProgress(assignment);
              
              return (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* Assignment Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {assignment.task.type.charAt(0).toUpperCase() + assignment.task.type.slice(1)}
                        </h4>
                        {getPriorityBadge(assignment.priority)}
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.task.description}
                      </p>
                    </div>
                  </div>

                  {/* Drone Assignment */}
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">{assignment.droneName}</span>
                  </div>

                  {/* Location */}
                  <div className="text-sm text-muted-foreground">
                    Location: {assignment.task.location.latitude.toFixed(4)}, 
                    {assignment.task.location.longitude.toFixed(4)}
                    {assignment.task.location.altitude && 
                      ` @ ${assignment.task.location.altitude}m`
                    }
                  </div>

                  {/* Progress Bar */}
                  {(assignment.status === 'in_progress' || assignment.status === 'assigned') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* ETA */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {assignment.status === 'completed' 
                        ? 'Completed' 
                        : `ETA: ${new Date(assignment.estimatedCompletion).toLocaleTimeString()}`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {simulation.assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No task assignments yet. Start the simulation to see assignments.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
