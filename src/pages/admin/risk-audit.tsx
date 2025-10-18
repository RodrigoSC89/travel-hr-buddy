import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";
import {
  Shield,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function RiskAuditPage() {
  const [activeTab, setActiveTab] = useState("risks");

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Navegação Tática & Preditibilidade de Auditorias
            </h1>
            <p className="text-muted-foreground">
              Sistema de gestão de riscos táticos com IA e simulação de auditorias
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Previsão de Riscos
                  </div>
                  <div className="text-lg font-semibold">15 dias</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Tipos de Auditoria
                  </div>
                  <div className="text-lg font-semibold">6 Padrões</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Ações Recomendadas
                  </div>
                  <div className="text-lg font-semibold">Automatizadas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Atualização
                  </div>
                  <div className="text-lg font-semibold">Diária (06:00 UTC)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Riscos Táticos</span>
            <span className="sm:hidden">Riscos</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Simulador</span>
            <span className="sm:hidden">Simular</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Ações</span>
            <span className="sm:hidden">Ações</span>
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Scores</span>
            <span className="sm:hidden">Scores</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Riscos Táticos Previstos
              </h2>
              <p className="text-muted-foreground">
                Visualize e gerencie riscos operacionais previstos por IA para os
                próximos 15 dias. Os riscos são categorizados por sistema
                (DP, Energia, SGSO, etc.) e nível de criticidade.
              </p>
            </div>
            <TacticalRiskPanel />
          </div>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Simulador de Auditoria
              </h2>
              <p className="text-muted-foreground">
                Simule resultados de auditorias antes que elas aconteçam. O
                sistema analisa 6 meses de dados de conformidade e gera previsões
                de score, probabilidade de aprovação e recomendações específicas.
              </p>
            </div>
            <AuditSimulator />
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Ações Recomendadas
              </h2>
              <p className="text-muted-foreground">
                Consolida todas as ações recomendadas de riscos táticos e
                simulações de auditoria. Atribua responsáveis, acompanhe o status
                e marque como concluídas.
              </p>
            </div>
            <RecommendedActions />
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Scores Normativos
              </h2>
              <p className="text-muted-foreground">
                Visualize a prontidão de cada embarcação para os 6 tipos de
                auditoria suportados (Petrobras, IBAMA, ISO, IMCA, ISM, SGSO).
                Scores médios, probabilidades e distribuição de conformidade.
              </p>
            </div>
            <NormativeScores />
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Sistema de Navegação Tática</p>
              <p>
                Este sistema utiliza IA (GPT-4o-mini) para análise preditiva de
                riscos operacionais e simulação de auditorias. Os dados são
                atualizados automaticamente todos os dias às 06:00 UTC (03:00 BRT)
                via Edge Function. Todas as previsões incluem fallback para
                lógica baseada em regras quando IA não está disponível.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
