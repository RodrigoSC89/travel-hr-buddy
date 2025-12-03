/**
 * ESG & Emissions Module
 * Monitoramento ambiental, carbon footprint e compliance regulatório
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmissionsDashboard } from "./components/EmissionsDashboard";
import {
  Leaf,
  Factory,
  BarChart3,
  FileText,
  Settings,
  Globe,
  Droplets,
  Wind
} from "lucide-react";

const ESGEmissionsModule: React.FC = () => {
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

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
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

        <TabsContent value="dashboard">
          <EmissionsDashboard />
        </TabsContent>

        <TabsContent value="emissions">
          <div className="text-center py-12 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Registro detalhado de emissões em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gestão de compliance IMO/EU MRV em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Geração de relatórios DCS/MRV em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configurações de fatores de emissão em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default ESGEmissionsModule;
