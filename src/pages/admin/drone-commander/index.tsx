/**
 * PATCH 451 - Drone Commander Complete
 * Central control for autonomous drone fleet
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Activity, 
  FileText, 
  Map,
  Plane,
  AlertTriangle,
  CheckCircle,
  Battery,
  Signal,
  Play,
  Square,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { DroneFleetOverview } from "@/modules/drone-commander/components/DroneFleetOverview";
import { DroneMissionAssignment } from "@/modules/drone-commander/components/DroneMissionAssignment";
import { DroneLogsViewer } from "@/modules/drone-commander/components/DroneLogsViewer";
import { DroneRealtimeMonitor } from "@/modules/drone-commander/components/DroneRealtimeMonitor";
import { droneCommanderService } from "@/modules/drone-commander/services/drone-service";
import type { DroneStatus } from "@/modules/drone-commander/types";

const DroneCommanderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [drones, setDrones] = useState<DroneStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadDrones();
    // Setup WebSocket connection for real-time updates
    setupWebSocket();
    
    // Refresh drone status every 5 seconds
    const interval = setInterval(loadDrones, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDrones = async () => {
    setLoading(true);
    try {
      const data = await droneCommanderService.getDrones();
      setDrones(data);
    } catch (error) {
      console.error("Error loading drones:", error);
      toast.error("Failed to load drone fleet");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Simulate WebSocket connection for real-time updates
    // In production, this would connect to actual WebSocket server
    setWsConnected(true);
    toast.success("Real-time monitoring activated");
  };

  const handleEmergencyStop = async (droneId: string) => {
    try {
      await droneCommanderService.sendCommand(droneId, "emergency_stop");
      toast.warning(`Emergency stop sent to drone ${droneId}`);
      await loadDrones();
    } catch (error) {
      console.error("Error sending emergency stop:", error);
      toast.error("Failed to send emergency stop command");
    }
  };

  const handleReturnHome = async (droneId: string) => {
    try {
      await droneCommanderService.sendCommand(droneId, "return_home");
      toast.info(`Return home command sent to drone ${droneId}`);
      await loadDrones();
    } catch (error) {
      console.error("Error sending return home:", error);
      toast.error("Failed to send return home command");
    }
  };

  const activeDrones = drones.filter(d => d.status === "flying" || d.status === "hovering");
  const idleDrones = drones.filter(d => d.status === "idle");
  const offlineDrones = drones.filter(d => d.status === "offline" || d.status === "emergency");
  const averageBattery = drones.length > 0 
    ? drones.reduce((sum, d) => sum + d.battery, 0) / drones.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Drone Commander</h1>
            <p className="text-sm text-muted-foreground">
              Autonomous drone fleet control center
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={wsConnected ? "default" : "secondary"}>
            {wsConnected ? "● Live" : "○ Offline"}
          </Badge>
          <Button onClick={loadDrones} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              In flight or on mission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Idle Drones</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{idleDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready for deployment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageBattery.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Fleet average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Map className="mr-2 h-4 w-4" />
            Fleet Overview
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Activity className="mr-2 h-4 w-4" />
            Real-time Monitor
          </TabsTrigger>
          <TabsTrigger value="missions">
            <Plane className="mr-2 h-4 w-4" />
            Mission Assignment
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            Fleet Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DroneFleetOverview 
            drones={drones}
            onEmergencyStop={handleEmergencyStop}
            onReturnHome={handleReturnHome}
            onRefresh={loadDrones}
          />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <DroneRealtimeMonitor 
            drones={drones}
            wsConnected={wsConnected}
          />
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <DroneMissionAssignment 
            drones={drones}
            onRefresh={loadDrones}
          />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <DroneLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DroneCommanderPage;
