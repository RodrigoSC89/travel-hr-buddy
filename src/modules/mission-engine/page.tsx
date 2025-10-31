/**
 * PATCH 540 - Mission Engine Page
 * UI for mission planning and execution with timeline view
 */

import React, { useState } from "react";
import { useMissionEngine } from "@/hooks/useMissionEngine";
import { Mission, MissionStep, MissionStepType } from "@/lib/mission/pipeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  X, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";

const stepTypeColors: Record<MissionStepType, string> = {
  scan: "bg-blue-500",
  collect: "bg-green-500",
  transmit: "bg-purple-500",
  move: "bg-yellow-500",
  wait: "bg-gray-500",
  coordinate: "bg-orange-500",
  custom: "bg-pink-500"
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  running: <Loader2 className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
  skipped: <X className="w-4 h-4" />
};

export default function MissionEnginePage() {
  // PATCH 624 - Preview Safe Mode
  const { isValidated, validationPassed, setSafeInterval } = usePreviewSafeMode({
    componentName: "MissionEnginePage",
    enableValidation: true,
    maxRenderTime: 3000,
    silenceErrors: true
  });

  const {
    missions,
    selectedMission,
    setSelectedMission,
    isExecuting,
    createMission,
    executeMission,
    pauseMission,
    cancelMission,
    restartStep,
    getAIRecommendation,
    deleteMission,
    getMission,
    clearAll
  } = useMissionEngine({
    enableSupabase: false
  });

  const [showCreateMission, setShowCreateMission] = useState(false);

  // Create sample mission
  const createSampleMission = () => {
    const steps: MissionStep[] = [
      {
        id: "step-1",
        name: "Initialize Scan",
        type: "scan",
        description: "Begin area scanning",
        timeout: 2000,
        maxRetries: 2,
        status: "pending" as const,
        retryCount: 0
      },
      {
        id: "step-2",
        name: "Coordinate Agents",
        type: "coordinate",
        description: "Synchronize all active agents",
        timeout: 1500,
        dependencies: ["step-1"],
        status: "pending" as const,
        retryCount: 0
      },
      {
        id: "step-3",
        name: "Collect Data",
        type: "collect",
        description: "Gather sensor data",
        timeout: 2500,
        dependencies: ["step-2"],
        status: "pending" as const,
        retryCount: 0
      },
      {
        id: "step-4",
        name: "Transmit Results",
        type: "transmit",
        description: "Send data to base station",
        timeout: 2000,
        dependencies: ["step-3"],
        status: "pending" as const,
        retryCount: 0
      }
    ];

    createMission({
      id: `mission-${Date.now()}`,
      name: "Deep Sea Survey",
      description: "Comprehensive underwater survey mission",
      steps,
      agents: ["drone-1", "sensor-1"]
    });
  };

  const currentMission = selectedMission ? getMission(selectedMission) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Engine</h1>
          <p className="text-muted-foreground">
            Plan and execute multi-agent missions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={createSampleMission}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Sample Mission
          </Button>
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={missions.length === 0}
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
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {missions.filter(m => m.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {missions.filter(m => m.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {missions.filter(m => m.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Missions</CardTitle>
            <CardDescription>Select a mission to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {missions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No missions yet. Create a sample mission to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedMission === mission.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedMission(mission.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{mission.name}</div>
                          <Badge variant={
                            mission.status === "completed" ? "default" :
                              mission.status === "failed" ? "destructive" :
                                mission.status === "active" ? "default" : "secondary"
                          }>
                            {mission.status}
                          </Badge>
                        </div>
                        {mission.description && (
                          <p className="text-xs text-muted-foreground">
                            {mission.description}
                          </p>
                        )}
                        <Progress value={mission.progress} className="h-1" />
                        <div className="text-xs text-muted-foreground">
                          {mission.progress}% complete
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mission Details & Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mission Timeline</CardTitle>
            <CardDescription>
              {currentMission ? `${currentMission.name} - Steps` : "Select a mission to view timeline"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentMission ? (
              <div className="text-center py-16 text-muted-foreground">
                Select a mission from the list to view details
              </div>
            ) : (
              <div className="space-y-6">
                {/* Mission Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeMission(currentMission.id)}
                    disabled={isExecuting || currentMission.status === "active" || currentMission.status === "completed"}
                  >
                    {currentMission.status === "active" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => pauseMission(currentMission.id)}
                    disabled={currentMission.status !== "active"}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => cancelMission(currentMission.id)}
                    disabled={currentMission.status === "completed" || currentMission.status === "cancelled"}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => deleteMission(currentMission.id)}
                    disabled={currentMission.status === "active"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {currentMission.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index < currentMission.steps.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10",
                          step.status === "completed" && "bg-green-500 text-white",
                          step.status === "failed" && "bg-red-500 text-white",
                          step.status === "running" && "bg-blue-500 text-white",
                          step.status === "pending" && "bg-gray-200 text-gray-600",
                          step.status === "skipped" && "bg-gray-400 text-white"
                        )}>
                          {statusIcons[step.status]}
                        </div>
                        <Card className="flex-1">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{step.name}</div>
                                  {step.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {step.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className={cn(stepTypeColors[step.type], "text-white border-0")}>
                                    {step.type}
                                  </Badge>
                                  {step.status === "failed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => restartStep(currentMission.id, step.id)}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => getAIRecommendation(currentMission.id, step.id)}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              {step.retryCount && step.retryCount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Retry attempt: {step.retryCount}/{step.maxRetries || 0}
                                </div>
                              )}
                              {step.dependencies && step.dependencies.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Depends on: {step.dependencies.join(", ")}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Suggestions */}
                {currentMission.aiSuggestions && currentMission.aiSuggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentMission.aiSuggestions.slice(-3).map((suggestion, idx) => (
                          <div key={idx} className="p-2 border rounded text-sm">
                            <div className="font-medium">{suggestion.suggestion}</div>
                            <div className="text-xs text-muted-foreground">{suggestion.reasoning}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
