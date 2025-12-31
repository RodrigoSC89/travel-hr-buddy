import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  Shield,
  AlertTriangle,
  FileCheck,
  Bell,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  Plus,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";

const SGSO = () => {
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const navigate = useNavigate();
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="SGSO - Sistema de Gestão de Segurança Operacional"
        description="Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias"
        gradient="red"
        badges={[
          { icon: FileCheck, label: "Compliance ANP" },
          { icon: Target, label: "17 Práticas" },
          { icon: Shield, label: "Segurança Total" },
          { icon: Eye, label: "Monitor Proativo" }
        ]}
      />

      {/* Tabs for Dashboard and Compliance Monitor */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard SGSO
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="h-4 w-4" />
            Monitor de Conformidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SgsoDashboard />
        </TabsContent>

        <TabsContent value="compliance">
          <ProactiveComplianceMonitor />
        </TabsContent>
      </Tabs>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="sgso"
        moduleName="SGSO"
        actions={[
          {
            id: "practices",
            label: "17 Práticas ANP",
            icon: <Shield className="h-3 w-3" />,
            action: () => showInfo("17 Práticas ANP", "Abrindo gestão das 17 práticas obrigatórias")
          },
          {
            id: "risks",
            label: "Matriz de Riscos",
            icon: <AlertTriangle className="h-3 w-3" />,
            action: () => showInfo("Matriz de Riscos", "Abrindo matriz de riscos 5x5")
          },
          {
            id: "incidents",
            label: "Gestão Incidentes",
            icon: <Bell className="h-3 w-3" />,
            action: () => showInfo("Gestão de Incidentes", "Abrindo sistema de gestão de incidentes")
          },
          {
            id: "audits",
            label: "Auditorias",
            icon: <FileCheck className="h-3 w-3" />,
            action: () => showInfo("Auditorias", "Abrindo planejamento de auditorias")
          },
          {
            id: "training",
            label: "Treinamentos",
            icon: <Users className="h-3 w-3" />,
            action: () => showInfo("Treinamentos", "Abrindo gestão de treinamentos")
          },
          {
            id: "reports",
            label: "Relatórios ANP",
            icon: <BookOpen className="h-3 w-3" />,
            action: () => handleGenerateReport("Relatórios ANP")
          },
          {
            id: "pdf-report",
            label: "Relatório PDF",
            icon: <FileCheck className="h-3 w-3" />,
            action: () => navigate("/sgso/report")
          }
        ]}
        quickActions={[
          {
            id: "new-incident",
            label: "Novo Incidente",
            icon: <Plus className="h-3 w-3" />,
            action: () => handleCreate("Incidente")
          },
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh("SGSO", async () => window.location.reload()),
            shortcut: "F5"
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport("SGSO")
          }
        ]}
      />
    </ModulePageWrapper>
  );
};

export default SGSO;
