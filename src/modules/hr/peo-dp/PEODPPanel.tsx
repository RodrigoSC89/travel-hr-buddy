/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PEO-DP Panel
 * Interface completa para Sistema Inteligente de Auditoria DP
 * Baseado em NORMAM-101 e IMCA M 117
 * PATCH 549 - Advanced Maritime Intelligence
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Shield, 
  Play, 
  Square, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity,
  Download,
  RefreshCw,
  Compass,
  Anchor,
  Bot,
  BarChart3,
  Brain
} from "lucide-react";
import { peodpCore } from "./peodp_core";
import type { PEODPAuditoria } from "@/types/peodp-audit";
import type { PEODPSessionReport, PEODPExecutiveSummary } from "./types";
import DPCopilot from "./components/DPCopilot";
import DPAnalyticsDashboard from "./components/DPAnalyticsDashboard";

export default function PEODPPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [auditoria, setAuditoria] = useState<PEODPAuditoria | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  const [vesselName, setVesselName] = useState("PSV Atlantic Explorer");
  const [dpClass, setDpClass] = useState("DP2");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionReport, setSessionReport] = useState<PEODPSessionReport | null>(null);
  const [summary, setSummary] = useState<PEODPExecutiveSummary | null>(null);

  // Check for active monitoring session
  useEffect(() => {
    const session = peodpCore.sessao_atual;
    if (session?.isActive) {
      setIsMonitoring(true);
    }
  }, []);

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const resultado = await peodpCore.iniciarAuditoria({
        vesselName,
        dpClass,
      });
      setAuditoria(resultado);
      
      // Get recommendations from engine
      const recs = resultado.resultado
        .filter(r => r.cumprimento !== "OK")
        .map(r => `${r.item}: ${r.descricao}`);
      setRecomendacoes(recs);
      
      toast.success("Auditoria PEO-DP concluída", {
        description: `Score: ${resultado.score}%`,
      });
    } catch (error) {
      toast.error("Erro ao executar auditoria", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMonitoring = () => {
    try {
      peodpCore.iniciar_monitoramento_tempo_real(vesselName, 300); // 5 minutes
      peodpCore.iniciar_loop_continuo(5); // 5 second intervals
      setIsMonitoring(true);
      toast.success("Monitoramento iniciado", {
        description: `Embarcação: ${vesselName}`,
      };
    } catch (error) {
      toast.error("Erro ao iniciar monitoramento");
    }
  };

  const handleStopMonitoring = () => {
    try {
      const report = peodpCore.parar_monitoramento();
      setSessionReport(report);
      setIsMonitoring(false);
      
      // Generate executive summary
      const execSummary = peodpCore.gerar_sumario_executivo();
      setSummary(execSummary);
      
      toast.success("Monitoramento finalizado", {
        description: report ? `${report.statistics.totalEvents} eventos registrados` : "Sessão encerrada",
      };
    } catch (error) {
      toast.error("Erro ao parar monitoramento");
    }
  };

  const handleDownloadReport = () => {
    if (!auditoria) return;
    try {
      peodpCore.downloadReports(auditoria, recomendacoes, "pdf");
      toast.success("Relatório PDF gerado");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "Excellent":
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Excelente</Badge>;
    case "Good":
      return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Bom</Badge>;
    case "Acceptable":
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Aceitável</Badge>;
    case "Critical":
      return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Crítico</Badge>;
    default:
      return <Badge variant="secondary">N/A</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">PEO-DP</h1>
            <p className="text-muted-foreground">
              Sistema Inteligente de Auditoria DP • NORMAM-101 & IMCA M 117
            </p>
          </div>
        </div>
        {isMonitoring && (
          <Badge variant="outline" className="animate-pulse border-green-500 text-green-500">
            <Activity className="h-3 w-3 mr-1" />
            Monitoramento Ativo
          </Badge>
        )}
      </div>

      <Tabs defaultValue="copilot" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="copilot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Copilot IA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="monitoramento" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Copilot IA Tab - PATCH 549 */}
        <TabsContent value="copilot" className="space-y-4">
          <DPCopilot />
        </TabsContent>

        {/* Analytics Tab - PATCH 549 */}
        <TabsContent value="analytics" className="space-y-4">
          <DPAnalyticsDashboard />
        </TabsContent>

        {/* Auditoria Tab */}
        <TabsContent value="auditoria" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5" />
                  Configuração da Auditoria
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros para a auditoria de conformidade DP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel">Embarcação</Label>
                  <Input
                    id="vessel"
                    value={vesselName}
                    onChange={handleChange}
                    placeholder="Nome da embarcação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpClass">Classe DP</Label>
                  <Select value={dpClass} onValueChange={setDpClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classe DP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DP1">DP1</SelectItem>
                      <SelectItem value="DP2">DP2</SelectItem>
                      <SelectItem value="DP3">DP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleRunAudit} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Auditoria
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Score de Conformidade
                </CardTitle>
                <CardDescription>
                  Resultado geral da auditoria baseada nas normas aplicáveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditoria ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className={`text-6xl font-bold ${getScoreColor(auditoria.score)}`}>
                        {auditoria.score}%
                      </span>
                    </div>
                    <Progress value={auditoria.score} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>
                          {auditoria.resultado.filter(r => r.cumprimento === "OK").length} Conformes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span>
                          {auditoria.resultado.filter(r => r.cumprimento === "Não Conforme").length} Não Conformes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>
                          {auditoria.resultado.filter(r => r.cumprimento === "Pendente").length} Pendentes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 text-muted-foreground">—</span>
                        <span>
                          {auditoria.resultado.filter(r => r.cumprimento === "N/A").length} N/A
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadReport}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Execute uma auditoria para ver os resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          {auditoria && (
            <Card>
              <CardHeader>
                <CardTitle>Itens da Auditoria</CardTitle>
                <CardDescription>
                  Detalhamento dos {auditoria.resultado.length} itens verificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditoria.resultado.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{item.item}</span>
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        </div>
                        <Badge
                          variant={
                            item.cumprimento === "OK" ? "default" :
                              item.cumprimento === "Não Conforme" ? "destructive" :
                                item.cumprimento === "Pendente" ? "secondary" : "outline"
                          }
                        >
                          {item.cumprimento}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Monitoramento Tab */}
        <TabsContent value="monitoramento" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monitoramento em Tempo Real
                </CardTitle>
                <CardDescription>
                  Acompanhe eventos DP em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Embarcação</Label>
                  <Input
                    value={vesselName}
                    onChange={handleChange}
                    disabled={isMonitoring}
                  />
                </div>
                {!isMonitoring ? (
                  <Button onClick={handleStartMonitoring} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Monitoramento
                  </Button>
                ) : (
                  <Button onClick={handleStopMonitoring} variant="destructive" className="w-full">
                    <Square className="h-4 w-4 mr-2" />
                    Parar Monitoramento
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionReport ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de Eventos</span>
                      <span className="font-medium">{sessionReport.statistics.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eventos Críticos</span>
                      <span className="font-medium text-red-500">{sessionReport.statistics.criticalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Violação</span>
                      <span className="font-medium">{sessionReport.statistics.violationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração</span>
                      <span className="font-medium">{Math.round(sessionReport.statistics.duration / 60)} min</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Inicie uma sessão de monitoramento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-4">
          {summary ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sumário Executivo</span>
                  {getStatusBadge(summary.complianceStatus)}
                </CardTitle>
                <CardDescription>
                  {summary.vesselName} • {new Date(summary.generatedAt).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className={`text-3xl font-bold ${getScoreColor(summary.overallScore)}`}>
                      {summary.overallScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score Geral</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-3xl font-bold">{summary.totalEvents}</div>
                    <div className="text-sm text-muted-foreground">Eventos</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-3xl font-bold text-red-500">{summary.criticalIncidents}</div>
                    <div className="text-sm text-muted-foreground">Críticos</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    {getStatusBadge(summary.complianceStatus)}
                    <div className="text-sm text-muted-foreground mt-1">Status</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Principais Achados</h4>
                  <ul className="space-y-1">
                    {summary.keyFindings.map((finding, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {summary.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum relatório disponível</p>
                <p className="text-sm">Execute uma auditoria ou sessão de monitoramento primeiro</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
