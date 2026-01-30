/**
 * PATCH 860: AI Self-Healing Logs Dashboard
 * Displays autonomous AI correction history and system health status
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Brain, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  Shield,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selfHealingEngine, type SelfHealingEvent } from "@/services/ai/self-healing-engine";

export default function SelfHealingLogs() {
  const [logs, setLogs] = useState<SelfHealingEvent[]>([]);
  const [summary, setSummary] = useState({
    totalEvents: 0,
    successfulCorrections: 0,
    failedCorrections: 0,
    criticalEvents: 0,
    lastCheck: null as Date | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [logsData, summaryData] = await Promise.all([
      selfHealingEngine.getRecentLogs(100),
      selfHealingEngine.getHealthSummary(),
    ]);
    setLogs(logsData);
    setSummary(summaryData);
    setIsLoading(false);
  };

  const toggleEngine = () => {
    if (engineRunning) {
      selfHealingEngine.stop();
      setEngineRunning(false);
    } else {
      selfHealingEngine.start();
      setEngineRunning(true);
    }
  };

  const runManualCheck = async () => {
    setIsLoading(true);
    await selfHealingEngine.runHealthCheck();
    await loadData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getResultIcon = (result?: string) => {
    switch (result) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-400" />;
      case "partial": return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const successRate = summary.totalEvents > 0 
    ? Math.round((summary.successfulCorrections / summary.totalEvents) * 100) 
    : 100;

  return (
    <>
      <Helmet>
        <title>AI Self-Healing Logs | Nautilus One</title>
        <meta name="description" content="Logs de auto-correção da IA Autônoma Nível 2" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                IA Autônoma - Nível 2
              </h1>
              <p className="text-muted-foreground mt-1">
                Auto-correção de falhas e logs de healing
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={engineRunning ? "destructive" : "default"}
                onClick={toggleEngine}
                className="gap-2"
              >
                {engineRunning ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    Parar Engine
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Iniciar Engine
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={runManualCheck} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Verificar Agora
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Eventos</p>
                    <p className="text-2xl font-bold">{summary.totalEvents}</p>
                  </div>
                  <Activity className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Correções Bem-sucedidas</p>
                    <p className="text-2xl font-bold text-green-400">{summary.successfulCorrections}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-400/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                    <p className="text-2xl font-bold text-red-400">{summary.failedCorrections}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold">{successRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary/60" />
                </div>
                <Progress value={successRate} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Engine Status */}
          <Card className={`border-2 ${engineRunning ? "border-green-500/50 bg-green-500/5" : "border-border/50 bg-card/50"}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${engineRunning ? "bg-green-500/20" : "bg-muted"}`}>
                  <Shield className={`h-6 w-6 ${engineRunning ? "text-green-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {engineRunning ? "Engine Ativo" : "Engine Desativado"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {engineRunning 
                      ? "Monitorando sistema e aplicando correções automáticas"
                      : "Clique em 'Iniciar Engine' para ativar o monitoramento autônomo"
                    }
                  </p>
                </div>
                {engineRunning && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Activity className="h-3 w-3 mr-1 animate-pulse" />
                    Monitorando
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="corrections">Correções</TabsTrigger>
              <TabsTrigger value="critical">Críticos</TabsTrigger>
              <TabsTrigger value="detections">Detecções</TabsTrigger>
            </TabsList>

            {["all", "corrections", "critical", "detections"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Logs de Eventos</CardTitle>
                    <CardDescription>
                      Histórico de detecções e correções automáticas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum evento registrado ainda</p>
                          <p className="text-sm">Inicie o engine para começar o monitoramento</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {logs
                            .filter(log => {
                              if (tab === "all") return true;
                              if (tab === "corrections") return log.eventType === "correction";
                              if (tab === "critical") return log.severity === "critical";
                              if (tab === "detections") return log.eventType === "detection";
                              return true;
                            })
                            .map((log, index) => (
                              <motion.div
                                key={log.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
                              >
                                <div className="flex-shrink-0">
                                  {getResultIcon(log.actionResult)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={getSeverityColor(log.severity)}>
                                      {log.severity}
                                    </Badge>
                                    <Badge variant="outline">
                                      {log.eventType}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {log.moduleAffected}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm">{log.issueDescription}</p>
                                  {log.actionTaken && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Ação: {log.actionTaken}
                                    </p>
                                  )}
                                  {log.executionTimeMs && (
                                    <p className="text-xs text-muted-foreground">
                                      Tempo: {log.executionTimeMs}ms | Confiança: {log.confidenceScore}%
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
}
