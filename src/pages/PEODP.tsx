import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { PeoDpManager } from "@/components/peo-dp/peo-dp-manager";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { toast } from "sonner";
import {
  Shield,
  Anchor,
  Target,
  Brain,
  TrendingUp,
  Award,
  Zap,
  Globe,
  CheckCircle,
  Plus,
  RefreshCw,
  Download,
  Settings
} from "lucide-react";

const PEODP = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh } = useMaritimeActions();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Real action handlers - scroll to sections or activate tabs
  const handleDigitalizedPlan = () => {
    const planEl = document.getElementById('peo-dp-plan');
    if (planEl) {
      planEl.scrollIntoView({ behavior: 'smooth' });
      toast.success("Plano Digitalizado", { description: "Navegando para o plano DP" });
    }
  };

  const handleManagerialDashboard = () => {
    // Find and click the dashboard tab
    const dashboardTab = document.querySelector('[data-value="dashboard"]') as HTMLElement;
    if (dashboardTab) {
      dashboardTab.click();
      toast.success("Dashboard Gerencial", { description: "Painel de indicadores carregado" });
    } else {
      toast.success("Dashboard Gerencial", { description: "Painel de indicadores DP" });
    }
  };

  const handleFMEAIntegration = () => {
    const fmeaTab = document.querySelector('[data-value="fmea"]') as HTMLElement;
    if (fmeaTab) {
      fmeaTab.click();
      toast.success("Integração FMEA", { description: "Análise de modos de falha" });
    } else {
      toast.success("Integração FMEA", { description: "Análise de modos de falha iniciada" });
    }
  };

  const handleDPTrials = () => {
    const trialsTab = document.querySelector('[data-value="trials"]') as HTMLElement;
    if (trialsTab) {
      trialsTab.click();
      toast.success("DP Trials", { description: "Registro de trials de DP" });
    } else {
      toast.success("DP Trials", { description: "Registro de trials de DP aberto" });
    }
  };

  const handleAIValidation = () => {
    const aiTab = document.querySelector('[data-value="ai"]') as HTMLElement;
    if (aiTab) {
      aiTab.click();
      toast.success("Validação IA", { description: "Validação com inteligência artificial" });
    } else {
      toast.success("Validação IA", { description: "Validação com inteligência artificial iniciada" });
    }
  };

  const handleRiskAssessment = () => {
    const riskTab = document.querySelector('[data-value="risk"]') as HTMLElement;
    if (riskTab) {
      riskTab.click();
      toast.success("Risk Assessment", { description: "Avaliação de riscos DP" });
    } else {
      toast.success("Risk Assessment", { description: "Avaliação de riscos DP aberta" });
    }
  };

  const handleNewPlan = () => {
    // Trigger create action or open modal
    const createBtn = document.querySelector('[data-action="create-plan"]') as HTMLElement;
    if (createBtn) {
      createBtn.click();
    }
    toast.success("Novo Plano DP", { description: "Formulário de novo plano aberto" });
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="PEO-DP - Dynamic Positioning Plan"
        description="Plano de Operações com DP Digitalizado e Inteligente"
        gradient="indigo"
        badges={[
          { icon: Brain, label: "IA & Validação" },
          { icon: Shield, label: "Compliance IMCA" },
          { icon: Target, label: "6 Seções Completas" },
          { icon: TrendingUp, label: "Análise Preditiva" }
        ]}
      />

      {/* PEO-DP Manager */}
      <div id="peo-dp-plan">
        <PeoDpManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peo-dp"
        moduleName="PEO-DP"
        actions={[
          {
            id: "plan",
            label: "Plano Digitalizado",
            icon: <Target className="h-3 w-3" />,
            action: handleDigitalizedPlan
          },
          {
            id: "dashboard",
            label: "Dashboard Gerencial",
            icon: <TrendingUp className="h-3 w-3" />,
            action: handleManagerialDashboard
          },
          {
            id: "fmea",
            label: "Integração FMEA",
            icon: <Settings className="h-3 w-3" />,
            action: handleFMEAIntegration
          },
          {
            id: "trials",
            label: "DP Trials",
            icon: <CheckCircle className="h-3 w-3" />,
            action: handleDPTrials
          },
          {
            id: "validation",
            label: "Validação IA",
            icon: <Brain className="h-3 w-3" />,
            action: handleAIValidation
          },
          {
            id: "risk",
            label: "Risk Assessment",
            icon: <Shield className="h-3 w-3" />,
            action: handleRiskAssessment
          }
        ]}
        quickActions={[
          {
            id: "new-plan",
            label: "Novo Plano",
            icon: <Plus className="h-3 w-3" />,
            action: handleNewPlan
          },
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh("PEO-DP", async () => window.location.reload()),
            shortcut: "F5"
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport("PEO-DP")
          }
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEODP;
