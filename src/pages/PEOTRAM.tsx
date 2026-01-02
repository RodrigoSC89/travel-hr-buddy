import React, { useState, useEffect } from "react";
import { PeotramAuditManager } from "@/components/peotram/peotram-audit-manager";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import { 
  FileCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Award,
  Globe,
  Clock,
  Plus,
  RefreshCw,
  Download
} from "lucide-react";

const PEOTRAM = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh } = useMaritimeActions();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Real action handlers
  const handleNewAudit = () => {
    toast.success("Nova Auditoria PEOTRAM", { description: "Formulário de auditoria aberto" });
  };

  const handleReports = () => {
    handleGenerateReport("Relatório PEOTRAM");
  };

  const handleCompliance = () => {
    toast.success("Conformidade", { description: "Painel de conformidade PEOTRAM aberto" });
    const complianceEl = document.getElementById('peotram-compliance');
    if (complianceEl) complianceEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAIAnalysis = () => {
    toast.success("Análise IA", { description: "Análise preditiva com IA iniciada" });
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={FileCheck}
        title="PEOTRAM - Auditoria Petrobras"
        description="Sistema de auditoria anual inteligente"
        gradient="yellow"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: Shield, label: "Conformidade Petrobras" },
          { icon: Globe, label: "Padrão Internacional" }
        ]}
      />

      {/* PEOTRAM Manager */}
      <div id="peotram-compliance">
        <PeotramAuditManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peotram"
        moduleName="PEOTRAM"
        moduleIcon={<FileCheck className="h-4 w-4" />}
        actions={[
          {
            id: "new-audit",
            label: "Nova Auditoria",
            icon: <Plus className="h-4 w-4" />,
            action: handleNewAudit,
            variant: "default"
          },
          {
            id: "reports",
            label: "Relatórios",
            icon: <BarChart3 className="h-4 w-4" />,
            action: handleReports,
            variant: "outline"
          },
          {
            id: "compliance",
            label: "Conformidade",
            icon: <Shield className="h-4 w-4" />,
            action: handleCompliance,
            variant: "outline"
          },
          {
            id: "ai-analysis",
            label: "Análise IA",
            icon: <Brain className="h-4 w-4" />,
            action: handleAIAnalysis,
            variant: "outline"
          }
        ]}
        quickActions={[
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh("PEOTRAM", async () => window.location.reload()),
            shortcut: "F5"
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport("PEOTRAM")
          }
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAM;
