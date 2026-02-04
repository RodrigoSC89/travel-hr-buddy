/**
 * AI Agents Dashboard - Premium AI Control Tower Component
 * Monitoramento e controle de agentes de IA em tempo real
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Brain, 
  Activity, 
  Cpu, 
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  MessageSquare,
  FileText,
  Navigation,
  Wrench,
  Users,
  DollarSign,
  Eye,
  History,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAgent {
  id: string;
  name: string;
  type: "autonomous" | "supervised" | "advisory";
  module: string;
  status: "active" | "idle" | "paused" | "error";
  healthScore: number;
  accuracy: number;
  tasksCompleted: number;
  tasksToday: number;
  avgResponseTime: number;
  lastActivity: string;
  capabilities: string[];
  currentTask?: string;
  memoryUsage: number;
  cpuUsage: number;
  decisionsApproved: number;
  decisionsRejected: number;
  learningRate: number;
}

interface AIDecision {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  description: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "auto-executed";
  timestamp: string;
  impact: "low" | "medium" | "high" | "critical";
  reasoning: string;
  outcome?: string;
}

const mockAgents: AIAgent[] = [
  {
    id: "1",
    name: "DocProcessor AI",
    type: "autonomous",
    module: "Document Center",
    status: "active",
    healthScore: 98,
    accuracy: 96.5,
    tasksCompleted: 1247,
    tasksToday: 34,
    avgResponseTime: 1.2,
    lastActivity: "2024-01-20T10:45:00Z",
    capabilities: ["OCR", "Classification", "Data Extraction", "Compliance Check"],
    currentTask: "Processando certificado STCW #4521",
    memoryUsage: 45,
    cpuUsage: 23,
    decisionsApproved: 1180,
    decisionsRejected: 67,
    learningRate: 0.85
  },
  {
    id: "2",
    name: "Maintenance Predictor",
    type: "advisory",
    module: "Maintenance Hub",
    status: "active",
    healthScore: 94,
    accuracy: 91.2,
    tasksCompleted: 856,
    tasksToday: 12,
    avgResponseTime: 3.5,
    lastActivity: "2024-01-20T10:30:00Z",
    capabilities: ["Predictive Analysis", "Failure Detection", "Scheduling", "Parts Ordering"],
    currentTask: "Analisando sensor de temperatura do motor principal",
    memoryUsage: 62,
    cpuUsage: 45,
    decisionsApproved: 798,
    decisionsRejected: 58,
    learningRate: 0.78
  },
  {
    id: "3",
    name: "Crew Optimizer",
    type: "supervised",
    module: "People Hub",
    status: "idle",
    healthScore: 92,
    accuracy: 89.8,
    tasksCompleted: 423,
    tasksToday: 5,
    avgResponseTime: 2.1,
    lastActivity: "2024-01-20T09:15:00Z",
    capabilities: ["Schedule Optimization", "Skill Matching", "Fatigue Analysis", "Training Recommendations"],
    memoryUsage: 28,
    cpuUsage: 8,
    decisionsApproved: 389,
    decisionsRejected: 34,
    learningRate: 0.72
  },
  {
    id: "4",
    name: "Compliance Guardian",
    type: "autonomous",
    module: "Compliance Hub",
    status: "paused",
    healthScore: 88,
    accuracy: 94.3,
    tasksCompleted: 678,
    tasksToday: 0,
    avgResponseTime: 1.8,
    lastActivity: "2024-01-19T18:00:00Z",
    capabilities: ["Regulation Monitoring", "Gap Analysis", "Audit Prep", "Risk Assessment"],
    memoryUsage: 15,
    cpuUsage: 2,
    decisionsApproved: 645,
    decisionsRejected: 33,
    learningRate: 0.81
  },
  {
    id: "5",
    name: "Finance Analyst",
    type: "advisory",
    module: "Finance Hub",
    status: "error",
    healthScore: 65,
    accuracy: 87.5,
    tasksCompleted: 312,
    tasksToday: 0,
    avgResponseTime: 4.2,
    lastActivity: "2024-01-20T08:00:00Z",
    capabilities: ["Cost Prediction", "Budget Analysis", "Fraud Detection", "Reporting"],
    memoryUsage: 78,
    cpuUsage: 89,
    decisionsApproved: 287,
    decisionsRejected: 25,
    learningRate: 0.68
  }
];

const mockDecisions: AIDecision[] = [
  {
    id: "d1",
    agentId: "1",
    agentName: "DocProcessor AI",
    type: "Document Classification",
    description: "Certificado GMDSS classificado automaticamente",
    confidence: 98.5,
    status: "auto-executed",
    timestamp: "2024-01-20T10:45:00Z",
    impact: "low",
    reasoning: "Padrão de documento reconhecido com alta confiança baseado em 500+ exemplos similares"
  },
  {
    id: "d2",
    agentId: "2",
    agentName: "Maintenance Predictor",
    type: "Maintenance Alert",
    description: "Recomendação de inspeção preventiva no compressor de ar",
    confidence: 87.2,
    status: "pending",
    timestamp: "2024-01-20T10:30:00Z",
    impact: "high",
    reasoning: "Análise de vibração indica desgaste 23% acima do esperado para o ciclo atual"
  },
  {
    id: "d3",
    agentId: "3",
    agentName: "Crew Optimizer",
    type: "Schedule Change",
    description: "Sugestão de troca de turno para reduzir fadiga",
    confidence: 82.1,
    status: "approved",
    timestamp: "2024-01-20T09:15:00Z",
    impact: "medium",
    reasoning: "Padrão de horas trabalhadas excede limite MLC em 15% para 2 tripulantes",
    outcome: "Escala ajustada, compliance restaurado"
  },
  {
    id: "d4",
    agentId: "5",
    agentName: "Finance Analyst",
    type: "Anomaly Detection",
    description: "Transação suspeita detectada - requisição de combustível",
    confidence: 76.4,
    status: "rejected",
    timestamp: "2024-01-20T08:00:00Z",
    impact: "medium",
    reasoning: "Volume 40% acima da média histórica para a rota"
  }
];

const moduleIcons: Record<string, React.ElementType> = {
  "Document Center": FileText,
  "Maintenance Hub": Wrench,
  "People Hub": Users,
  "Compliance Hub": Shield,
  "Finance Hub": DollarSign,
  "Operations": Navigation
};

const statusConfig = {
  active: { label: "Ativo", color: "bg-green-500", icon: Play },
  idle: { label: "Ocioso", color: "bg-blue-500", icon: Clock },
  paused: { label: "Pausado", color: "bg-yellow-500", icon: Pause },
  error: { label: "Erro", color: "bg-red-500", icon: AlertTriangle }
};

const typeConfig = {
  autonomous: { label: "Autônomo", color: "text-green-500" },
  supervised: { label: "Supervisionado", color: "text-blue-500" },
  advisory: { label: "Consultivo", color: "text-purple-500" }
};

export default function AIAgentsDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(mockAgents[0]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const activeAgents = mockAgents.filter(a => a.status === "active").length;
  const totalTasks = mockAgents.reduce((acc, a) => acc + a.tasksToday, 0);
  const avgAccuracy = mockAgents.reduce((acc, a) => acc + a.accuracy, 0) / mockAgents.length;
  const pendingDecisions = mockDecisions.filter(d => d.status === "pending").length;

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredDecisions = showPendingOnly 
    ? mockDecisions.filter(d => d.status === "pending")
    : mockDecisions;

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
                <p className="text-2xl font-bold">{activeAgents}/{mockAgents.length}</p>
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
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Tarefas Hoje</p>
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
                <p className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Precisão Média</p>
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
                <p className="text-2xl font-bold">{pendingDecisions}</p>
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
              Agentes de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {mockAgents.map((agent) => {
                  const ModuleIcon = moduleIcons[agent.module] || Brain;
                  const StatusConfig = statusConfig[agent.status];
                  const StatusIcon = StatusConfig.icon;
                  
                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedAgent?.id === agent.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-lg",
                            agent.status === "active" ? "bg-green-500/10" :
                            agent.status === "error" ? "bg-red-500/10" : "bg-muted"
                          )}>
                            <ModuleIcon className={cn(
                              "h-4 w-4",
                              agent.status === "active" ? "text-green-500" :
                              agent.status === "error" ? "text-red-500" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.module}</p>
                          </div>
                        </div>
                        <Badge className={cn("text-white text-xs", StatusConfig.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {StatusConfig.label}
                        </Badge>
                      </div>

                      {agent.currentTask && (
                        <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground mb-2">
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          {agent.currentTask}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span>{agent.accuracy}% precisão</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          <span>{agent.tasksToday} hoje</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Saúde</span>
                          <span>{agent.healthScore}%</span>
                        </div>
                        <Progress 
                          value={agent.healthScore} 
                          className={cn(
                            "h-1.5",
                            agent.healthScore < 70 && "[&>div]:bg-red-500"
                          )} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent Details & Decisions */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="details">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="details">Detalhes do Agente</TabsTrigger>
                  <TabsTrigger value="decisions">
                    Decisões
                    {pendingDecisions > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] p-0 justify-center">
                        {pendingDecisions}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="details">
                {selectedAgent ? (
                  <div className="space-y-6">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{selectedAgent.name}</h3>
                        <p className="text-muted-foreground">{selectedAgent.module}</p>
                        <Badge variant="outline" className={cn("mt-2", typeConfig[selectedAgent.type].color)}>
                          {typeConfig[selectedAgent.type].label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {selectedAgent.status === "active" ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </Button>
                        ) : selectedAgent.status === "paused" ? (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Retomar
                          </Button>
                        ) : selectedAgent.status === "error" ? (
                          <Button variant="destructive" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reiniciar
                          </Button>
                        ) : null}
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border text-center">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{selectedAgent.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">Precisão</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}s</p>
                        <p className="text-xs text-muted-foreground">Tempo Médio</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{selectedAgent.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tarefas Total</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{(selectedAgent.learningRate * 100).toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Taxa Aprendizado</p>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Uso de Memória</span>
                          <span className={cn(
                            "text-sm font-bold",
                            selectedAgent.memoryUsage > 80 ? "text-red-500" :
                            selectedAgent.memoryUsage > 60 ? "text-yellow-500" : "text-green-500"
                          )}>{selectedAgent.memoryUsage}%</span>
                        </div>
                        <Progress value={selectedAgent.memoryUsage} className="h-2" />
                      </div>
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Uso de CPU</span>
                          <span className={cn(
                            "text-sm font-bold",
                            selectedAgent.cpuUsage > 80 ? "text-red-500" :
                            selectedAgent.cpuUsage > 60 ? "text-yellow-500" : "text-green-500"
                          )}>{selectedAgent.cpuUsage}%</span>
                        </div>
                        <Progress value={selectedAgent.cpuUsage} className="h-2" />
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Capacidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.capabilities.map((cap, i) => (
                          <Badge key={i} variant="secondary">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Decision Stats */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Decisões Aprovadas</span>
                        </div>
                        <p className="text-3xl font-bold text-green-500">{selectedAgent.decisionsApproved}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">Decisões Rejeitadas</span>
                        </div>
                        <p className="text-3xl font-bold text-red-500">{selectedAgent.decisionsRejected}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Selecione um agente para ver detalhes</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="decisions">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={showPendingOnly} 
                        onCheckedChange={setShowPendingOnly}
                        id="pending-only"
                      />
                      <label htmlFor="pending-only" className="text-sm">
                        Mostrar apenas pendentes
                      </label>
                    </div>
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      Ver Histórico Completo
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {filteredDecisions.map((decision) => (
                        <div 
                          key={decision.id}
                          className={cn(
                            "p-4 rounded-lg border",
                            decision.status === "pending" && "border-yellow-500/50 bg-yellow-500/5"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{decision.type}</Badge>
                                <Badge className={cn(
                                  "text-white",
                                  decision.impact === "critical" ? "bg-red-500" :
                                  decision.impact === "high" ? "bg-orange-500" :
                                  decision.impact === "medium" ? "bg-yellow-500" : "bg-slate-500"
                                )}>
                                  {decision.impact.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="font-medium mt-1">{decision.description}</p>
                              <p className="text-sm text-muted-foreground">
                                por {decision.agentName} às {formatTime(decision.timestamp)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{decision.confidence}%</p>
                              <p className="text-xs text-muted-foreground">confiança</p>
                            </div>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg text-sm mb-3">
                            <p className="text-muted-foreground">
                              <Brain className="h-3 w-3 inline mr-1" />
                              {decision.reasoning}
                            </p>
                          </div>

                          {decision.outcome && (
                            <div className="p-2 bg-green-500/10 rounded text-sm text-green-600 mb-3">
                              <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              {decision.outcome}
                            </div>
                          )}

                          {decision.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm">
                                Rejeitar
                              </Button>
                              <Button size="sm">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          )}

                          {decision.status !== "pending" && (
                            <Badge variant={
                              decision.status === "approved" || decision.status === "auto-executed" 
                                ? "default" 
                                : "destructive"
                            }>
                              {decision.status === "auto-executed" ? "Auto-executado" :
                               decision.status === "approved" ? "Aprovado" : "Rejeitado"}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Histórico detalhado em desenvolvimento</p>
                    <p className="text-sm">Em breve: timeline de ações, métricas de aprendizado e auditoria completa</p>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Export XCircle for use in the component
import { XCircle } from "lucide-react";
