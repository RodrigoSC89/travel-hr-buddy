// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { 
  Ship, 
  TrendingUp, 
  Users, 
  Activity,
  BarChart3,
  Navigation,
  Gauge,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import existing components
import VesselManagement from "@/components/fleet/vessel-management";
import { VesselTracking } from "@/components/fleet/vessel-tracking";
import { FleetAnalytics } from "@/components/analytics/fleet-analytics";

// Import AI and logger utilities
import { runAIContext } from "@/ai/kernel";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

// Types for our data
interface OperationsData {
  activeVessels: number;
  totalVessels: number;
  crewMembers: number;
  activeCrew: number;
  completedVoyages: number;
  activeAlerts: number;
  fleetEfficiency: number;
  vesselsInOperation: number;
  vesselsAtPort: number;
  vesselsInMaintenance: number;
}

/**
 * Operations Dashboard - PATCH 89
 * Consolidated dashboard for fleet, crew, performance, and operational metrics
 * Combines functionality from:
 * - FleetDashboard
 * - Performance monitoring
 * - Metrics dashboards
 * 
 * PATCH 89.1-89.5 Integration:
 * - Real Supabase data (vessels, crew, voyages)
 * - AI context integration with runAIContext("operations-dashboard")
 * - Structured logging with logger.info() and logger.error()
 * - Loading states and error handling
 */
export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OperationsData>({
    activeVessels: 0,
    totalVessels: 0,
    crewMembers: 0,
    activeCrew: 0,
    completedVoyages: 0,
    activeAlerts: 0,
    fleetEfficiency: 0,
    vesselsInOperation: 0,
    vesselsAtPort: 0,
    vesselsInMaintenance: 0,
  });

  // Fetch operational data from Supabase
  const fetchOperationalData = useCallback(async () => {
      logger.info("🚢 Operations Dashboard: Starting data fetch");
      setIsLoading(true);
      setError(null);

      try {
        // Fetch vessels data
        const { data: vessels, error: vesselsError } = await supabase
          .from("vessels")
          .select("id, name, status, type");

        if (vesselsError) {
          throw new Error(`Failed to fetch vessels: ${vesselsError.message}`);
        }

        // Fetch crew data
        const { data: crew, error: crewError } = await supabase
          .from("crew_members")
          .select("id, name, status");

        if (crewError) {
          throw new Error(`Failed to fetch crew: ${crewError.message}`);
        }

        // Fetch voyages (completed today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: voyages, error: voyagesError } = await supabase
          .from("voyages")
          .select("id, status")
          .gte("created_at", today.toISOString());

        if (voyagesError) {
          logger.warn("⚠️ Operations Dashboard: Could not fetch voyages", { error: voyagesError.message });
        }

        // Fetch operational alerts
        const { data: alerts, error: alertsError } = await supabase
          .from("operational_alerts")
          .select("id, severity, status")
          .eq("status", "active");

        if (alertsError) {
          logger.warn("⚠️ Operations Dashboard: Could not fetch alerts", { error: alertsError.message });
        }

        // Calculate metrics
        const activeVessels = vessels?.filter(v => v.status === "active" || v.status === "operational").length || 0;
        const vesselsInOperation = vessels?.filter(v => v.status === "operational").length || 0;
        const vesselsAtPort = vessels?.filter(v => v.status === "at_port" || v.status === "docked").length || 0;
        const vesselsInMaintenance = vessels?.filter(v => v.status === "maintenance").length || 0;
        const activeCrew = crew?.filter(c => c.status === "active" || c.status === "onboard").length || 0;
        const completedVoyages = voyages?.filter(v => v.status === "completed").length || 0;

        const operationsData: OperationsData = {
          activeVessels,
          totalVessels: vessels?.length || 0,
          crewMembers: crew?.length || 0,
          activeCrew,
          completedVoyages,
          activeAlerts: alerts?.length || 0,
          fleetEfficiency: activeVessels > 0 ? Math.round((activeVessels / (vessels?.length || 1)) * 100 * 10) / 10 : 0,
          vesselsInOperation,
          vesselsAtPort,
          vesselsInMaintenance,
        };

        setData(operationsData);

        logger.info("✅ Operations Dashboard: Data loaded successfully", {
          vessels: vessels?.length,
          crew: crew?.length,
          voyages: voyages?.length,
        });

        // Run AI context for insights
        try {
          logger.info("🤖 Operations Dashboard: Requesting AI context");
          await runAIContext({
            module: "operations-dashboard",
            action: "analyze_operations",
            context: {
              vessels: vessels?.length || 0,
              activeVessels,
              crew: crew?.length || 0,
              activeCrew,
              completedVoyages,
              alerts: alerts?.length || 0,
              efficiency: operationsData.fleetEfficiency,
            },
          });
          logger.info("✅ Operations Dashboard: AI context executed successfully");
        } catch (aiError) {
          logger.error("❌ Operations Dashboard: AI context failed", aiError);
          // Don't fail the entire dashboard if AI fails
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        logger.error("❌ Operations Dashboard: Failed to load data", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchOperationalData();
  }, [fetchOperationalData]);

  // Loading state
  if (isLoading) {
    return (
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Ship}
          title="Operations Dashboard"
          description="Centro de controle operacional - Frota, Tripulação, Performance e Métricas"
          gradient="blue"
          badges={[
            { icon: Ship, label: "Fleet Management" },
            { icon: Users, label: "Crew Monitoring" },
            { icon: TrendingUp, label: "Performance" },
            { icon: Activity, label: "Real-time Metrics" }
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Loading operational data...</p>
          </div>
        </div>
      </ModulePageWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Ship}
          title="Operations Dashboard"
          description="Centro de controle operacional - Frota, Tripulação, Performance e Métricas"
          gradient="blue"
          badges={[
            { icon: Ship, label: "Fleet Management" },
            { icon: Users, label: "Crew Monitoring" },
            { icon: TrendingUp, label: "Performance" },
            { icon: Activity, label: "Real-time Metrics" }
          ]}
        />
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load operational data: {error}
          </AlertDescription>
        </Alert>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Operations Dashboard"
        description="Centro de controle operacional - Frota, Tripulação, Performance e Métricas"
        gradient="blue"
        badges={[
          { icon: Ship, label: "Fleet Management" },
          { icon: Users, label: "Crew Monitoring" },
          { icon: TrendingUp, label: "Performance" },
          { icon: Activity, label: "Real-time Metrics" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            <span>Fleet</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            <span>Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-500" />
                  Active Vessels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeVessels}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.totalVessels} total vessels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  Crew Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.crewMembers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.activeCrew} active duty ({data.crewMembers > 0 ? Math.round((data.activeCrew / data.crewMembers) * 100) : 0}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Fleet Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.fleetEfficiency}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.completedVoyages} voyages today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Operational alerts
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Operational Status</CardTitle>
              <CardDescription>
                Real-time overview of operations across all vessels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <span className="text-sm">Vessels in Operation</span>
                  </div>
                  <span className="text-lg font-semibold">{data.vesselsInOperation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Port</Badge>
                    <span className="text-sm">Vessels at Port</span>
                  </div>
                  <span className="text-lg font-semibold">{data.vesselsAtPort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Maintenance</Badge>
                    <span className="text-sm">Under Maintenance</span>
                  </div>
                  <span className="text-lg font-semibold">{data.vesselsInMaintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <VesselManagement />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <VesselTracking />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <FleetAnalytics />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
}
