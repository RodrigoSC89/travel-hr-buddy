/**
 * Nautilus Command Center - Centro de Comando Unificado com IA
 */

import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, Wifi, WifiOff, RefreshCw, Settings, Bell,
  Activity, Sparkles, Terminal, Bot, FlaskConical, Ship,
  Users, Package, Wrench, Gauge
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { toast } from "sonner";

// Components
import { CommandBrainPanel } from "@/modules/nautilus-command/components/CommandBrainPanel";
import { AIInsightsPanel } from "@/modules/nautilus-command/components/AIInsightsPanel";
import { NotificationsPanel } from "@/modules/nautilus-command/components/NotificationsPanel";
import { QuickActionsGrid } from "@/modules/nautilus-command/components/QuickActionsGrid";
import { SettingsDialog } from "@/modules/nautilus-command/components/SettingsDialog";
import { FleetIntelligence } from "./FleetIntelligence";
import { CrewManagement } from "./CrewManagement";
import { SmartInventory } from "./SmartInventory";
import { MaintenanceHub } from "./MaintenanceHub";
import { IoTDashboard } from "./IoTDashboard";
import { OfflineIndicator } from "./OfflineIndicator";
import { SystemContext } from "@/modules/nautilus-command/hooks/useNautilusCommandAI";

interface Notification {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  module: string;
  timestamp: Date;
  read: boolean;
}

export const NautilusCommandCenter = memo(function() {
  const [activeTab, setActiveTab] = useState("command");
  const { isOnline, pendingCount, forceSync, isSyncing } = useOfflineSync();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [context, setContext] = useState<SystemContext>({
    fleet: { vessels: 0, active: 0, maintenance: 0, alerts: 0 },
    crew: { total: 0, onboard: 0, onLeave: 0, expiringCerts: 0 },
    maintenance: { scheduled: 0, overdue: 0, completed: 0, efficiency: 0 },
    inventory: { lowStock: 0, pendingOrders: 0, value: 0 },
    compliance: { score: 0, pendingAudits: 0, expiringDocs: 0 }
  });

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [vesselsResult, crewResult, maintenanceResult, certsResult] = await Promise.all([
        supabase.from("vessels").select("*"),
        supabase.from("crew_members").select("*"),
        supabase.from("maintenance_schedules").select("*"),
        supabase.from("employee_certificates").select("*")
      ]);

      const vessels = vesselsResult.data || [];
      const crew = crewResult.data || [];
      const maintenance = maintenanceResult.data || [];
      const certs = certsResult.data || [];

      const today = new Date();
      const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringCerts = certs.filter(c => {
        const expiry = new Date(c.expiry_date);
        return expiry <= thirtyDays && expiry >= today;
      }).length;

      const overdueCount = maintenance.filter(m => m.status === "overdue").length;

      setContext({
        fleet: {
          vessels: vessels.length,
          active: vessels.filter(v => v.status === "active").length,
          maintenance: vessels.filter(v => v.status === "maintenance").length,
          alerts: vessels.filter(v => v.status === "alert").length
        },
        crew: {
          total: crew.length,
          onboard: crew.filter(c => c.status === "active").length,
          onLeave: crew.filter(c => c.status === "on_leave").length,
          expiringCerts
        },
        maintenance: {
          scheduled: maintenance.filter(m => m.status === "scheduled").length,
          overdue: overdueCount,
          completed: maintenance.filter(m => m.status === "completed").length,
          efficiency: 94
        },
        inventory: { lowStock: 8, pendingOrders: 5, value: 2450000 },
        compliance: { score: 96, pendingAudits: 2, expiringDocs: 4 }
      });

      // Generate notifications
      const newNotifications: Notification[] = [];
      if (overdueCount > 0) {
        newNotifications.push({
          id: "1", type: "critical", title: `${overdueCount} manutenções vencidas`,
          description: "Ações corretivas necessárias", module: "Manutenção",
          timestamp: new Date(), read: false
        });
      }
      if (expiringCerts > 0) {
        newNotifications.push({
          id: "2", type: "warning", title: `${expiringCerts} certificados expirando`,
          description: "Renovação necessária em 30 dias", module: "Tripulação",
          timestamp: new Date(), read: false
        });
      }
      setNotifications(newNotifications);

    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemData();
    if (isOnline && pendingCount > 0) await forceSync();
    setIsRefreshing(false);
    toast.success("Dados atualizados!");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Nautilus Command Center</h1>
                <p className="text-sm text-muted-foreground">Centro de Comando Integrado com IA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
                <span><Ship className="h-4 w-4 inline mr-1 text-blue-500" />{context.fleet.active} ativas</span>
                <span><Users className="h-4 w-4 inline mr-1 text-green-500" />{context.crew.onboard} a bordo</span>
              </div>

              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">{unreadCount} alertas</Badge>
              )}

              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
              </Badge>

              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing || isSyncing}>
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleSetSettingsOpen}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 md:grid-cols-9 h-auto p-1 bg-muted/50">
            {[
              { id: "command", label: "Comando", icon: Gauge, isNew: true },
              { id: "brain", label: "Brain IA", icon: Brain, isNew: true },
              { id: "insights", label: "Insights", icon: Sparkles, isNew: true },
              { id: "alerts", label: "Alertas", icon: Bell, count: unreadCount },
              { id: "fleet", label: "Frota", icon: Ship },
              { id: "crew", label: "Tripulação", icon: Users },
              { id: "inventory", label: "Estoque", icon: Package },
              { id: "maintenance", label: "Manutenção", icon: Wrench },
              { id: "iot", label: "IoT", icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-1 py-2 relative">
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[10px]">{tab.label}</span>
                  {(tab as unknown).isNew && (
                    <Badge className="absolute -top-1 -right-1 h-4 px-1 text-[8px] bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-2 w-2" />
                    </Badge>
                  )}
                  {(tab as unknown).count > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[9px]">
                      {(tab as unknown).count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="command" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <QuickActionsGrid context={context} />
              </div>
              <AIInsightsPanel context={context} />
            </div>
          </TabsContent>

          <TabsContent value="brain">
            <div className="h-[calc(100vh-250px)]">
              <CommandBrainPanel context={context} onSettingsClick={() => setSettingsOpen(true} />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <AIInsightsPanel context={context} />
          </TabsContent>

          <TabsContent value="alerts">
            <NotificationsPanel
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onDismiss={handleDismissNotification}
              onSettingsClick={() => setSettingsOpen(true}
              onFilterClick={() => {}}
            />
          </TabsContent>

          <TabsContent value="fleet"><FleetIntelligence /></TabsContent>
          <TabsContent value="crew"><CrewManagement /></TabsContent>
          <TabsContent value="inventory"><SmartInventory /></TabsContent>
          <TabsContent value="maintenance"><MaintenanceHub /></TabsContent>
          <TabsContent value="iot">
            <div className="grid gap-4 md:grid-cols-2">
              <IoTDashboard vesselId="vessel-1" vesselName="MV Atlântico" />
              <IoTDashboard vesselId="vessel-2" vesselName="MV Pacífico" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
