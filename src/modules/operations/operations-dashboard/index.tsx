import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import existing components
import VesselManagement from "@/components/fleet/vessel-management";
import { VesselTracking } from "@/components/fleet/vessel-tracking";
import { FleetAnalytics } from "@/components/analytics/fleet-analytics";

/**
 * Operations Dashboard - PATCH 89
 * Consolidated dashboard for fleet, crew, performance, and operational metrics
 * Combines functionality from:
 * - FleetDashboard
 * - Performance monitoring
 * - Metrics dashboards
 */
export default function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +2 from last week
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
                <div className="text-2xl font-bold">187</div>
                <p className="text-xs text-muted-foreground mt-1">
                  95% active duty
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
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +3.1% this month
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
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">
                  2 maintenance, 1 weather
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
                  <span className="text-lg font-semibold">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Port</Badge>
                    <span className="text-sm">Vessels at Port</span>
                  </div>
                  <span className="text-lg font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Maintenance</Badge>
                    <span className="text-sm">Under Maintenance</span>
                  </div>
                  <span className="text-lg font-semibold">2</span>
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
