import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { PainelSGSO } from "@/components/sgso/PainelSGSO";
import { Shield, TrendingDown, AlertTriangle } from "lucide-react";

const AdminSGSOPanel = () => {
  return (
    <ModulePageWrapper gradient="red">
      <ModuleHeader
        icon={Shield}
        title="Painel SGSO - Administrador"
        description="Painel de Risco Operacional por Embarcação"
        gradient="red"
        badges={[
          { icon: Shield, label: "SGSO" },
          { icon: AlertTriangle, label: "Riscos" },
          { icon: TrendingDown, label: "Análise" }
        ]}
      />

      <div className="mt-6">
        <PainelSGSO />
      </div>
    </ModulePageWrapper>
  );
};

export default AdminSGSOPanel;
