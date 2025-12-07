/**
 * Nautilus Command Center - Unified dashboard with all revolutionary modules
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ship, Users, Package, Wrench, Brain, 
  Wifi, WifiOff, Activity, Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { FleetIntelligence } from "./FleetIntelligence";
import { CrewManagement } from "./CrewManagement";
import { SmartInventory } from "./SmartInventory";
import { MaintenanceHub } from "./MaintenanceHub";
import { IoTDashboard } from "./IoTDashboard";
import { OfflineIndicator } from "./OfflineIndicator";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function NautilusCommandCenter() {
  const [activeTab, setActiveTab] = useState("fleet");
  const { isOnline, pendingCount } = useOfflineSync();

  const modules = [
    { id: "fleet", label: "Frota", icon: Ship, color: "text-blue-500" },
    { id: "crew", label: "Tripulação", icon: Users, color: "text-emerald-500" },
    { id: "inventory", label: "Estoque", icon: Package, color: "text-amber-500" },
    { id: "maintenance", label: "Manutenção", icon: Wrench, color: "text-purple-500" },
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

            <div className="flex items-center gap-4">
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
          <TabsList className="grid grid-cols-5 h-auto p-1 bg-muted/50">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
                >
                  <Icon className={`h-5 w-5 ${activeTab === module.id ? module.color : "text-muted-foreground"}`} />
                  <span className="text-xs">{module.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Contents */}
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
            <IoTDashboard vesselId="demo-vessel" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
