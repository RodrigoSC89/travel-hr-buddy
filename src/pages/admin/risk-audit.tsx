import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Target, PlayCircle, ListChecks, Award } from "lucide-react";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";

export default function RiskAudit() {
  const [activeTab, setActiveTab] = useState("risks");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              Navegação Tática com IA + Previsibilidade de Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de gestão de riscos táticos com IA e simulação de auditorias
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Riscos Táticos
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Simulador de Auditoria
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Ações Recomendadas
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Scores Normativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-6">
          <TacticalRiskPanel />
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <AuditSimulator />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <RecommendedActions />
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <NormativeScores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
