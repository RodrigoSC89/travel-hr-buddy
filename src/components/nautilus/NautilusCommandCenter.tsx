/**
 * Nautilus Command Center - Unified dashboard with all revolutionary modules
 * Fully integrated with Supabase for real-time data
 */

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ship, Users, Package, Wrench, Brain, 
  Wifi, WifiOff, Activity, Settings, RefreshCw,
  Bell, AlertTriangle, TrendingUp, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { FleetIntelligence } from "./FleetIntelligence";
import { CrewManagement } from "./CrewManagement";
import { SmartInventory } from "./SmartInventory";
import { MaintenanceHub } from "./MaintenanceHub";
import { IoTDashboard } from "./IoTDashboard";
import { OfflineIndicator } from "./OfflineIndicator";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { supabase } from "@/integrations/supabase/client";
import { CommandCenterAI } from "@/components/command/CommandCenterAI";

interface SystemStats {
  vessels: number;
  crew: number;
  pendingMaintenance: number;
  lowStockItems: number;
  alerts: number;
}

export function NautilusCommandCenter() {
  const [activeTab, setActiveTab] = useState("command-ai");
  const { isOnline, pendingCount, forceSync, isSyncing } = useOfflineSync();
  const [stats, setStats] = useState<SystemStats>({
    vessels: 0,
    crew: 0,
    pendingMaintenance: 0,
    lowStockItems: 0,
    alerts: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = async () => {
    try {
      const [vesselsResult, crewResult, maintenanceResult] = await Promise.all([
        supabase.from("vessels").select("id", { count: "exact", head: true }),
        supabase.from("crew_members").select("id", { count: "exact", head: true }),
        supabase.from("maintenance_schedules").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
      ]);

      setStats({
        vessels: vesselsResult.count || 0,
        crew: crewResult.count || 0,
        pendingMaintenance: maintenanceResult.count || 0,
        lowStockItems: 2, // Demo value
        alerts: (maintenanceResult.count || 0) > 0 ? 1 : 0,
      });
    } catch (error) {
      console.error("Error loading system stats:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemStats();
    if (isOnline && pendingCount > 0) {
      await forceSync();
    }
    setIsRefreshing(false);
  };

  const modules = [
    { id: "command-ai", label: "IA Command", icon: Brain, color: "text-purple-500", isNew: true },
    { id: "fleet", label: "Frota", icon: Ship, color: "text-blue-500", count: stats.vessels },
    { id: "crew", label: "Tripulação", icon: Users, color: "text-emerald-500", count: stats.crew },
    { id: "inventory", label: "Estoque", icon: Package, color: "text-amber-500", count: stats.lowStockItems > 0 ? stats.lowStockItems : undefined },
    { id: "maintenance", label: "Manutenção", icon: Wrench, color: "text-purple-500", count: stats.pendingMaintenance },
    { id: "iot", label: "IoT", icon: Activity, color: "text-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Nautilus Command Center</h1>
                <p className="text-sm text-muted-foreground">
                  Centro de Comando Integrado
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="flex items-center gap-2 text-sm">
                  <Ship className="h-4 w-4 text-blue-500" />
                  <span>{stats.vessels} embarcações</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>{stats.crew} tripulantes</span>
                </div>
              </div>

              {/* Alerts */}
              {stats.alerts > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.alerts}
                </Badge>
              )}

              {/* Connection Status */}
              <Badge 
                variant={isOnline ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </Badge>

              {pendingCount > 0 && (
                <Badge variant="secondary">
                  {pendingCount} pendentes
                </Badge>
              )}

              {/* Refresh Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing || isSyncing}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing || isSyncing ? 'animate-spin' : ''}`} />
              </Button>

              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid grid-cols-6 h-auto p-1 bg-muted/50">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background relative"
                >
                  <Icon className={`h-5 w-5 ${activeTab === module.id ? module.color : "text-muted-foreground"}`} />
                  <span className="text-xs">{module.label}</span>
                  {(module as any).isNew && (
                    <Badge className="absolute -top-1 -right-1 h-5 p-1 flex items-center justify-center text-[9px] bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-3 w-3" />
                    </Badge>
                  )}
                  {module.count !== undefined && module.count > 0 && (
                    <Badge 
                      variant={module.id === "inventory" ? "destructive" : "secondary"} 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                    >
                      {module.count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="command-ai" className="mt-6">
            <CommandCenterAI />
          </TabsContent>

          <TabsContent value="fleet" className="mt-6">
            <FleetIntelligence />
          </TabsContent>

          <TabsContent value="crew" className="mt-6">
            <CrewManagement />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <SmartInventory />
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <MaintenanceHub />
          </TabsContent>

          <TabsContent value="iot" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-500" />
                    Telemetria IoT em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitoramento de sensores e dados de telemetria das embarcações da frota.
                  </p>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <IoTDashboard vesselId="vessel-atlantico-sul" vesselName="MV Atlântico" />
                <IoTDashboard vesselId="vessel-pacifico-norte" vesselName="MV Pacífico" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
