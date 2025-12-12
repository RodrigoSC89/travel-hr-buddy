import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  FileText,
  Clock,
  Users,
  Ship,
  Gauge,
  Brain,
  Download,
  RefreshCw,
  BarChart3,
  PieChart
} from "lucide-react";

interface RiskIndicator {
  id: string;
  name: string;
  category: "operational" | "compliance" | "reputational" | "technical";
  currentScore: number;
  previousScore: number;
  trend: "up" | "down" | "stable";
  threshold: number;
  status: "green" | "yellow" | "red";
}

interface ComplianceItem {
  id: string;
  framework: "PEOTRAM" | "IMCA" | "ISM" | "ISPS" | "NORMAM";
  requirement: string;
  status: "compliant" | "partial" | "non_compliant" | "pending";
  lastAudit: string;
  nextAudit: string;
  score: number;
}

interface Decision {
  id: string;
  date: string;
  title: string;
  decidedBy: string;
  justification: string;
  aiExplanation: string;
  impact: "high" | "medium" | "low";
  outcome: "positive" | "neutral" | "negative";
}

const mockRiskIndicators: RiskIndicator[] = [
  { id: "RISK-001", name: "DP Uptime", category: "operational", currentScore: 98.5, previousScore: 97.2, trend: "up", threshold: 95, status: "green" },
  { id: "RISK-002", name: "Compliance PEOTRAM", category: "compliance", currentScore: 92, previousScore: 94, trend: "down", threshold: 85, status: "green" },
  { id: "RISK-003", name: "Incidentes/Mês", category: "operational", currentScore: 2, previousScore: 1, trend: "up", threshold: 3, status: "yellow" },
  { id: "RISK-004", name: "Certificações Válidas", category: "compliance", currentScore: 95, previousScore: 95, trend: "stable", threshold: 100, status: "yellow" },
  { id: "RISK-005", name: "CPD Médio Tripulação", category: "operational", currentScore: 78, previousScore: 72, trend: "up", threshold: 75, status: "green" },
  { id: "RISK-006", name: "Tempo Resposta Auditorias", category: "compliance", currentScore: 4.5, previousScore: 6.2, trend: "down", threshold: 5, status: "green" },
  { id: "RISK-007", name: "Satisfação Cliente", category: "reputational", currentScore: 88, previousScore: 85, trend: "up", threshold: 80, status: "green" },
  { id: "RISK-008", name: "MTBF Equipamentos DP", category: "technical", currentScore: 2500, previousScore: 2200, trend: "up", threshold: 2000, status: "green" }
];

const mockComplianceItems: ComplianceItem[] = [
  { id: "COMP-001", framework: "PEOTRAM", requirement: "Elemento 1 - Sistema de Gestão", status: "compliant", lastAudit: "2024-11-15", nextAudit: "2025-02-15", score: 95 },
  { id: "COMP-002", framework: "PEOTRAM", requirement: "Elemento 2 - Conformidade Legal", status: "compliant", lastAudit: "2024-11-15", nextAudit: "2025-02-15", score: 92 },
  { id: "COMP-003", framework: "IMCA", requirement: "M117 - DP Operations", status: "partial", lastAudit: "2024-10-20", nextAudit: "2025-01-20", score: 78 },
  { id: "COMP-004", framework: "ISM", requirement: "DOC Annual Verification", status: "compliant", lastAudit: "2024-09-01", nextAudit: "2025-09-01", score: 100 },
  { id: "COMP-005", framework: "NORMAM", requirement: "NORMAM-01 - Embarcações", status: "compliant", lastAudit: "2024-08-15", nextAudit: "2025-08-15", score: 98 },
  { id: "COMP-006", framework: "IMCA", requirement: "M166 - FMEA", status: "pending", lastAudit: "2024-07-01", nextAudit: "2025-01-01", score: 85 }
];

const mockDecisions: Decision[] = [
  {
    id: "DEC-001",
    date: "2024-12-01",
    title: "Suspensão de operação por condições meteo",
    decidedBy: "Capitão João Silva",
    justification: "Vento excedendo limites ASOG por mais de 30 minutos",
    aiExplanation: "Decisão correta conforme ASOG-2024-001. Condições meteorológicas ultrapassaram limite de 30kn por 45 minutos. Histórico similar de 3 eventos mostra que continuar operação resultou em desvio de posição em 67% dos casos.",
    impact: "high",
    outcome: "positive"
  },
  {
    id: "DEC-002",
    date: "2024-11-28",
    title: "Alteração de ganho durante aproximação",
    decidedBy: "SDPO Maria Santos",
    justification: "Oscilações de heading detectadas",
    aiExplanation: "Ação apropriada para condições de mar calmo. Ganho original configurado para condições de mar moderado causava sobre-correção. Ajuste reduziu oscilações de ±5° para ±1°.",
    impact: "medium",
    outcome: "positive"
  },
  {
    id: "DEC-003",
    date: "2024-11-25",
    title: "Continuação de operação com sensor degradado",
    decidedBy: "DPO Carlos Eduardo",
    justification: "Redundância suficiente disponível",
    aiExplanation: "Decisão dentro dos limites operacionais. MRU#2 operando normalmente como backup. Recomendação: monitorar de perto e agendar manutenção preventiva em próximo porto.",
    impact: "low",
    outcome: "neutral"
  }
];

export const GRCModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [riskIndicators] = useState<RiskIndicator[]>(mockRiskIndicators);
  const [complianceItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [decisions] = useState<Decision[]>(mockDecisions);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "green": return "text-green-500";
    case "yellow": return "text-yellow-500";
    case "red": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
    case "compliant": return <Badge className="bg-green-500">Conforme</Badge>;
    case "partial": return <Badge className="bg-yellow-500 text-black">Parcial</Badge>;
    case "non_compliant": return <Badge variant="destructive">Não Conforme</Badge>;
    case "pending": return <Badge variant="outline">Pendente</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const overallRiskScore = Math.round(riskIndicators.filter(r => r.status === "green").length / riskIndicators.length * 100);
  const complianceScore = Math.round(complianceItems.filter(c => c.status === "compliant").length / complianceItems.length * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">GRC - Governance, Risk & Compliance</h2>
            <p className="text-muted-foreground">Controle institucional de risco e conformidade offshore</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
          <Button><Download className="w-4 h-4 mr-2" />Relatório Executivo</Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral de Risco</p>
                <p className="text-3xl font-bold text-green-500">{overallRiskScore}%</p>
              </div>
              <Gauge className="h-10 w-10 text-green-500" />
            </div>
            <Progress value={overallRiskScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-3xl font-bold text-blue-500">{complianceScore}%</p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-500" />
            </div>
            <Progress value={complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indicadores em Alerta</p>
                <p className="text-3xl font-bold text-yellow-500">{riskIndicators.filter(r => r.status !== "green").length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auditorias Pendentes</p>
                <p className="text-3xl font-bold text-purple-500">{complianceItems.filter(c => c.status === "pending").length}</p>
              </div>
              <Clock className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2"><Target className="w-4 h-4" />Riscos</TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2"><Shield className="w-4 h-4" />Compliance</TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2"><Brain className="w-4 h-4" />Decisões</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Risk Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral de Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskIndicators.slice(0, 5).map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${indicator.status === "green" ? "bg-green-500" : indicator.status === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="font-medium">{indicator.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getStatusColor(indicator.status)}`}>
                          {indicator.currentScore}{indicator.category === "operational" && indicator.name.includes("Uptime") ? "%" : ""}
                        </span>
                        {indicator.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : indicator.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.framework}</Badge>
                          <span className="text-sm font-medium">{item.requirement}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Próxima auditoria: {new Date(item.nextAudit).toLocaleDateString("pt-BR")}</p>
                      </div>
                      {getComplianceStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Risco</CardTitle>
              <CardDescription>Monitoramento em tempo real de KPIs operacionais e de conformidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {riskIndicators.map((indicator) => (
                  <div key={indicator.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${indicator.status === "green" ? "bg-green-500" : indicator.status === "yellow" ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="font-medium">{indicator.name}</span>
                      </div>
                      <Badge variant="outline">{indicator.category}</Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className={`text-3xl font-bold ${getStatusColor(indicator.status)}`}>
                          {indicator.currentScore}
                        </p>
                        <p className="text-xs text-muted-foreground">Threshold: {indicator.threshold}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {indicator.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : indicator.trend === "down" ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">
                            {indicator.trend === "up" ? "+" : indicator.trend === "down" ? "" : ""}
                            {(indicator.currentScore - indicator.previousScore).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">vs período anterior</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Framework de Compliance</CardTitle>
              <CardDescription>PEOTRAM, IMCA, ISM, ISPS, NORMAM</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {complianceItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge>{item.framework}</Badge>
                          <span className="font-medium">{item.requirement}</span>
                        </div>
                        {getComplianceStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Última auditoria: {new Date(item.lastAudit).toLocaleDateString("pt-BR")}</span>
                        <span>Próxima: {new Date(item.nextAudit).toLocaleDateString("pt-BR")}</span>
                        <span>Score: <span className="font-medium text-foreground">{item.score}%</span></span>
                      </div>
                      <Progress value={item.score} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Histórico de Decisões com Explicação IA
              </CardTitle>
              <CardDescription>Registro de decisões operacionais com justificativas técnicas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={decision.outcome === "positive" ? "default" : decision.outcome === "neutral" ? "secondary" : "destructive"}>
                            {decision.outcome === "positive" ? "Positivo" : decision.outcome === "neutral" ? "Neutro" : "Negativo"}
                          </Badge>
                          <Badge variant="outline">{decision.impact === "high" ? "Alto Impacto" : decision.impact === "medium" ? "Médio" : "Baixo"}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{new Date(decision.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <h4 className="font-semibold mb-1">{decision.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">Decidido por: {decision.decidedBy}</p>
                      <p className="text-sm mb-3"><strong>Justificativa:</strong> {decision.justification}</p>
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Explicação IA:</strong> {decision.aiExplanation}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GRCModule;
