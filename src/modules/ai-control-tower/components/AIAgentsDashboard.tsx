/**
 * AI Agents Dashboard - Connected to real Supabase data
 * Monitoramento e controle de agentes de IA em tempo real
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot, Brain, Activity, Zap, Shield, AlertTriangle, CheckCircle2,
  Clock, Play, Pause, RefreshCw, Settings, BarChart3, TrendingUp,
  MessageSquare, ThumbsUp, ThumbsDown, Eye, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { toast } from "sonner";

export default function AIAgentsDashboard() {
  const { agents, decisions, metrics, isLoading, approveDecision, rejectDecision } = useAIControlTowerData();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const selectedAgent = useMemo(() =>
    agents.find((a: any) => a.id === selectedAgentId) || null,
    [agents, selectedAgentId]
  );

  const activeAgents = agents.filter((a: any) => a.status === "active" || a.status === "online").length;
  const pendingDecisions = decisions.filter((d: any) => d.status === "pending");
  const filteredDecisions = showPendingOnly ? pendingDecisions : decisions;

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: "Ativo", color: "bg-green-500", icon: Play },
    online: { label: "Online", color: "bg-green-500", icon: Play },
    idle: { label: "Ocioso", color: "bg-blue-500", icon: Clock },
    paused: { label: "Pausado", color: "bg-yellow-500", icon: Pause },
    error: { label: "Erro", color: "bg-red-500", icon: AlertTriangle },
    disabled: { label: "Desativado", color: "bg-gray-400", icon: Pause },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Bot className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
                <p className="text-xs text-muted-foreground">Agentes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{decisions.length}</p>
                <p className="text-xs text-muted-foreground">Decisões Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgConfidence}%</p>
                <p className="text-xs text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingDecisions.length}</p>
                <p className="text-xs text-muted-foreground">Decisões Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agents List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentes de IA ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum agente registrado</p>
                  </div>
                ) : (
                  agents.map((agent: any) => {
                    const config = statusConfig[agent.status] || statusConfig.idle;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                          selectedAgentId === agent.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-2 rounded-lg",
                              agent.status === "active" || agent.status === "online" ? "bg-green-500/10" :
                              agent.status === "error" ? "bg-red-500/10" : "bg-muted"
                            )}>
                              <Bot className={cn(
                                "h-4 w-4",
                                agent.status === "active" || agent.status === "online" ? "text-green-500" :
                                agent.status === "error" ? "text-red-500" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.agent_id}</p>
                            </div>
                          </div>
                          <Badge className={cn("text-white text-xs", config.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(agent.capabilities) ? agent.capabilities : []).slice(0, 2).map((cap: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{String(cap)}</Badge>
                          ))}
                          {(Array.isArray(agent.capabilities) ? agent.capabilities : []).length > 2 && (
                            <Badge variant="outline" className="text-xs">+{(agent.capabilities as any[]).length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent Details & Decisions */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="details">
            <CardHeader className="pb-3">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="decisions">
                  Decisões
                  {pendingDecisions.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] p-0 justify-center">
                      {pendingDecisions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="details">
                {selectedAgent ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{selectedAgent.name}</h3>
                        <p className="text-muted-foreground">{selectedAgent.agent_id}</p>
                      </div>
                      <Badge className={cn("text-white", (statusConfig[selectedAgent.status] || statusConfig.idle).color)}>
                        {(statusConfig[selectedAgent.status] || statusConfig.idle).label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border text-center">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-lg font-bold">{selectedAgent.status}</p>
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                        <p className="text-lg font-bold">{(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length}</p>
                        <p className="text-xs text-muted-foreground">Capacidades</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-lg font-bold">
                          {selectedAgent.last_heartbeat
                            ? `${Math.round((Date.now() - new Date(selectedAgent.last_heartbeat).getTime()) / 60000)}min`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">Último Heartbeat</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Capacidades</p>
                      <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).map((cap: any, i: number) => (
                          <Badge key={i} variant="outline">{String(cap)}</Badge>
                        ))}
                        {(Array.isArray(selectedAgent.capabilities) ? selectedAgent.capabilities : []).length === 0 && (
                          <p className="text-sm text-muted-foreground">Nenhuma capacidade definida</p>
                        )}
                      </div>
                    </div>
                    {selectedAgent.metadata && (
                      <div>
                        <p className="text-sm font-medium mb-2">Metadata</p>
                        <pre className="p-3 rounded-lg bg-muted/50 text-xs overflow-auto max-h-32">
                          {JSON.stringify(selectedAgent.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4" />
                    <p>Selecione um agente para ver detalhes</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="decisions">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredDecisions.length} decisões
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Só pendentes</span>
                    <Switch checked={showPendingOnly} onCheckedChange={setShowPendingOnly} />
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {filteredDecisions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhuma decisão {showPendingOnly ? "pendente" : "registrada"}</p>
                      </div>
                    ) : (
                      filteredDecisions.map((d: any) => (
                        <div key={d.id} className="p-4 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{d.title || "Decisão"}</p>
                              <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{d.confidence || 0}% confiança</span>
                                <span>{new Date(d.created_at).toLocaleString("pt-BR")}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={d.status === "approved" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>
                                {d.status}
                              </Badge>
                              {d.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="default" onClick={() => approveDecision.mutate({ id: d.id })}>
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => rejectDecision.mutate({ id: d.id, reason: "Rejeitado" })}>
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
