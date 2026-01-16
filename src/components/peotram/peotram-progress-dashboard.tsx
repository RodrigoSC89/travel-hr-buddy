/**
 * PeotramProgressDashboard - Dashboard de Progresso PEOTRAM 2024
 * Mostra score por elemento, não conformidades pendentes e indicadores gerais
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PEOTRAM_2024_ELEMENTOS_OFICIAIS,
  CLASSIFICACAO_NC_OFICIAL,
  getScoreColorOficial,
  getScoreLevelOficial,
  type PeotramElementoCompleto
} from "@/data/peotram-2024-integrated";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Target,
  Shield,
  FileText,
  Users,
  Wrench,
  Activity
} from "lucide-react";

interface AuditProgress {
  elementNumber: number;
  completed: number;
  total: number;
  score: number;
  ncCounts: Record<string, number>;
}

interface PeotramProgressDashboardProps {
  auditData?: Record<string, {
    nota: number | null;
    cnc: string;
  }>;
  vesselName?: string;
  auditDate?: string;
}

export const PeotramProgressDashboard: React.FC<PeotramProgressDashboardProps> = ({
  auditData = {},
  vesselName = "Embarcação",
  auditDate = new Date().toISOString().split("T")[0]
}) => {
  // Calculate progress for each element
  const elementProgress = useMemo(() => {
    const progress: AuditProgress[] = [];

    PEOTRAM_2024_ELEMENTOS_OFICIAIS.forEach(elemento => {
      let completed = 0;
      let totalScore = 0;
      let scoredItems = 0;
      let total = 0;
      const ncCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

      elemento.secoes.forEach(secao => {
        secao.requisitos.forEach(req => {
          total++;
          const response = auditData[req.codigo];
          if (response?.nota !== null && response?.nota !== undefined) {
            completed++;
            totalScore += response.nota;
            scoredItems++;
          }
          if (response?.cnc && ["A", "B", "C", "D"].includes(response.cnc)) {
            ncCounts[response.cnc]++;
          }
        });
      });

      progress.push({
        elementNumber: elemento.numero,
        completed,
        total,
        score: scoredItems > 0 ? Math.round((totalScore / (scoredItems * 4)) * 100) : 0,
        ncCounts
      });
    });

    return progress;
  }, [auditData]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalCompleted = elementProgress.reduce((sum, p) => sum + p.completed, 0);
    const totalItems = elementProgress.reduce((sum, p) => sum + p.total, 0);
    const totalScore = elementProgress.reduce((sum, p) => sum + (p.score * p.completed), 0);
    const totalScored = elementProgress.reduce((sum, p) => sum + p.completed, 0);

    const ncTotals = { A: 0, B: 0, C: 0, D: 0 };
    elementProgress.forEach(p => {
      Object.keys(ncTotals).forEach(key => {
        ncTotals[key as keyof typeof ncTotals] += p.ncCounts[key] || 0;
      });
    });

    const criticalElements = PEOTRAM_2024_ELEMENTOS_OFICIAIS.filter(e => e.isCritico);
    const criticalProgress = elementProgress.filter(p => 
      criticalElements.some(e => e.numero === p.elementNumber)
    );
    const criticalScore = criticalProgress.length > 0
      ? Math.round(criticalProgress.reduce((sum, p) => sum + p.score, 0) / criticalProgress.length)
      : 0;

    return {
      completed: totalCompleted,
      total: totalItems,
      percent: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      score: totalScored > 0 ? Math.round(totalScore / totalScored) : 0,
      ncTotals,
      criticalScore,
      totalNC: ncTotals.A + ncTotals.B + ncTotals.C + ncTotals.D
    };
  }, [elementProgress]);

  // Get element icon
  const getElementIcon = (num: number) => {
    const icons: Record<number, React.ComponentType<any>> = {
      1: Shield, 2: FileText, 3: AlertTriangle, 4: Activity,
      5: Target, 6: Wrench, 7: Users, 8: BarChart3,
      9: Users, 10: FileText, 11: AlertTriangle, 12: Activity, 13: TrendingUp
    };
    return icons[num] || Target;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard PEOTRAM 2024</h2>
          <p className="text-muted-foreground">{vesselName} • {auditDate}</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          13 Elementos • 195 Requisitos
        </Badge>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className={`text-4xl font-bold ${getScoreColorOficial(overallStats.score)}`}>
                  {overallStats.score}%
                </p>
                <p className="text-sm mt-1">{getScoreLevelOficial(overallStats.score)}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-4xl font-bold">{overallStats.percent}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {overallStats.completed}/{overallStats.total} itens
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Progress value={overallStats.percent} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Elementos Críticos</p>
                <p className={`text-4xl font-bold ${getScoreColorOficial(overallStats.criticalScore)}`}>
                  {overallStats.criticalScore}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {PEOTRAM_2024_ELEMENTOS_OFICIAIS.filter(e => e.isCritico).length} elementos
                </p>
              </div>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <Star className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
                <p className="text-4xl font-bold text-orange-600">{overallStats.totalNC}</p>
                <div className="flex gap-1 mt-1">
                  {overallStats.ncTotals.A > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">{overallStats.ncTotals.A} A</Badge>
                  )}
                  {overallStats.ncTotals.B > 0 && (
                    <Badge className="bg-orange-500 text-white text-xs">{overallStats.ncTotals.B} B</Badge>
                  )}
                  {overallStats.ncTotals.C > 0 && (
                    <Badge className="bg-yellow-500 text-black text-xs">{overallStats.ncTotals.C} C</Badge>
                  )}
                  {overallStats.ncTotals.D > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs">{overallStats.ncTotals.D} D</Badge>
                  )}
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Elements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Score por Elemento
          </CardTitle>
          <CardDescription>
            Desempenho individual de cada um dos 13 elementos PEOTRAM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PEOTRAM_2024_ELEMENTOS_OFICIAIS.map(elemento => {
              const prog = elementProgress.find(p => p.elementNumber === elemento.numero);
              const Icon = getElementIcon(elemento.numero);
              const score = prog?.score || 0;
              const percent = prog && prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;

              return (
                <Card 
                  key={elemento.numero} 
                  className={`relative overflow-hidden ${elemento.isCritico ? "border-destructive/30" : ""}`}
                >
                  {elemento.isCritico && (
                    <div className="absolute top-0 right-0">
                      <Badge variant="destructive" className="rounded-bl-lg rounded-tr-none">
                        <Star className="w-3 h-3 mr-1" />
                        Crítico
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${elemento.isCritico ? "bg-red-100" : "bg-primary/10"}`}>
                        <Icon className={`h-5 w-5 ${elemento.isCritico ? "text-red-600" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{elemento.numero}</Badge>
                          <span className={`text-xl font-bold ${getScoreColorOficial(score)}`}>
                            {score}%
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate mt-1" title={elemento.nome}>
                          {elemento.nome}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{prog?.completed || 0}/{prog?.total || 0}</span>
                          <Progress value={percent} className="flex-1 h-1" />
                          <span>{percent}%</span>
                        </div>
                        
                        {/* NC indicators */}
                        {prog && (prog.ncCounts.A > 0 || prog.ncCounts.B > 0 || prog.ncCounts.C > 0) && (
                          <div className="flex gap-1 mt-2">
                            {prog.ncCounts.A > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">{prog.ncCounts.A}</Badge>
                            )}
                            {prog.ncCounts.B > 0 && (
                              <Badge className="bg-orange-500 text-white text-xs">{prog.ncCounts.B}</Badge>
                            )}
                            {prog.ncCounts.C > 0 && (
                              <Badge className="bg-yellow-500 text-black text-xs">{prog.ncCounts.C}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* NC Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Não Conformidades por Classificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CLASSIFICACAO_NC_OFICIAL.filter(nc => ["A", "B", "C", "D"].includes(nc.codigo)).map(nc => {
                const count = overallStats.ncTotals[nc.codigo as keyof typeof overallStats.ncTotals] || 0;
                const percent = overallStats.totalNC > 0 ? Math.round((count / overallStats.totalNC) * 100) : 0;

                return (
                  <div key={nc.codigo} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`
                          ${nc.codigo === "A" ? "bg-red-500" : ""}
                          ${nc.codigo === "B" ? "bg-orange-500" : ""}
                          ${nc.codigo === "C" ? "bg-yellow-500 text-black" : ""}
                          ${nc.codigo === "D" ? "bg-blue-500" : ""}
                          text-white
                        `}>
                          {nc.codigo}
                        </Badge>
                        <span className="text-sm font-medium">{nc.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{nc.prazo}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                    <Progress 
                      value={percent} 
                      className={`h-2 ${
                        nc.codigo === "A" ? "[&>div]:bg-red-500" : 
                        nc.codigo === "B" ? "[&>div]:bg-orange-500" : 
                        nc.codigo === "C" ? "[&>div]:bg-yellow-500" : 
                        "[&>div]:bg-blue-500"
                      }`} 
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazos de Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CLASSIFICACAO_NC_OFICIAL.filter(nc => ["A", "B", "C", "D"].includes(nc.codigo)).map(nc => {
                const count = overallStats.ncTotals[nc.codigo as keyof typeof overallStats.ncTotals] || 0;
                
                return (
                  <div key={nc.codigo} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge className={`
                        ${nc.codigo === "A" ? "bg-red-500" : ""}
                        ${nc.codigo === "B" ? "bg-orange-500" : ""}
                        ${nc.codigo === "C" ? "bg-yellow-500 text-black" : ""}
                        ${nc.codigo === "D" ? "bg-blue-500" : ""}
                        text-white
                      `}>
                        {nc.codigo}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{nc.nome}</p>
                        <p className="text-xs text-muted-foreground">{nc.descricao}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{nc.prazo || "N/A"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring criteria reference */}
      <Card>
        <CardHeader>
          <CardTitle>Critérios de Pontuação PEOTRAM 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { nota: "N/A", desc: "Não Aplicável", percent: 0, color: "bg-gray-100" },
              { nota: "0", desc: "Não Evidenciado", percent: 0, color: "bg-red-100" },
              { nota: "1", desc: "Falhas Sistemáticas", percent: 20, color: "bg-orange-100" },
              { nota: "2", desc: "Falhas Pontuais", percent: 50, color: "bg-yellow-100" },
              { nota: "3", desc: "Sem Falhas", percent: 90, color: "bg-green-100" },
              { nota: "4", desc: "Excelência", percent: 100, color: "bg-emerald-100" }
            ].map(item => (
              <div key={item.nota} className={`p-3 rounded-lg ${item.color}`}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-lg">{item.nota}</Badge>
                  <span className="font-bold">{item.percent}%</span>
                </div>
                <p className="text-xs mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeotramProgressDashboard;
