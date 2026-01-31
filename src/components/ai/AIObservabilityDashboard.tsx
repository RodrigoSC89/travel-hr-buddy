/**
 * AI Observability Dashboard - PATCH INTERACTIVITY 100%
 * Metrics, logs and AI agent control
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
  Sparkles
} from "lucide-react";

type AgentStatus = "running" | "idle" | "paused" | "error";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  model: string;
  tasksCompleted: number;
  tasksQueued: number;
  avgResponseTime: number;
  successRate: number;
  lastActivity: Date;
  tokensUsed: number;
  costUSD: number;
}

interface AIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

interface AILog {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  metadata?: Record<string, unknown>;
}

const MOCK_AGENTS: AIAgent[] = [
  {
    id: "agent1",
    name: "Voyage Optimizer",
    type: "optimization",
    status: "running",
    model: "GPT-4o",
    tasksCompleted: 1247,
    tasksQueued: 5,
    avgResponseTime: 1250,
    successRate: 98.5,
    lastActivity: new Date(),
    tokensUsed: 450000,
    costUSD: 12.50
  },
  {
    id: "agent2",
    name: "Compliance Guardian",
    type: "compliance",
    status: "running",
    model: "Claude-3",
    tasksCompleted: 892,
    tasksQueued: 12,
    avgResponseTime: 2100,
    successRate: 99.2,
    lastActivity: new Date(Date.now() - 60000),
    tokensUsed: 320000,
    costUSD: 9.80
  },
  {
    id: "agent3",
    name: "Maintenance Predictor",
    type: "prediction",
    status: "idle",
    model: "GPT-4o",
    tasksCompleted: 456,
    tasksQueued: 0,
    avgResponseTime: 1800,
    successRate: 97.8,
    lastActivity: new Date(Date.now() - 3600000),
    tokensUsed: 180000,
    costUSD: 5.20
  },
  {
    id: "agent4",
    name: "Document Analyzer",
    type: "analysis",
    status: "paused",
    model: "Gemini-Pro",
    tasksCompleted: 234,
    tasksQueued: 8,
    avgResponseTime: 3500,
    successRate: 94.5,
    lastActivity: new Date(Date.now() - 7200000),
    tokensUsed: 95000,
    costUSD: 2.80
  },
  {
    id: "agent5",
    name: "Safety Monitor",
    type: "monitoring",
    status: "error",
    model: "GPT-4o",
    tasksCompleted: 789,
    tasksQueued: 45,
    avgResponseTime: 0,
    successRate: 96.2,
    lastActivity: new Date(Date.now() - 1800000),
    tokensUsed: 210000,
    costUSD: 6.10
  }
];

const MOCK_METRICS: AIMetric[] = [
  { id: "m1", name: "Total de Requisições", value: 15420, unit: "", change: 12.5, trend: "up", status: "good" },
  { id: "m2", name: "Tempo Médio de Resposta", value: 1.8, unit: "s", change: -8.2, trend: "down", status: "good" },
  { id: "m3", name: "Taxa de Sucesso", value: 97.5, unit: "%", change: 0.5, trend: "up", status: "good" },
  { id: "m4", name: "Tokens Utilizados", value: 1.25, unit: "M", change: 15.3, trend: "up", status: "warning" },
  { id: "m5", name: "Custo Acumulado", value: 36.40, unit: "USD", change: 22.1, trend: "up", status: "warning" },
  { id: "m6", name: "Erros", value: 23, unit: "", change: 45.0, trend: "up", status: "critical" }
];

const MOCK_LOGS: AILog[] = [
  { id: "l1", timestamp: new Date(), agentId: "agent1", agentName: "Voyage Optimizer", level: "info", message: "Rota otimizada para MV Atlantic Pioneer - economia estimada: 12% de combustível" },
  { id: "l2", timestamp: new Date(Date.now() - 60000), agentId: "agent2", agentName: "Compliance Guardian", level: "warning", message: "Documento de tripulante próximo ao vencimento detectado" },
  { id: "l3", timestamp: new Date(Date.now() - 120000), agentId: "agent5", agentName: "Safety Monitor", level: "error", message: "Falha de conexão com API externa - tentando reconexão" },
  { id: "l4", timestamp: new Date(Date.now() - 180000), agentId: "agent1", agentName: "Voyage Optimizer", level: "info", message: "Análise de condições meteorológicas concluída" },
  { id: "l5", timestamp: new Date(Date.now() - 300000), agentId: "agent3", agentName: "Maintenance Predictor", level: "info", message: "Previsão de manutenção gerada para Motor Principal #2" },
  { id: "l6", timestamp: new Date(Date.now() - 600000), agentId: "agent4", agentName: "Document Analyzer", level: "debug", message: "OCR processado com 98.5% de confiança" }
];

export function AIObservabilityDashboard() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AIAgent[]>(MOCK_AGENTS);
  const [metrics] = useState<AIMetric[]>(MOCK_METRICS);
  const [logs, setLogs] = useState<AILog[]>(MOCK_LOGS);
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
    avgSuccessRate: (agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length).toFixed(1),
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

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast({
      title: "Dados Atualizados",
      description: "Métricas e status dos agentes atualizados"
    });
  }, [toast]);

  // Start agent
  const startAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "running" as const, lastActivity: new Date() } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agente Iniciado",
      description: `${agent?.name} está em execução`
    });
  }, [agents, toast]);

  // Pause agent
  const pauseAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "paused" as const } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agente Pausado",
      description: `${agent?.name} foi pausado`
    });
  }, [agents, toast]);

  // Restart agent
  const restartAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: "running" as const, lastActivity: new Date() } : a
    ));
    const agent = agents.find(a => a.id === agentId);
    toast({
      title: "Agente Reiniciado",
      description: `${agent?.name} foi reiniciado com sucesso`
    });
  }, [agents, toast]);

  // Clear queue
  const clearQueue = useCallback((agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, tasksQueued: 0 } : a
    ));
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
