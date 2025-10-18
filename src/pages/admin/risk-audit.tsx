import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, FileCheck, ListTodo, BarChart3 } from "lucide-react";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";

export default function RiskAudit() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
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
              Previsibilidade de Auditoria e Gestão de Riscos Operacionais
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="risks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Riscos Táticos
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Simulador de Auditoria
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Ações Recomendadas
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Scores Normativos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          <TacticalRiskPanel />
        </TabsContent>

        <TabsContent value="simulator">
          <AuditSimulator />
        </TabsContent>

        <TabsContent value="actions">
          <RecommendedActions />
        </TabsContent>

        <TabsContent value="scores">
          <NormativeScores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
