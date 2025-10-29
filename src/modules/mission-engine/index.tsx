/**
 * PATCH 426-430 - Mission Engine
 * Consolidated mission control, logs, and execution engine
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
  Play
} from "lucide-react";
import { toast } from "sonner";
import { MissionDashboard } from "./components/MissionDashboard";
import { MissionLogs } from "./components/MissionLogs";
import { MissionExecutor } from "./components/MissionExecutor";
import { MissionCreator } from "./components/MissionCreator";
import { missionEngineService } from "./services/mission-service";
import type { Mission, MissionLog, ModuleStatus } from "./types";

const MissionEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  const moduleStatuses: ModuleStatus[] = [
    {
      id: "coordination-ai",
      name: "Coordination AI",
      status: "operational",
      health: 98,
      lastUpdate: new Date().toISOString(),
      alerts: 0
    },
    {
      id: "agent-swarm",
      name: "Agent Swarm",
      status: "operational",
      health: 95,
      lastUpdate: new Date().toISOString(),
      alerts: 0
    },
    {
      id: "forecast",
      name: "Forecast Module",
      status: "operational",
      health: 100,
      lastUpdate: new Date().toISOString(),
      alerts: 0
    },
    {
      id: "satellite",
      name: "Satellite Tracking",
      status: "operational",
      health: 92,
      lastUpdate: new Date().toISOString(),
      alerts: 1
    }
  ];

  useEffect(() => {
    loadData();
    
    // PATCH 492: Real-time subscriptions for missions and logs
    const missionsChannel = missionEngineService.subscribeMissions((updatedMissions) => {
      setMissions(updatedMissions);
    });

    const logsChannel = missionEngineService.subscribeLogs((updatedLogs) => {
      setLogs(updatedLogs);
      // Show toast for new critical logs
      const newCriticalLogs = updatedLogs.filter(l => l.severity === "critical");
      if (newCriticalLogs.length > 0) {
        const latestLog = newCriticalLogs[0];
        toast.error(`Critical Alert: ${latestLog.title}`, {
          description: latestLog.message
        });
      }
    });

    return () => {
      if (missionsChannel) missionsChannel.unsubscribe();
      if (logsChannel) logsChannel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [missionsData, logsData] = await Promise.all([
        missionEngineService.getMissions(),
        missionEngineService.getLogs()
      ]);
      setMissions(missionsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load mission data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async (mission: Omit<Mission, "id" | "createdAt">) => {
    try {
      await missionEngineService.createMission(mission);
      toast.success("Mission created successfully");
      setShowCreator(false);
      loadData();
    } catch (error) {
      console.error("Error creating mission:", error);
      toast.error("Failed to create mission");
    }
  };

  const handleExecuteMission = async (missionId: string, simulationMode: boolean) => {
    try {
      await missionEngineService.startMissionExecution(missionId, simulationMode);
      toast.success(`Mission execution started in ${simulationMode ? "simulation" : "live"} mode`);
      loadData();
    } catch (error) {
      console.error("Error executing mission:", error);
      toast.error("Failed to start mission execution");
    }
  };

  // PATCH 492: New workflow handlers
  const handleAssignMission = async (missionId: string, vesselId: string, agentIds: string[]) => {
    try {
      await missionEngineService.assignMission(missionId, vesselId, agentIds);
      toast.success("Mission assigned successfully");
      loadData();
    } catch (error) {
      console.error("Error assigning mission:", error);
      toast.error("Failed to assign mission");
    }
  };

  const handleCloseMission = async (missionId: string, summary: string, outcome: "success" | "partial" | "failed") => {
    try {
      await missionEngineService.closeMission(missionId, summary, outcome);
      toast.success(`Mission closed with outcome: ${outcome}`);
      loadData();
    } catch (error) {
      console.error("Error closing mission:", error);
      toast.error("Failed to close mission");
    }
  };

  const handleReportIncident = async (missionId: string, incident: any) => {
    try {
      await missionEngineService.reportMissionIncident(missionId, incident);
      toast.success("Incident reported and logged");
      loadData();
    } catch (error) {
      console.error("Error reporting incident:", error);
      toast.error("Failed to report incident");
    }
  };

  const activeMissions = missions.filter(m => m.status === "in-progress");
  const completedMissions = missions.filter(m => m.status === "completed");
  const criticalAlerts = logs.filter(l => l.severity === "critical").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Command className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mission Engine</h1>
            <p className="text-sm text-muted-foreground">
              Unified mission control, execution, and logging system
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreator(true)}>
          <Rocket className="mr-2 h-4 w-4" />
          New Mission
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMissions.length}</div>
            <p className="text-xs text-muted-foreground">Missions finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">All modules</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="missions">
            <Target className="mr-2 h-4 w-4" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="execute">
            <Play className="mr-2 h-4 w-4" />
            Execute
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <MissionDashboard 
            missions={missions}
            moduleStatuses={moduleStatuses}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission Management</CardTitle>
              <CardDescription>
                View, create, and manage all missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading missions...</p>
                ) : missions.length === 0 ? (
                  <p className="text-center text-muted-foreground">No missions found</p>
                ) : (
                  <div className="space-y-2">
                    {missions.map(mission => (
                      <Card key={mission.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{mission.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {mission.code} • {mission.type} • Priority: {mission.priority}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              mission.status === "in-progress" ? "bg-blue-500/20 text-blue-500" :
                              mission.status === "completed" ? "bg-green-500/20 text-green-500" :
                              mission.status === "planned" ? "bg-yellow-500/20 text-yellow-500" :
                              "bg-gray-500/20 text-gray-500"
                            }`}>
                              {mission.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExecuteMission(mission.id, false)}
                              disabled={mission.status !== "planned"}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <MissionLogs logs={logs} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <MissionExecutor 
            missions={missions}
            onExecute={handleExecuteMission}
          />
        </TabsContent>
      </Tabs>

      {/* Mission Creator Dialog */}
      {showCreator && (
        <MissionCreator 
          onClose={() => setShowCreator(false)}
          onCreate={handleCreateMission}
        />
      )}
    </div>
  );
};

export default MissionEngine;
