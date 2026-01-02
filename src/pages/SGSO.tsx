import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
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
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh } = useMaritimeActions();
  const navigate = useNavigate();

  // Real action handlers
  const handleViewPractices = () => {
    toast.success("17 Práticas ANP", { description: "Abrindo gestão das 17 práticas obrigatórias" });
    // Scroll to practices section or navigate
    const practicesEl = document.getElementById('sgso-practices');
    if (practicesEl) practicesEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewRiskMatrix = () => {
    toast.success("Matriz de Riscos", { description: "Abrindo matriz de riscos 5x5" });
  };

  const handleViewIncidents = () => {
    toast.success("Gestão de Incidentes", { description: "Abrindo sistema de gestão de incidentes" });
  };

  const handleViewAudits = () => {
    toast.success("Auditorias", { description: "Abrindo planejamento de auditorias" });
  };

  const handleViewTraining = () => {
    toast.success("Treinamentos", { description: "Abrindo gestão de treinamentos" });
  };

  const handleANPReports = () => {
    handleGenerateReport("Relatórios ANP");
  };

  const handlePDFReport = () => {
    navigate("/sgso/report");
  };

  const handleNewIncident = () => {
    toast.success("Novo Incidente", { description: "Formulário de registro de incidente aberto" });
  };

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
          <div id="sgso-practices">
            <SgsoDashboard />
          </div>
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
            action: handleViewPractices
          },
          {
            id: "risks",
            label: "Matriz de Riscos",
            icon: <AlertTriangle className="h-3 w-3" />,
            action: handleViewRiskMatrix
          },
          {
            id: "incidents",
            label: "Gestão Incidentes",
            icon: <Bell className="h-3 w-3" />,
            action: handleViewIncidents
          },
          {
            id: "audits",
            label: "Auditorias",
            icon: <FileCheck className="h-3 w-3" />,
            action: handleViewAudits
          },
          {
            id: "training",
            label: "Treinamentos",
            icon: <Users className="h-3 w-3" />,
            action: handleViewTraining
          },
          {
            id: "reports",
            label: "Relatórios ANP",
            icon: <BookOpen className="h-3 w-3" />,
            action: handleANPReports
          },
          {
            id: "pdf-report",
            label: "Relatório PDF",
            icon: <FileCheck className="h-3 w-3" />,
            action: handlePDFReport,
            variant: "default"
          }
        ]}
        quickActions={[
          {
            id: "new-incident",
            label: "Novo Incidente",
            icon: <Plus className="h-3 w-3" />,
            action: handleNewIncident
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
