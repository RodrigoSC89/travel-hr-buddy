/**
 * AI Command Dashboard - Connected to real Supabase data
 * Central de comando para todos os agentes de IA
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Bot, Zap, Activity, Shield, Target, TrendingUp, Clock,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Settings, Play,
  Pause, BarChart3, MessageSquare, Send, ThumbsUp, ThumbsDown,
  Eye, History, Gauge, Workflow,
} from "lucide-react";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { toast } from "sonner";

export function AICommandDashboard() {
  const { agents, decisions, auditLogs, metrics, isLoading, approveDecision, rejectDecision } = useAIControlTowerData();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [agentSettings, setAgentSettings] = useState({
    autoApprove: false,
    confidenceThreshold: 85,
    maxActionsPerHour: 50,
  });

  const selectedAgent = useMemo(() => 
    agents.find((a) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  );

  const pendingDecisions = useMemo(() => 
    decisions.filter((d) => d.status === "pending"),
    [decisions]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": case "online": return "bg-success";
      case "idle": return "bg-warning";
      case "error": return "bg-destructive";
      case "learning": return "bg-primary";
      default: return "bg-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": case "online": return "Ativo";
      case "idle": return "Ocioso";
      case "error": return "Erro";
      case "learning": return "Aprendendo";
      default: return status;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high": case "critical": return <Badge className="bg-destructive/20 text-destructive">Alto Impacto</Badge>;
      case "medium": return <Badge className="bg-warning/20 text-warning">Médio Impacto</Badge>;
      default: return <Badge className="bg-success/20 text-success">Baixo Impacto</Badge>;
    }
  };

  const handleApproveDecision = (id: string) => {
    approveDecision.mutate({ id });
  };

  const handleRejectDecision = (id: string) => {
    rejectDecision.mutate({ id, reason: "Rejeitado pelo operador" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={`cmd-skeleton-${i}`} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas globais */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-400" />
              <span className="text-sm text-muted-foreground">Agentes Ativos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.activeAgents}/{metrics.totalAgents}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Taxa Aprovação</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {decisions.length > 0 ? Math.round((metrics.approvedDecisions / decisions.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Confiança Média</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.avgConfidence}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Interações</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.totalInteractions}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-pink-400" />
              <span className="text-sm text-muted-foreground">Tempo Resposta</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.avgResponseTime}ms</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Pendentes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.pendingDecisions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agentes</span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="gap-2">
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">Decisões</span>
            {pendingDecisions.length > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingDecisions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Agentes */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <motion.div key={agent.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedAgentId === agent.id ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{agent.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{agent.agent_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <span className="text-xs">{getStatusLabel(agent.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(agent.capabilities) ? agent.capabilities : []).slice(0, 3).map((cap: unknown) => (
                        <Badge key={String(cap)} variant="secondary" className="text-xs">{String(cap)}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Último heartbeat: {agent.last_heartbeat 
                        ? new Date(agent.last_heartbeat).toLocaleTimeString("pt-BR") 
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {agents.length === 0 && (
            <Card className="p-12 text-center">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum agente registrado</h3>
              <p className="text-muted-foreground">Registre agentes na tabela agent_registry</p>
            </Card>
          )}

          {/* Agent detail panel */}
          <AnimatePresence>
            {selectedAgent && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{selectedAgent.name}</CardTitle>
                          <CardDescription>{selectedAgent.agent_id}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(selectedAgent.status)} text-white`}>
                        {getStatusLabel(selectedAgent.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-xs text-muted-foreground">{selectedAgent.status}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Zap className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <p className="text-sm font-medium">Capacidades</p>
                        <p className="text-xs text-muted-foreground">{(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm font-medium">Heartbeat</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedAgent.last_heartbeat
                            ? new Date(selectedAgent.last_heartbeat).toLocaleString("pt-BR")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <p className="text-sm font-medium">Criado em</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedAgent.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Capacidades</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).map((cap: unknown) => (
                            <Badge key={String(cap)} variant="outline">{String(cap)}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Decisões */}
        <TabsContent value="decisions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Decisões de IA ({decisions.length})</h3>
            <Badge variant={pendingDecisions.length > 0 ? "destructive" : "secondary"}>
              {pendingDecisions.length} pendentes
            </Badge>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {decisions.length === 0 ? (
                <Card className="p-12 text-center">
                  <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Nenhuma decisão registrada</h3>
                  <p className="text-muted-foreground">Decisões de IA aparecerão aqui quando geradas</p>
                </Card>
              ) : (
                decisions.map((decision) => (
                  <Card key={decision.id} className={decision.status === "pending" ? "border-amber-500/50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{decision.title || "Decisão IA"}</span>
                            {getImpactBadge(decision.impact || "low")}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{decision.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {decision.confidence || 0}% confiança
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(decision.created_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {decision.justification_reasoning && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              "{decision.justification_reasoning}"
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge variant={
                            decision.status === "approved" ? "default" :
                            decision.status === "rejected" ? "destructive" :
                            "secondary"
                          }>
                            {decision.status === "approved" ? "Aprovada" :
                             decision.status === "rejected" ? "Rejeitada" :
                             decision.status === "pending" ? "Pendente" : decision.status}
                          </Badge>
                          {decision.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => handleApproveDecision(decision.id)}>
                                <ThumbsUp className="h-3 w-3 mr-1" /> Aprovar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectDecision(decision.id)}>
                                <ThumbsDown className="h-3 w-3 mr-1" /> Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{auditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Interações</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{metrics.avgResponseTime}ms</p>
                <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">
                  {auditLogs.reduce((sum: number, l) => sum + (l.tokens_input || 0) + (l.tokens_output || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Tokens Utilizados</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Últimas Interações</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>Nenhuma interação registrada ainda</p>
                    </div>
                  ) : (
                    auditLogs.slice(0, 20).map((log) => (
                      <div key={log.id} className="p-3 rounded-lg border">
                        <p className="text-sm font-medium truncate">{log.user_input}</p>
                        {log.ai_response && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{log.ai_response.slice(0, 120)}...</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{log.model_version || "N/A"}</span>
                          <span>{log.response_time_ms || 0}ms</span>
                          <span>{new Date(log.created_at || "").toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do AI Command</CardTitle>
              <CardDescription>Controle o comportamento dos agentes de IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-aprovar decisões de baixo impacto</p>
                  <p className="text-sm text-muted-foreground">Decisões com confiança acima do limite serão aprovadas automaticamente</p>
                </div>
                <Switch
                  checked={agentSettings.autoApprove}
                  onCheckedChange={(v) => setAgentSettings(s => ({ ...s, autoApprove: v }))}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Limite de Confiança</p>
                  <span className="text-sm text-muted-foreground">{agentSettings.confidenceThreshold}%</span>
                </div>
                <Slider
                  value={[agentSettings.confidenceThreshold]}
                  onValueChange={([v]) => setAgentSettings(s => ({ ...s, confidenceThreshold: v }))}
                  min={50} max={99} step={1}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Máx. ações por hora</p>
                  <span className="text-sm text-muted-foreground">{agentSettings.maxActionsPerHour}</span>
                </div>
                <Slider
                  value={[agentSettings.maxActionsPerHour]}
                  onValueChange={([v]) => setAgentSettings(s => ({ ...s, maxActionsPerHour: v }))}
                  min={10} max={200} step={10}
                />
              </div>
              <Button onClick={async () => {
                try {
                  const { supabase } = await import("@/integrations/supabase/client");
                  const { error } = await supabase.from("ai_configurations").upsert({
                    config_key: "agent_settings",
                    config_value: agentSettings as unknown as import("@/integrations/supabase/types").Json,
                    description: "AI Agent global settings"
                  }, { onConflict: "config_key" });
                  if (error) throw error;
                  toast.success("Configurações salvas no banco de dados");
                } catch {
                  toast.error("Erro ao salvar configurações");
                }
              }}>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AICommandDashboard;
