/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 184.0 - Autonomous Submission System (AutoSub)
 * AI-driven autonomous mission planning for underwater operations
 * 
 * Features:
 * - Area definition and visualization
 * - Environmental parameter configuration
 * - Autonomous waypoint generation
 * - Real-time mission feedback
 * - Mission status tracking
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Navigation,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  Map,
  Settings,
  Activity,
  Download,
} from "lucide-react";
import MissionPlanner, { 
  SurveyArea, 
  EnvironmentalParams, 
  AutoMissionPlan,
  MissionFeedback 
} from "./mission-planner";

const AutoSub: React.FC = () => {
  const [planner] = useState(() => new MissionPlanner());
  const [currentPlan, setCurrentPlan] = useState<AutoMissionPlan | null>(null);
  const [feedback, setFeedback] = useState<MissionFeedback[]>([]);
  
  // Area configuration
  const [areaName, setAreaName] = useState("Survey Zone Alpha");
  const [northBound, setNorthBound] = useState(-23.5);
  const [southBound, setSouthBound] = useState(-23.6);
  const [eastBound, setEastBound] = useState(-46.6);
  const [westBound, setWestBound] = useState(-46.7);
  const [minDepth, setMinDepth] = useState(10);
  const [maxDepth, setMaxDepth] = useState(100);
  
  // Environmental params
  const [maxCurrent, setMaxCurrent] = useState(2);
  const [maxWaves, setMaxWaves] = useState(1.5);
  const [minVisibility, setMinVisibility] = useState(10);

  const [scanPattern, setScanPattern] = useState<"grid" | "spiral" | "random">("grid");

  useEffect(() => {
    planner.onFeedback((fb) => {
      setFeedback(prev => [fb, ...prev].slice(0, 20));
  });
  }, [planner]);

  const handleGeneratePlan = () => {
    const area: SurveyArea = {
      id: `area-${Date.now()}`,
      name: areaName,
      bounds: {
        north: northBound,
        south: southBound,
        east: eastBound,
        west: westBound,
      },
      minDepth,
      maxDepth,
      priority: "medium",
    };

    const environmental: EnvironmentalParams = {
      maxCurrentSpeed: maxCurrent,
      maxWaveHeight: maxWaves,
      minVisibility,
      tempRange: { min: 4, max: 25 },
      salinityRange: { min: 33, max: 37 },
    };

    const plan = planner.generateMissionPlan(
      area,
      ["Bathymetric survey", "Obstacle detection", "Environmental monitoring"],
      environmental,
      scanPattern
    );

    setCurrentPlan(plan);
  };

  const handleApprovePlan = () => {
    if (currentPlan) {
      planner.approveMission(currentPlan.id);
      setCurrentPlan(planner.getMissionPlan(currentPlan.id));
    }
  };

  const handleStartMission = () => {
    if (currentPlan) {
      planner.startMission(currentPlan.id);
      setCurrentPlan(planner.getMissionPlan(currentPlan.id));
    }
  };

  const handleExportPlan = () => {
    if (currentPlan) {
      const json = planner.exportMissionPlan(currentPlan.id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mission-${currentPlan.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-red-500",
    };
    return colors[risk as keyof typeof colors] || "bg-gray-500";
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      approved: "bg-blue-500",
      active: "bg-green-500 animate-pulse",
      completed: "bg-cyan-500",
      aborted: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-400 animate-pulse" />
              AutoSub - Autonomous Mission Planner
            </h1>
            <p className="text-zinc-400 mt-1">
              AI-driven autonomous underwater operations - PATCH 184.0
            </p>
          </div>
          {currentPlan && (
            <Badge className={getStatusBadge(currentPlan.status)}>
              {currentPlan.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-cyan-400" />
                Survey Area Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Area Name</label>
                <Input
                  value={areaName}
                  onChange={handleChange}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">North Bound</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={northBound}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">South Bound</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={southBound}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">East Bound</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={eastBound}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">West Bound</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={westBound}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Min Depth (m)</label>
                  <Input
                    type="number"
                    value={minDepth}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block">Max Depth (m)</label>
                  <Input
                    type="number"
                    value={maxDepth}
                    onChange={handleChange}
                    className="bg-zinc-900/50 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Environmental Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Max Current Speed (knots)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={maxCurrent}
                  onChange={handleChange}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Max Wave Height (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={maxWaves}
                  onChange={handleChange}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Min Visibility (m)</label>
                <Input
                  type="number"
                  value={minVisibility}
                  onChange={handleChange}
                  className="bg-zinc-900/50 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-2 block">Scan Pattern</label>
                <select
                  value={scanPattern}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-md p-2"
                >
                  <option value="grid">Grid (Lawnmower)</option>
                  <option value="spiral">Spiral</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <Button
                onClick={handleGeneratePlan}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Bot className="w-4 h-4 mr-2" />
                Generate Autonomous Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mission Plan */}
        {currentPlan && (
          <>
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-purple-400" />
                    Mission Plan: {currentPlan.name}
                  </div>
                  <Badge className={getRiskBadge(currentPlan.riskLevel)}>
                    {currentPlan.riskLevel.toUpperCase()} RISK
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-400 text-xs">Waypoints</div>
                    <div className="text-2xl font-bold text-purple-400">{currentPlan.waypoints.length}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs">Distance</div>
                    <div className="text-2xl font-bold text-cyan-400">{currentPlan.estimatedDistance.toFixed(1)} NM</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs">Duration</div>
                    <div className="text-2xl font-bold text-blue-400">{currentPlan.estimatedDuration} min</div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs">Objectives</div>
                    <div className="text-lg font-bold text-green-400">{currentPlan.objectives.length}</div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div className="flex flex-wrap gap-2">
                  {currentPlan.status === "draft" && (
                    <Button onClick={handleApprovePlan} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Plan
                    </Button>
                  )}
                  {currentPlan.status === "approved" && (
                    <Button onClick={handleStartMission} className="bg-green-600 hover:bg-green-700">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Mission
                    </Button>
                  )}
                  <Button onClick={handleExportPlan} variant="outline" className="border-zinc-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Log */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Mission Feedback ({feedback.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No feedback yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {feedback.map((fb, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-zinc-900/50 rounded border border-zinc-700"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge className={
                            fb.type === "completion" ? "bg-green-500" :
                              fb.type === "error" || fb.type === "abort" ? "bg-red-500" :
                                fb.type === "warning" ? "bg-yellow-500" :
                                  "bg-blue-500"
                          }>
                            {fb.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            {new Date(fb.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">{fb.message}</p>
                        {fb.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                              <span>Progress</span>
                              <span>{fb.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                style={{ width: `${fb.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoSub;
