/**
 * ESG & Emissions Module
 * Monitoramento ambiental, carbon footprint e compliance regulatório
 */

import React, { Suspense, lazy } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmissionsDashboard } from "./components/EmissionsDashboard";
import { EmissionsRegistry } from "./components/EmissionsRegistry";
import { ComplianceManagement } from "./components/ComplianceManagement";
import { ESGReports } from "./components/ESGReports";
import { ESGSettings } from "./components/ESGSettings";
import {
  Leaf,
  Factory,
  BarChart3,
  FileText,
  Settings,
  Globe,
  Droplets,
  Activity,
  Sparkles,
} from "lucide-react";

// Premium Command Center
const ESGCommandCenter = lazy(() => import("./components/ESGCommandCenter"));

const ESGEmissionsModule = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Leaf}
        title="ESG & Emissões"
        description="Monitoramento Ambiental, Carbon Footprint e Compliance IMO/MARPOL"
        gradient="green"
        badges={[
          { icon: Factory, label: "CO₂ Tracking" },
          { icon: Globe, label: "IMO 2020" },
          { icon: Droplets, label: "SOx/NOx" },
          { icon: BarChart3, label: "CII Rating" }
        ]}
      />

      <Tabs defaultValue="command" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-6">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Comando
            <Badge variant="secondary" className="ml-1 text-[10px]">PREMIUM</Badge>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="emissions" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Emissões
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
            <ESGCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="dashboard">
          <EmissionsDashboard />
        </TabsContent>

        <TabsContent value="emissions">
          <EmissionsRegistry />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceManagement />
        </TabsContent>

        <TabsContent value="reports">
          <ESGReports />
        </TabsContent>

        <TabsContent value="settings">
          <ESGSettings />
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default ESGEmissionsModule;
