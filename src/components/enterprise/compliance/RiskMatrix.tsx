/**
 * Risk Matrix Component
 * Mapa de calor de riscos com drill-down e planos de mitigação
 */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  TrendingUp,
  Target,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
interface Risk {
  id: string;
  title: string;
  category: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  status: "open" | "mitigating" | "mitigated" | "accepted";
  owner: string;
  dueDate: string;
  mitigationPlan?: string;
  controls: string[];
  trend: "up" | "down" | "stable";
}

const fallbackRisks: Risk[] = [
  {
    id: "1",
    title: "Falha em equipamento crítico de navegação",
    category: "Operacional",
    likelihood: 3,
    impact: 5,
    riskScore: 15,
    status: "mitigating",
    owner: "Cap. João Silva",
    dueDate: "2025-03-15",
    mitigationPlan: "Implementar redundância de sistemas e manutenção preventiva mensal",
    controls: ["Manutenção preventiva", "Sistema de backup", "Treinamento de emergência"],
    trend: "down"
  },
  {
    id: "2",
    title: "Não conformidade com regulamentações MARPOL",
    category: "Compliance",
    likelihood: 2,
    impact: 4,
    riskScore: 8,
    status: "mitigated",
    owner: "Maria Santos",
    dueDate: "2025-02-28",
    mitigationPlan: "Atualizar procedimentos de gestão de resíduos",
    controls: ["Treinamento tripulação", "Auditorias internas", "Software de tracking"],
    trend: "down"
  },
  {
    id: "3",
    title: "Cyberattack em sistemas de bordo",
    category: "Tecnologia",
    likelihood: 4,
    impact: 5,
    riskScore: 20,
    status: "open",
    owner: "Pedro Tech",
    dueDate: "2025-04-01",
    mitigationPlan: "Implementar firewalls e políticas de segurança cibernética",
    controls: ["Firewall atualizado", "Política de senhas", "Backup offline"],
    trend: "up"
  },
  {
    id: "4",
    title: "Lesões ocupacionais em operações de carga",
    category: "Segurança",
    likelihood: 3,
    impact: 3,
    riskScore: 9,
    status: "mitigating",
    owner: "Ana HSE",
    dueDate: "2025-03-01",
    mitigationPlan: "Melhorar EPIs e procedimentos de segurança",
    controls: ["EPIs adequados", "Procedimentos atualizados", "Toolbox talks diários"],
    trend: "stable"
  },
  {
    id: "5",
    title: "Flutuação de preços de combustível",
    category: "Financeiro",
    likelihood: 5,
    impact: 3,
    riskScore: 15,
    status: "accepted",
    owner: "Carlos Finance",
    dueDate: "2025-12-31",
    mitigationPlan: "Contratos de hedge e otimização de rotas",
    controls: ["Contratos futuros", "Otimização de velocidade", "Monitoramento de mercado"],
    trend: "stable"
  }
];

const LIKELIHOOD_LABELS = ["", "Raro", "Improvável", "Possível", "Provável", "Quase Certo"];
const IMPACT_LABELS = ["", "Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"];

export function RiskMatrix() {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [risks, setRisks] = useState<Risk[]>(fallbackRisks);

  useEffect(() => {
    supabase.from("non_conformities").select("*").limit(20).then(({ data }) => {
      if (data && data.length > 0) {
        setRisks(data.map((nc: any, i: number) => ({
          id: nc.id, title: nc.description || nc.title || `Risk ${i+1}`,
          category: nc.category || "Operacional", likelihood: Math.min(5, Math.max(1, nc.severity || 3)) as any,
          impact: Math.min(5, Math.max(1, nc.impact_level || 3)) as any,
          riskScore: (nc.severity || 3) * (nc.impact_level || 3),
          status: nc.status === "closed" ? "mitigated" as const : "open" as const,
          owner: nc.responsible_person || "N/A", dueDate: nc.due_date || "",
          mitigationPlan: nc.corrective_action || "", controls: [], trend: "stable" as const,
        })));
      }
    });
  }, []);

  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Crítico", color: "bg-red-500", textColor: "text-red-500" };
    if (score >= 10) return { label: "Alto", color: "bg-orange-500", textColor: "text-orange-500" };
    if (score >= 5) return { label: "Médio", color: "bg-yellow-500", textColor: "text-yellow-500" };
    return { label: "Baixo", color: "bg-green-500", textColor: "text-green-500" };
  };

  const getStatusBadge = (status: Risk["status"]) => {
    switch (status) {
      case "open": return <Badge variant="destructive">Aberto</Badge>;
      case "mitigating": return <Badge className="bg-yellow-500/10 text-yellow-500">Em Mitigação</Badge>;
      case "mitigated": return <Badge className="bg-green-500/10 text-green-500">Mitigado</Badge>;
      case "accepted": return <Badge variant="secondary">Aceito</Badge>;
    }
  };

  const getTrendIcon = (trend: Risk["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <div className="h-4 w-4 border-t-2 border-muted-foreground" />;
    }
  };

  const matrixGrid = Array(5).fill(null).map(() => Array(5).fill(null).map(() => [] as Risk[]));
  risks.forEach((risk: Risk) => { matrixGrid[5 - risk.impact][risk.likelihood - 1].push(risk); });

  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return "bg-red-500/20 hover:bg-red-500/30";
    if (score >= 10) return "bg-orange-500/20 hover:bg-orange-500/30";
    if (score >= 5) return "bg-yellow-500/20 hover:bg-yellow-500/30";
    return "bg-green-500/20 hover:bg-green-500/30";
  };

  const stats = {
    total: risks.length,
    critical: risks.filter((r: Risk) => r.riskScore >= 15).length,
    high: risks.filter((r: Risk) => r.riskScore >= 10 && r.riskScore < 15).length,
    mitigated: risks.filter((r: Risk) => r.status === "mitigated").length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Riscos Totais</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-3xl font-bold text-red-500">{stats.critical}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Altos</p>
                <p className="text-3xl font-bold text-orange-500">{stats.high}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mitigados</p>
                <p className="text-3xl font-bold text-green-500">{stats.mitigated}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heat Map Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matriz de Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Y-axis label */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium">
                IMPACTO →
              </div>

              <div className="ml-4">
                {/* Matrix Grid */}
                <div className="grid grid-cols-6 gap-1">
                  {/* Header row */}
                  <div className="h-8" />
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                      {i}
                    </div>
                  ))}

                  {/* Matrix cells */}
                  {[5, 4, 3, 2, 1].map(impact => (
                    <React.Fragment key={impact}>
                      <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">
                        {impact}
                      </div>
                      {[1, 2, 3, 4, 5].map(likelihood => {
                        const cellRisks = matrixGrid[5 - impact][likelihood - 1];
                        return (
                          <div
                            key={`${likelihood}-${impact}`}
                            className={`h-16 rounded-lg ${getCellColor(likelihood, impact)} flex items-center justify-center transition-colors cursor-pointer`}
                          >
                            {cellRisks.length > 0 && (
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-bold">{cellRisks.length}</span>
                                <span className="text-xs">{likelihood * impact}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {/* X-axis label */}
                <div className="text-center text-xs text-muted-foreground font-medium mt-2">
                  PROBABILIDADE →
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/30" />
                <span className="text-xs">Baixo (1-4)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500/30" />
                <span className="text-xs">Médio (5-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500/30" />
                <span className="text-xs">Alto (10-14)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/30" />
                <span className="text-xs">Crítico (15-25)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Riscos por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...risks].sort((a: Risk, b: Risk) => b.riskScore - a.riskScore).map((risk: Risk) => {
              const level = getRiskLevel(risk.riskScore);
              return (
                <Dialog key={risk.id}>
                  <DialogTrigger asChild>
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${level.color}/20 flex items-center justify-center`}>
                            <span className={`font-bold ${level.textColor}`}>{risk.riskScore}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{risk.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                              {getStatusBadge(risk.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(risk.trend)}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${level.color}/20 flex items-center justify-center`}>
                          <span className={`font-bold text-sm ${level.textColor}`}>{risk.riskScore}</span>
                        </div>
                        {risk.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Probabilidade</p>
                          <p className="font-medium">{LIKELIHOOD_LABELS[risk.likelihood]} ({risk.likelihood}/5)</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Impacto</p>
                          <p className="font-medium">{IMPACT_LABELS[risk.impact]} ({risk.impact}/5)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-4 w-4" />
                          {risk.owner}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(risk.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                        {getStatusBadge(risk.status)}
                      </div>

                      {risk.mitigationPlan && (
                        <div>
                          <p className="text-sm font-medium mb-2">Plano de Mitigação</p>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {risk.mitigationPlan}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Controles Implementados</p>
                        <div className="flex flex-wrap gap-2">
                          {risk.controls.map((control, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {control}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button className="flex-1" onClick={() => toast.info("Editor de risco — Em implantação", { description: "A edição inline de riscos será disponibilizada em Q3/2026. Use o módulo Compliance Hub para gerenciar riscos.", duration: 5000 })}>Editar Risco</Button>
                        <Button variant="outline" className="flex-1" onClick={() => toast.info("Histórico de risco — Em implantação", { description: "O registro de alterações e avaliações anteriores será disponibilizado em Q3/2026.", duration: 5000 })}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Histórico
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RiskMatrix;
