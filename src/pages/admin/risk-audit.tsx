import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";

export default function RiskAudit() {
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
            <h1 className="text-3xl font-bold">Navegação Tática com IA</h1>
            <p className="text-muted-foreground">
              Previsão de riscos e simulação de auditorias com inteligência artificial
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="risks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">Riscos Táticos</TabsTrigger>
          <TabsTrigger value="audit">Simulador de Auditoria</TabsTrigger>
          <TabsTrigger value="actions">Ações Recomendadas</TabsTrigger>
          <TabsTrigger value="scores">Scores Normativos</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <TacticalRiskPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditSimulator />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <RecommendedActions />
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <NormativeScores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
