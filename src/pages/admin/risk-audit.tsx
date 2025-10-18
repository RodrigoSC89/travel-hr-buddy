import React, { useState } from "react";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Shield, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RiskAuditPage = () => {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="red">
        <ModuleHeader
          icon={Shield}
          title="Navegação Tática com IA + Previsibilidade de Auditoria"
          description="Sistema de inteligência tática para previsão de riscos operacionais e simulação de auditorias"
          gradient="red"
          badges={[
            { icon: AlertTriangle, label: "Análise de Riscos" },
            { icon: TrendingUp, label: "Previsão IA" },
            { icon: CheckCircle2, label: "Conformidade" }
          ]}
        />

        <div className="space-y-6">
          <Tabs defaultValue="tactical-risks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tactical-risks">
                Riscos Táticos
              </TabsTrigger>
              <TabsTrigger value="audit-simulator">
                Simulador de Auditoria
              </TabsTrigger>
              <TabsTrigger value="actions">
                Ações Recomendadas
              </TabsTrigger>
              <TabsTrigger value="normative">
                Scores Normativos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tactical-risks" className="mt-6">
              <TacticalRiskPanel 
                selectedVessel={selectedVessel}
                onVesselSelect={setSelectedVessel}
              />
            </TabsContent>

            <TabsContent value="audit-simulator" className="mt-6">
              <AuditSimulator 
                selectedVessel={selectedVessel}
                onVesselSelect={setSelectedVessel}
              />
            </TabsContent>

            <TabsContent value="actions" className="mt-6">
              <RecommendedActions 
                selectedVessel={selectedVessel}
              />
            </TabsContent>

            <TabsContent value="normative" className="mt-6">
              <NormativeScores 
                selectedVessel={selectedVessel}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
};

export default RiskAuditPage;
