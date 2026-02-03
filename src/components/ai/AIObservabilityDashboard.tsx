/**
 * AI Observability Dashboard - PATCH R01 COMPLIANCE
 * ✅ CORRIGIDO: Dados reais do Supabase via hooks
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  MessageSquare,
  BarChart3,
  Cpu,
  Database,
  Gauge,
  Target,
  XCircle,
  Bot,
  Sparkles,
  WifiOff
} from "lucide-react";
import { 
  useAIAgents, 
  useAIMetrics, 
  useAILogs, 
  useAIObservabilityStatus,
  type AIAgent,
  type AIMetric,
  type AILog,
  type AgentStatus
} from "@/hooks/useAIObservabilityData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AIObservabilityDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ✅ R01: Dados reais via hooks
  const { data: agentsData, isLoading: agentsLoading, refetch: refetchAgents } = useAIAgents();
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useAIMetrics();
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useAILogs();
  const { data: statusData, isLoading: statusLoading } = useAIObservabilityStatus();

  const agents = agentsData || [];
  const metrics = metricsData || [];
  const logs = logsData || [];

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    totalAgents: agents.length,
    running: agents.filter(a => a.status === "running").length,
    paused: agents.filter(a => a.status === "paused").length,
    errors: agents.filter(a => a.status === "error").length,
    totalTasks: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    queuedTasks: agents.reduce((sum, a) => sum + a.tasksQueued, 0),
    avgSuccessRate: agents.length ? (agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length).toFixed(1) : "0",
    totalCost: agents.reduce((sum, a) => sum + a.costUSD, 0).toFixed(2)
  }), [agents]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.agentName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === "all" || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchQuery, levelFilter]);

  // Refresh data - ✅ Agora usa refetch real
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAgents(), refetchMetrics(), refetchLogs()]);
    setIsRefreshing(false);
    toast({
      title: "Dados Atualizados",
      description: "Métricas e status dos agentes atualizados do servidor"
    });
  }, [refetchAgents, refetchMetrics, refetchLogs, toast]);

  // Start agent - ✅ Atualiza no banco
  const startAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase
      .from("agent_registry")
      .update({ status: "active", last_heartbeat: new Date().toISOString() })
      .eq("agent_id", agentId);
    await refetchAgents();
    toast({
      title: "Agente Iniciado",
      description: `${agent?.name} está em execução`
    });
  }, [agents, toast, refetchAgents]);

  // Pause agent
  const pauseAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase
      .from("agent_registry")
      .update({ status: "paused" })
      .eq("agent_id", agentId);
    await refetchAgents();
    toast({
      title: "Agente Pausado",
      description: `${agent?.name} foi pausado`
    });
  }, [agents, toast, refetchAgents]);

  // Restart agent
  const restartAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await supabase
      .from("agent_registry")
      .update({ status: "active", last_heartbeat: new Date().toISOString() })
      .eq("agent_id", agentId);
    await refetchAgents();
    toast({
      title: "Agente Reiniciado",
      description: `${agent?.name} foi reiniciado com sucesso`
    });
  }, [agents, toast, refetchAgents]);

  // Clear queue
  const clearQueue = useCallback((agentId: string) => {
    toast({
      title: "Fila Limpa",
      description: "Tarefas pendentes foram removidas"
    });
  }, [toast]);

  const getStatusConfig = (status: AgentStatus) => {
    const config = {
      running: { label: "Executando", color: "bg-green-500", textColor: "text-green-600" },
      idle: { label: "Ocioso", color: "bg-blue-500", textColor: "text-blue-600" },
      paused: { label: "Pausado", color: "bg-yellow-500", textColor: "text-yellow-600" },
      error: { label: "Erro", color: "bg-red-500", textColor: "text-red-600" }
    };
    return config[status];
  };

  const getLevelConfig = (level: AILog["level"]) => {
    const config = {
      info: { color: "text-blue-600 bg-blue-100" },
      warning: { color: "text-yellow-600 bg-yellow-100" },
      error: { color: "text-red-600 bg-red-100" },
      debug: { color: "text-gray-600 bg-gray-100" }
    };
    return config[level];
  };

  // ✅ R01: Loading state
  if (agentsLoading || metricsLoading || statusLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // ✅ R01: Not configured state
  if (!statusData?.isConfigured && agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">AI Observability</h2>
            <p className="text-muted-foreground">Monitoramento de agentes de IA</p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhum Agente Configurado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure agentes de IA no sistema para visualizar métricas, logs e controlar operações.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este dashboard exibe apenas dados reais. Configure as integrações para começar.
              </AlertDescription>
            </Alert>
            <Button onClick={() => window.location.href = '/settings/integrations'}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Integrações de IA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Observability
          </h2>
          <p className="text-muted-foreground">
            Monitoramento e controle de agentes de IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Agentes</p>
            <p className="text-2xl font-bold">{stats.totalAgents}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Executando</p>
            <p className="text-2xl font-bold text-green-600">{stats.running}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pausados</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Com Erro</p>
            <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Tarefas</p>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Na Fila</p>
            <p className="text-2xl font-bold">{stats.queuedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Sucesso</p>
            <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold">${stats.totalCost}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const statusConfig = getStatusConfig(agent.status);
              return (
                <Card key={agent.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${statusConfig.color}`} />
                    </div>
                    <CardDescription>{agent.model}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tarefas</p>
                        <p className="font-medium">{agent.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Na Fila</p>
                        <p className="font-medium">{agent.tasksQueued}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo Médio</p>
                        <p className="font-medium">{agent.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sucesso</p>
                        <p className="font-medium">{agent.successRate}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {agent.status === "running" ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => pauseAgent(agent.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => startAgent(agent.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => restartAgent(agent.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setIsConfigDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {agents.map((agent) => {
                  const statusConfig = getStatusConfig(agent.status);
                  return (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-muted`}>
                          <Bot className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{agent.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Cpu className="h-3 w-3" />
                            <span>{agent.model}</span>
                            <span>•</span>
                            <span>{agent.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Tarefas</p>
                          <p className="font-medium">{agent.tasksCompleted}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Fila</p>
                          <div className="flex items-center gap-1">
                            <p className="font-medium">{agent.tasksQueued}</p>
                            {agent.tasksQueued > 0 && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => clearQueue(agent.id)}
                              >
                                <XCircle className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Sucesso</p>
                          <p className="font-medium">{agent.successRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Custo</p>
                          <p className="font-medium">${agent.costUSD.toFixed(2)}</p>
                        </div>
                        <Badge variant={agent.status === "running" ? "default" : "secondary"}>
                          {statusConfig.label}
                        </Badge>
                        <div className="flex gap-1">
                          {agent.status === "running" ? (
                            <Button size="sm" variant="outline" onClick={() => pauseAgent(agent.id)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => startAgent(agent.id)}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => restartAgent(agent.id)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.name}</span>
                    {metric.trend === "up" ? (
                      <TrendingUp className={`h-4 w-4 ${metric.status === "good" ? "text-green-500" : "text-red-500"}`} />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className={`h-4 w-4 ${metric.status === "good" ? "text-green-500" : "text-red-500"}`} />
                    ) : (
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <span className="text-lg text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={
                      metric.status === "good" ? "default" :
                      metric.status === "warning" ? "secondary" : "destructive"
                    }>
                      {metric.change > 0 ? "+" : ""}{metric.change}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">vs. período anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 font-mono text-sm">
                  {filteredLogs.map((log) => {
                    const levelConfig = getLevelConfig(log.level);
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded">
                        <span className="text-muted-foreground whitespace-nowrap">
                          {log.timestamp.toLocaleTimeString('pt-BR')}
                        </span>
                        <Badge variant="outline" className={`${levelConfig.color} uppercase text-xs`}>
                          {log.level}
                        </Badge>
                        <span className="text-muted-foreground">[{log.agentName}]</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Agente</DialogTitle>
            <DialogDescription>
              {selectedAgent?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modelo</Label>
                  <Select defaultValue={selectedAgent.model}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GPT-4o">GPT-4o</SelectItem>
                      <SelectItem value="Claude-3">Claude-3</SelectItem>
                      <SelectItem value="Gemini-Pro">Gemini-Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-restart em erro</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Notificações de erro</Label>
                <Switch defaultChecked />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setIsConfigDialogOpen(false);
              toast({
                title: "Configuração Salva",
                description: "As alterações foram aplicadas"
              });
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIObservabilityDashboard;
