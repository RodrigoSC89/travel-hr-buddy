import React, { useState } from "react";
import { OrganizationLayout } from "@/components/layout/organization-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VesselManagement from "@/components/fleet/vessel-management";
import { VesselTracking } from "@/components/fleet/vessel-tracking";
import { FleetAnalytics } from "@/components/analytics/fleet-analytics";
import { Ship, Navigation, BarChart3, Wrench } from "lucide-react";

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState("management");

  return (
    <OrganizationLayout title="Dashboard da Frota">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 min-w-fit">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Gestão</span>
              <span className="sm:hidden">Gestão</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Rastreamento</span>
              <span className="sm:hidden">GPS</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Manutenção</span>
              <span className="sm:hidden">Manutenção</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="management" className="space-y-6">
          <VesselManagement />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <VesselTracking />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FleetAnalytics />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gestão de Manutenção</h3>
            <p className="text-muted-foreground">Módulo de manutenção em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </OrganizationLayout>
  );
}
