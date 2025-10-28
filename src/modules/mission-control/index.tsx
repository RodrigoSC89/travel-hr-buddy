import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  Activity, 
  Ship, 
  Cloud, 
  Satellite, 
  AlertTriangle,
  TrendingUp,
  Zap,
  MessageSquare
} from "lucide-react";
import { AICommander } from "./components/AICommander";
import { KPIDashboard } from "./components/KPIDashboard";
import { SystemLogs } from "./components/SystemLogs";
import { MissionManager } from "./components/MissionManager";
import { RealTimeMissionDashboard } from "./components/RealTimeMissionDashboard";

/**
 * PATCH 177.0 + 272.0 + 419.0 - Mission Control Consolidation & AI Commander & Real-Time Execution
 * 
 * Unified operational hub consolidating:
 * - Fleet Management
 * - Emergency Response
 * - Satellite Communications
 * - Weather Monitoring
 * - Mission Management (PATCH 272)
 * - Real-Time Execution Tracking (PATCH 419)
 * 
 * Features:
 * - AI Commander for contextual commands and queries
 * - Live KPI dashboard with real-time status (5s polling)
 * - Integrated logs, alerts, and status per module
 * - Tactical operational overview
 * - Mission creation and agent assignment (PATCH 272)
 * - Real-time mission execution with status tracking (PATCH 419)
 */

interface ModuleStatus {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical" | "offline";
  health: number;
  lastUpdate: string;
  alerts: number;
}

const MissionControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const moduleStatuses: ModuleStatus[] = [
    {
      id: "fleet",
      name: "Fleet Management",
      status: "operational",
      health: 98,
      lastUpdate: new Date().toISOString(),
      alerts: 0
    },
    {
      id: "emergency",
      name: "Emergency Response",
      status: "operational",
      health: 100,
      lastUpdate: new Date().toISOString(),
      alerts: 0
    },
    {
      id: "satellite",
      name: "Satellite Tracking",
      status: "operational",
      health: 95,
      lastUpdate: new Date().toISOString(),
      alerts: 1
    },
    {
      id: "weather",
      name: "Weather Monitor",
      status: "warning",
      health: 87,
      lastUpdate: new Date().toISOString(),
      alerts: 2
    }
  ];

  const getStatusColor = (status: ModuleStatus["status"]) => {
    switch (status) {
    case "operational":
      return "text-green-500 bg-green-500/10";
    case "warning":
      return "text-yellow-500 bg-yellow-500/10";
    case "critical":
      return "text-red-500 bg-red-500/10";
    case "offline":
      return "text-gray-500 bg-gray-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (moduleId: string) => {
    switch (moduleId) {
    case "fleet":
      return <Ship className="w-5 h-5" />;
    case "emergency":
      return <AlertTriangle className="w-5 h-5" />;
    case "satellite":
      return <Satellite className="w-5 h-5" />;
    case "weather":
      return <Cloud className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="w-8 h-8 text-blue-400" />
              Mission Control Center
            </h1>
            <p className="text-zinc-400 mt-1">
              Unified Tactical Operations Hub - PATCH 177.0
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-green-400">All Systems Operational</span>
          </div>
        </div>

        {/* AI Commander */}
        <AICommander />

        {/* KPI Dashboard */}
        <KPIDashboard modules={moduleStatuses} />

        {/* Module Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleStatuses.map((module) => (
            <Card key={module.id} className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(module.id)}
                    <CardTitle className="text-sm">{module.name}</CardTitle>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(module.status)}`}>
                    {module.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Health</span>
                    <span className="font-semibold">{module.health}%</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        module.health >= 90 ? "bg-green-500" : 
                          module.health >= 70 ? "bg-yellow-500" : 
                            "bg-red-500"
                      }`}
                      style={{ width: `${module.health}%` }}
                    />
                  </div>
                  {module.alerts > 0 && (
                    <div className="flex items-center gap-2 text-xs text-yellow-400 mt-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{module.alerts} active alert{module.alerts > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-zinc-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="fleet">Fleet</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="satellite">Satellite</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Operational Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">98.5%</div>
                    <div className="text-sm text-zinc-400">System Uptime</div>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">12</div>
                    <div className="text-sm text-zinc-400">Active Vessels</div>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">3</div>
                    <div className="text-sm text-zinc-400">Pending Actions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SystemLogs />
          </TabsContent>

          <TabsContent value="missions" className="mt-4">
            <RealTimeMissionDashboard />
          </TabsContent>

          <TabsContent value="fleet" className="mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-400" />
                  Fleet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">Fleet operations and vessel tracking will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Emergency Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">Emergency protocols and incident management will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satellite" className="mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-purple-400" />
                  Satellite Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">Satellite tracking and communications will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="mt-4">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                  Weather Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400">Weather conditions and forecasts will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MissionControl;
