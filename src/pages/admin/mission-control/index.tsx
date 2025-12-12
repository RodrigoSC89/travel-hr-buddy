/**
import { useEffect, useState } from "react";;
 * PATCH 452 - Mission Control Consolidated
 * Unified mission planning, execution, and logging system
 * Consolidates: mission-engine/, mission-logs/, missions/
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Command, 
  Activity, 
  FileText, 
  Rocket,
  Target,
  AlertTriangle,
  CheckCircle,
  Play,
  Calendar,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { MissionPlanning } from "@/modules/mission-control/components/MissionPlanning";
import { MissionExecution } from "@/modules/mission-control/components/MissionExecution";
import { MissionLogs } from "@/modules/mission-control/components/MissionLogs";
import { missionControlService } from "@/modules/mission-control/services/mission-control-service";
import type { Mission, MissionLog, MissionTask } from "@/modules/mission-control/types";

const MissionControlPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 15 seconds (increased from 10s)
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [missionsData, logsData, tasksData] = await Promise.all([
        missionControlService.getMissions(),
        missionControlService.getLogs(),
        missionControlService.getTasks()
      ]);
      setMissions(missionsData);
      setLogs(logsData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading mission data:", error);
      toast.error("Failed to load mission data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const activeMissions = missions.filter(m => m.status === "in-progress");
  const plannedMissions = missions.filter(m => m.status === "planned");
  const completedMissions = missions.filter(m => m.status === "completed");
  const criticalAlerts = logs.filter(l => l.severity === "critical").length;
  const completionRate = missions.length > 0 
    ? ((completedMissions.length / missions.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Command className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mission Control</h1>
            <p className="text-sm text-muted-foreground">
              Unified mission planning, execution, and monitoring
            </p>
          </div>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions.length}</div>
            <p className="text-xs text-muted-foreground">Running now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plannedMissions.length}</div>
            <p className="text-xs text-muted-foreground">Ready to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMissions.length}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planning">
            <Target className="mr-2 h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="execution">
            <Play className="mr-2 h-4 w-4" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-4">
          <MissionPlanning 
            missions={missions}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <MissionExecution 
            missions={activeMissions}
            tasks={tasks}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <MissionLogs 
            logs={logs}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionControlPage;
