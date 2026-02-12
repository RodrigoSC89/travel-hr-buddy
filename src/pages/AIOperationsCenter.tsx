/**
 * AI Operations Center - Autonomous AI Dashboard
 * Complete AI Ops management with real-time execution, logs, and explainability
 */

import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Activity,
  Target,
  Settings,
  ArrowLeft,
  Bot,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  FileCheck,
  AlertOctagon
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAutonomousExecutor } from "@/hooks/useAutonomousExecutor";
import { useAutonomousAI } from "@/hooks/useAutonomousAI";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons: Record<string, React.ReactNode> = {
  "alert-dispatch": <AlertTriangle className="h-4 w-4 text-warning" />,
  "crew-reallocation": <Users className="h-4 w-4 text-primary" />,
  "maintenance-schedule": <Wrench className="h-4 w-4 text-info" />,
  "compliance-action": <Shield className="h-4 w-4 text-success" />,
  "incident-response": <AlertOctagon className="h-4 w-4 text-destructive" />,
  "resource-optimization": <TrendingUp className="h-4 w-4 text-accent" />,
  "safety-override": <Shield className="h-4 w-4 text-destructive" />,
  "document-renewal": <FileCheck className="h-4 w-4 text-primary" />
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-info text-info-foreground",
  low: "bg-muted text-muted-foreground"
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning border-warning/40",
  executing: "bg-info/20 text-info border-info/40",
  success: "bg-success/20 text-success border-success/40",
  failed: "bg-destructive/20 text-destructive border-destructive/40",
  "rolled-back": "bg-muted text-muted-foreground border-muted"
};

export default function AIOperationsCenter() {
  const navigate = useNavigate();
  const executor = useAutonomousExecutor();
  const ai = useAutonomousAI();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Auto-start monitoring in demo
  useEffect(() => {
    if (!executor.isMonitoring) {
      // Don't auto-start, let user control it
    }
  }, [executor.isMonitoring]);

  const handleToggleMonitoring = () => {
    if (executor.isMonitoring) {
      executor.stopMonitoring();
      toast.info("Monitoramento autônomo pausado");
    } else {
      executor.startMonitoring(30000);
      toast.success("Monitoramento autônomo iniciado");
    }
  };

  const handleExecutePending = async (logId: string) => {
    const success = await executor.executePending(logId);
    if (success) {
      toast.success("Ação executada com sucesso");
    } else {
      toast.error("Falha ao executar ação");
    }
  };

  const handleRollback = async (logId: string) => {
    const success = await executor.rollback(logId);
    if (success) {
      toast.success("Rollback executado com sucesso");
    } else {
      toast.error("Falha no rollback");
    }
  };

  return (
    <>
      <Helmet>
        <title>Central de IA Autônoma | Nautilus One</title>
        <meta name="description" content="Centro de operações de IA autônoma com execução automática de decisões" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Brain className="h-8 w-8 text-primary" />
                  Central de IA Autônoma
                </h1>
                <p className="text-muted-foreground mt-1">
                  AI Ops • Execução Automática • Logs com Explicabilidade
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={executor.isMonitoring ? "default" : "outline"}
                className={executor.isMonitoring ? "bg-success text-success-foreground animate-pulse" : ""}
              >
                {executor.isMonitoring ? "Monitorando" : "Pausado"}
              </Badge>
              <Button 
                onClick={handleToggleMonitoring}
                variant={executor.isMonitoring ? "destructive" : "default"}
              >
                {executor.isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={executor.refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Execuções Totais</p>
                    <p className="text-3xl font-bold text-primary">{executor.statistics.totalExecutions}</p>
                  </div>
                  <Bot className="h-10 w-10 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-3xl font-bold text-success">{executor.statistics.successRate.toFixed(1)}%</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-success/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-3xl font-bold text-warning">{executor.statistics.pendingCount}</p>
                  </div>
                  <Clock className="h-10 w-10 text-warning/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                    <p className="text-3xl font-bold text-destructive">{executor.statistics.failedCount}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-destructive/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Regras Ativas</p>
                    <p className="text-3xl font-bold text-info">{executor.statistics.rulesActive}</p>
                  </div>
                  <Zap className="h-10 w-10 text-info/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Metrics */}
          {ai.learningMetrics && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Métricas de Aprendizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Precisão</p>
                    <Progress value={ai.learningMetrics.accuracy * 100} className="h-2 mt-1" />
                    <p className="text-sm font-medium mt-1">{(ai.learningMetrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confiança Média</p>
                    <Progress value={ai.learningMetrics.averageConfidence * 100} className="h-2 mt-1" />
                    <p className="text-sm font-medium mt-1">{(ai.learningMetrics.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa de Melhoria</p>
                    <Progress value={ai.learningMetrics.improvementRate * 100} className="h-2 mt-1" />
                    <p className="text-sm font-medium mt-1">{(ai.learningMetrics.improvementRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Decisões Corretas</p>
                    <p className="text-2xl font-bold text-success mt-1">{ai.learningMetrics.correctDecisions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ciclos de Aprendizado</p>
                    <p className="text-2xl font-bold text-primary mt-1">{ai.learningMetrics.learningCycles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">
                <Activity className="h-4 w-4 mr-2" />
                Execuções
              </TabsTrigger>
              <TabsTrigger value="rules">
                <Settings className="h-4 w-4 mr-2" />
                Regras ({executor.rules.length})
              </TabsTrigger>
              <TabsTrigger value="decisions">
                <Brain className="h-4 w-4 mr-2" />
                Decisões IA ({ai.decisions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {executor.logs.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-12 text-center">
                          <Bot className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                          <h3 className="text-lg font-medium mb-2">Nenhuma execução ainda</h3>
                          <p className="text-muted-foreground mb-4">
                            Inicie o monitoramento autônomo para ver as execuções aqui.
                          </p>
                          <Button onClick={() => executor.startMonitoring()}>
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Monitoramento
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      executor.logs.map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-lg ${
                              expandedLog === log.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {typeIcons[log.action.type] || <Zap className="h-4 w-4" />}
                                  <div>
                                    <p className="font-medium">{log.action.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(log.timestamp), "dd/MM HH:mm:ss", { locale: ptBR })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={statusColors[log.status]}>
                                    {log.status === "success" ? "Sucesso" :
                                     log.status === "failed" ? "Falha" :
                                     log.status === "pending" ? "Pendente" :
                                     log.status === "executing" ? "Executando" : "Revertido"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {log.duration}ms
                                  </span>
                                </div>
                              </div>

                              {expandedLog === log.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-primary" />
                                        Explicação da IA
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {log.explanation.reasoning}
                                      </p>
                                      <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-1">Confiança</p>
                                        <Progress value={log.explanation.confidence * 100} className="h-2" />
                                        <p className="text-xs mt-1">{(log.explanation.confidence * 100).toFixed(0)}%</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Dados Utilizados</h4>
                                      {log.explanation.dataPoints.map((dp) => (
                                        <div key={dp.metric} className="flex justify-between text-sm mb-1">
                                          <span className="text-muted-foreground">{dp.metric}</span>
                                          <span className="font-medium">{String(dp.value)}</span>
                                        </div>
                                      ))}
                                      <div className="mt-3">
                                        <Badge className={priorityColors[log.explanation.riskLevel]}>
                                          Risco: {log.explanation.riskLevel}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t flex gap-2">
                                    {log.status === "pending" && (
                                      <Button 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExecutePending(log.id);
                                        }}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Executar
                                      </Button>
                                    )}
                                    {log.status === "success" && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRollback(log.id);
                                        }}
                                      >
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Rollback
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              <div className="grid gap-4">
                {executor.rules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {typeIcons[rule.type] || <Zap className="h-5 w-5" />}
                          <div>
                            <h3 className="font-medium">{rule.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {rule.condition.metric} {rule.condition.operator} {String(rule.condition.value)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={priorityColors[rule.priority]}>
                            {rule.priority}
                          </Badge>
                          {rule.autoExecute && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/40">
                              Auto
                            </Badge>
                          )}
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => executor.toggleRule(rule.id)}
                          />
                        </div>
                      </div>
                      {rule.lastExecuted && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Última execução: {format(new Date(rule.lastExecuted), "dd/MM HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="decisions" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {ai.decisions.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-12 text-center">
                        <Brain className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma decisão registrada</h3>
                        <p className="text-muted-foreground">
                          Decisões da IA aparecerão aqui conforme o sistema opera.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    ai.decisions.map((decision) => (
                      <Card key={decision.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${
                                decision.confidenceLevel === "critical" ? "bg-destructive" :
                                decision.confidenceLevel === "high" ? "bg-warning" :
                                decision.confidenceLevel === "medium" ? "bg-info" : "bg-muted"
                              } text-white`}>
                                {decision.type}
                              </Badge>
                              <span className="font-medium">{decision.title}</span>
                            </div>
                            <Badge className={statusColors[decision.status] || "bg-muted"}>
                              {decision.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{decision.description}</p>
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <Target className="h-3 w-3" />
                              <span>{(decision.confidence * 100).toFixed(0)}% confiança</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(decision.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                          {decision.status === "pending" && (
                            <div className="mt-3 pt-3 border-t flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => ai.approveDecision(decision.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => ai.rejectDecision(decision.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
