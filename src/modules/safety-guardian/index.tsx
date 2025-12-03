/**
 * Safety Guardian Module
 * Sistema de segurança com monitoramento de incidentes e IA preditiva
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafetyDashboard } from "./components/SafetyDashboard";
import {
  Shield,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Settings,
  Brain
} from "lucide-react";

const SafetyGuardianModule: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="Safety Guardian"
        description="Sistema de Segurança com Monitoramento de Incidentes e IA Preditiva"
        gradient="orange"
        badges={[
          { icon: AlertTriangle, label: "Near Miss" },
          { icon: Brain, label: "IA Preditiva" },
          { icon: BarChart3, label: "TRIR/LTI" },
          { icon: FileText, label: "DDS" }
        ]}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidentes
          </TabsTrigger>
          <TabsTrigger value="dds" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            DDS
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Treinamentos
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SafetyDashboard />
        </TabsContent>

        <TabsContent value="incidents">
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gestão completa de incidentes em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="dds">
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Diálogo Diário de Segurança em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Treinamentos de segurança em desenvolvimento</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configurações de segurança em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SafetyGuardianModule;
