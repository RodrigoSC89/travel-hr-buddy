/**
 * AI Observability Dashboard
 * Painel de métricas para IA (uso, logs, decisões autônomas)
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Eye,
  RefreshCw,
  BarChart3,
  Zap,
  MessageSquare
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Helmet } from "react-helmet-async";

interface AIDecision {
  id: string;
  title: string;
  description: string;
  status: string;
  confidence: number;
  confidence_level: string;
  type: string;
  impact: string;
  created_at: string;
  executed_at: string | null;
  feedback_was_correct: boolean | null;
}

interface AIAuditLog {
  id: string;
  user_input: string;
  ai_response: string | null;
  model_version: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  response_time_ms: number | null;
  created_at: string;
  module_name: string | null;
  confidence_score: number | null;
}

interface AIMetrics {
  totalDecisions: number;
  approvedDecisions: number;
  pendingDecisions: number;
  rejectedDecisions: number;
  averageConfidence: number;
  accuracyRate: number;
  totalTokensUsed: number;
  averageResponseTime: number;
}

export default function AIObservabilityDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch AI Decisions
  const { data: decisions, isLoading: loadingDecisions } = useQuery({
    queryKey: ["ai-decisions", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AIDecision[];
    },
  });

  // Fetch AI Audit Logs
  const { data: auditLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["ai-audit-logs", refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as AIAuditLog[];
    },
  });

  // Calculate Metrics
  const metrics: AIMetrics = {
    totalDecisions: decisions?.length || 0,
    approvedDecisions: decisions?.filter(d => d.status === "approved" || d.status === "executed").length || 0,
    pendingDecisions: decisions?.filter(d => d.status === "pending").length || 0,
    rejectedDecisions: decisions?.filter(d => d.status === "rejected").length || 0,
    averageConfidence: decisions?.length 
      ? (decisions.reduce((acc, d) => acc + (d.confidence || 0), 0) / decisions.length) * 100 
      : 0,
    accuracyRate: decisions?.filter(d => d.feedback_was_correct !== null).length
      ? (decisions.filter(d => d.feedback_was_correct === true).length / 
         decisions.filter(d => d.feedback_was_correct !== null).length) * 100
      : 0,
    totalTokensUsed: auditLogs?.reduce((acc, log) => 
      acc + (log.tokens_input || 0) + (log.tokens_output || 0), 0) || 0,
    averageResponseTime: auditLogs?.length
      ? auditLogs.reduce((acc, log) => acc + (log.response_time_ms || 0), 0) / auditLogs.length
      : 0,
  };

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "executed":
        return <Badge className="bg-success/20 text-success border-success/30">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-warning/30">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-destructive/20 text-destructive">Alto</Badge>;
      case "medium":
        return <Badge className="bg-warning/20 text-warning">Médio</Badge>;
      case "low":
        return <Badge className="bg-success/20 text-success">Baixo</Badge>;
      default:
        return <Badge variant="outline">{impact}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Observabilidade IA | Nauti One</title>
        <meta name="description" content="Dashboard de observabilidade e métricas de IA do Nauti One" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Observabilidade IA
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitore decisões, uso e performance da IA em tempo real
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Decisões
                </CardTitle>
                <Brain className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metrics.totalDecisions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimas 50 decisões
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Aprovação
                </CardTitle>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.totalDecisions > 0 
                    ? Math.round((metrics.approvedDecisions / metrics.totalDecisions) * 100) 
                    : 0}%
                </div>
                <Progress 
                  value={metrics.totalDecisions > 0 
                    ? (metrics.approvedDecisions / metrics.totalDecisions) * 100 
                    : 0} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confiança Média
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(metrics.averageConfidence)}%
                </div>
                <Progress value={metrics.averageConfidence} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tokens Utilizados
                </CardTitle>
                <Zap className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {metrics.totalTokensUsed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tempo médio: {Math.round(metrics.averageResponseTime)}ms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="decisions" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="decisions" className="gap-2">
                <Brain className="w-4 h-4" />
                Decisões Autônomas
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <Activity className="w-4 h-4" />
                Logs de Auditoria
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Decisions Tab */}
            <TabsContent value="decisions">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Decisões da IA
                  </CardTitle>
                  <CardDescription>
                    Histórico de decisões autônomas tomadas pelo sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {loadingDecisions ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : decisions?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma decisão registrada
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {decisions?.map((decision) => (
                          <div 
                            key={decision.id} 
                            className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-foreground">{decision.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {decision.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(decision.status)}
                                {getImpactBadge(decision.impact)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(decision.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Confiança: {Math.round(decision.confidence * 100)}%
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {decision.type}
                              </Badge>
                              {decision.feedback_was_correct !== null && (
                                <span className="flex items-center gap-1">
                                  {decision.feedback_was_correct ? (
                                    <CheckCircle2 className="w-3 h-3 text-success" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-destructive" />
                                  )}
                                  Feedback
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Logs de Auditoria IA
                  </CardTitle>
                  <CardDescription>
                    Histórico de interações com a IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {loadingLogs ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : auditLogs?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum log registrado
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {auditLogs?.map((log) => (
                          <div 
                            key={log.id} 
                            className="p-3 rounded-lg border border-border bg-muted/10"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate">
                                  {log.user_input}
                                </p>
                                {log.ai_response && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {log.ai_response}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {log.module_name && (
                                  <Badge variant="outline" className="text-xs">
                                    {log.module_name}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(log.created_at), "HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {log.model_version && (
                                <span>Modelo: {log.model_version}</span>
                              )}
                              {log.tokens_input !== null && (
                                <span>Tokens: {(log.tokens_input || 0) + (log.tokens_output || 0)}</span>
                              )}
                              {log.response_time_ms !== null && (
                                <span>{log.response_time_ms}ms</span>
                              )}
                              {log.confidence_score !== null && (
                                <span>Confiança: {Math.round(log.confidence_score * 100)}%</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Distribuição de Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Aprovadas</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={metrics.totalDecisions > 0 
                              ? (metrics.approvedDecisions / metrics.totalDecisions) * 100 
                              : 0}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium text-foreground w-8">
                            {metrics.approvedDecisions}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pendentes</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={metrics.totalDecisions > 0 
                              ? (metrics.pendingDecisions / metrics.totalDecisions) * 100 
                              : 0}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium text-foreground w-8">
                            {metrics.pendingDecisions}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rejeitadas</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={metrics.totalDecisions > 0 
                              ? (metrics.rejectedDecisions / metrics.totalDecisions) * 100 
                              : 0}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium text-foreground w-8">
                            {metrics.rejectedDecisions}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <span className="text-sm text-muted-foreground">Taxa de Acurácia</span>
                        <span className="text-lg font-bold text-foreground">
                          {Math.round(metrics.accuracyRate)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <span className="text-sm text-muted-foreground">Tempo Médio de Resposta</span>
                        <span className="text-lg font-bold text-foreground">
                          {Math.round(metrics.averageResponseTime)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                        <span className="text-sm text-muted-foreground">Confiança Média</span>
                        <span className="text-lg font-bold text-foreground">
                          {Math.round(metrics.averageConfidence)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
