import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
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
  Download
} from "lucide-react";

const SGSO = () => {
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();
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
          { icon: Shield, label: "Segurança Total" }
        ]}
      />

      {/* SGSO Dashboard */}
      <SgsoDashboard />

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
            action: () => window.location.href = "/sgso/report"
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
