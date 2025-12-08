/**
 * Safety Guardian Module - PATCH 1250
 * Sistema completo de segurança com IA preditiva e generativa
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafetyDashboard } from "./components/SafetyDashboardNew";
import {
  Shield,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Settings,
  Brain,
  GraduationCap,
} from "lucide-react";

const SafetyGuardianModule: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="Safety Guardian"
        description="Sistema Integrado de Segurança com IA Preditiva e Treinamento"
        gradient="orange"
        badges={[
          { icon: AlertTriangle, label: "Incidentes" },
          { icon: Brain, label: "IA Preditiva" },
          { icon: BarChart3, label: "TRIR/LTI" },
          { icon: GraduationCap, label: "Treinamento" },
        ]}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Incidentes</span>
          </TabsTrigger>
          <TabsTrigger value="dds" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">DDS</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Treinamentos</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SafetyDashboard />
        </TabsContent>

        <TabsContent value="incidents">
          <SafetyDashboard />
        </TabsContent>

        <TabsContent value="dds">
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Diálogo Diário de Segurança - Em breve</p>
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Central de Treinamentos - Em breve</p>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>IA Preditiva e Generativa - Em breve</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configurações de Segurança - Em breve</p>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SafetyGuardianModule;
