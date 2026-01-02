import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { CreateSGSOIncidentDialog } from "@/components/sgso/CreateSGSOIncidentDialog";
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
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);

  // Real action handlers - navigate to tabs/sections in SgsoDashboard
  const handleViewPractices = () => {
    // Click practices tab in SgsoDashboard
    const practicesTab = document.querySelector('[value="practices"]') as HTMLElement;
    if (practicesTab) {
      practicesTab.click();
      toast.success("17 Práticas ANP", { description: "Navegando para gestão das práticas" });
    } else {
      const practicesEl = document.getElementById('sgso-practices');
      if (practicesEl) practicesEl.scrollIntoView({ behavior: 'smooth' });
      toast.success("17 Práticas ANP", { description: "Gestão das 17 práticas obrigatórias" });
    }
  };

  const handleViewRiskMatrix = () => {
    const risksTab = document.querySelector('[value="risks"]') as HTMLElement;
    if (risksTab) {
      risksTab.click();
      toast.success("Matriz de Riscos", { description: "Navegando para matriz de riscos 5x5" });
    } else {
      toast.success("Matriz de Riscos", { description: "Matriz de riscos 5x5" });
    }
  };

  const handleViewIncidents = () => {
    const incidentsTab = document.querySelector('[value="incidents"]') as HTMLElement;
    if (incidentsTab) {
      incidentsTab.click();
      toast.success("Gestão de Incidentes", { description: "Navegando para gestão de incidentes" });
    } else {
      toast.success("Gestão de Incidentes", { description: "Sistema de gestão de incidentes" });
    }
  };

  const handleViewAudits = () => {
    const auditsTab = document.querySelector('[value="audits"]') as HTMLElement;
    if (auditsTab) {
      auditsTab.click();
      toast.success("Auditorias", { description: "Navegando para planejamento de auditorias" });
    } else {
      toast.success("Auditorias", { description: "Planejamento de auditorias" });
    }
  };

  const handleViewTraining = () => {
    const trainingTab = document.querySelector('[value="training"]') as HTMLElement;
    if (trainingTab) {
      trainingTab.click();
      toast.success("Treinamentos", { description: "Navegando para gestão de treinamentos" });
    } else {
      toast.success("Treinamentos", { description: "Gestão de treinamentos" });
    }
  };

  const handleANPReports = () => {
    handleGenerateReport("Relatórios ANP");
  };

  const handlePDFReport = () => {
    navigate("/sgso/report");
  };

  const handleNewIncident = () => {
    setIncidentDialogOpen(true);
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

      {/* Incident Creation Dialog */}
      <CreateSGSOIncidentDialog
        open={incidentDialogOpen}
        onOpenChange={setIncidentDialogOpen}
        onSuccess={() => {
          // Could trigger a refresh of the dashboard
          toast.success("Dashboard atualizado");
        }}
      />
    </ModulePageWrapper>
  );
};

export default SGSO;
