/**
 * AI Command Dashboard - Premium AI Control Center
 * Central de comando para todos os agentes de IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Bot,
  Zap,
  Activity,
  Shield,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  BarChart3,
  MessageSquare,
  FileText,
  Anchor,
  Users,
  Ship,
  Cpu,
  Database,
  Network,
  Sparkles,
  Send,
  ThumbsUp,
  ThumbsDown,
  Eye,
  History,
  Gauge,
  Workflow,
} from "lucide-react";

// Tipos
interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "error" | "learning";
  accuracy: number;
  tasksCompleted: number;
  avgResponseTime: number;
  lastActive: string;
  icon: React.ElementType;
  description: string;
}

interface AIDecision {
  id: string;
  agentName: string;
  action: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "executed";
  timestamp: string;
  impact: "low" | "medium" | "high";
}

// Dados dos agentes
const AI_AGENTS: AIAgent[] = [
  {
    id: "crew-optimizer",
    name: "Crew Optimizer",
    type: "Otimização",
    status: "active",
    accuracy: 94.5,
    tasksCompleted: 1247,
    avgResponseTime: 1.2,
    lastActive: "Agora",
    icon: Users,
    description: "Otimiza alocação de tripulação e escalas",
  },
  {
    id: "maintenance-predictor",
    name: "Maintenance Predictor",
    type: "Preditivo",
    status: "active",
    accuracy: 91.8,
    tasksCompleted: 892,
    avgResponseTime: 2.4,
    lastActive: "2min",
    icon: Settings,
    description: "Prediz falhas e agenda manutenções",
  },
  {
    id: "compliance-auditor",
    name: "Compliance Auditor",
    type: "Auditoria",
    status: "learning",
    accuracy: 88.2,
    tasksCompleted: 634,
    avgResponseTime: 3.1,
    lastActive: "5min",
    icon: Shield,
    description: "Audita conformidade regulatória",
  },
  {
    id: "route-optimizer",
    name: "Route Optimizer",
    type: "Otimização",
    status: "active",
    accuracy: 96.1,
    tasksCompleted: 421,
    avgResponseTime: 4.5,
    lastActive: "1min",
    icon: Ship,
    description: "Otimiza rotas e consumo de combustível",
  },
  {
    id: "document-processor",
    name: "Document Processor",
    type: "OCR/NLP",
    status: "active",
    accuracy: 93.7,
    tasksCompleted: 2156,
    avgResponseTime: 1.8,
    lastActive: "Agora",
    icon: FileText,
    description: "Processa e classifica documentos",
  },
  {
    id: "safety-sentinel",
    name: "Safety Sentinel",
    type: "Monitoramento",
    status: "active",
    accuracy: 97.3,
    tasksCompleted: 567,
    avgResponseTime: 0.8,
    lastActive: "Agora",
    icon: AlertTriangle,
    description: "Monitora segurança em tempo real",
  },
  {
    id: "cost-analyzer",
    name: "Cost Analyzer",
    type: "Analytics",
    status: "idle",
    accuracy: 89.4,
    tasksCompleted: 312,
    avgResponseTime: 5.2,
    lastActive: "15min",
    icon: TrendingUp,
    description: "Analisa custos e sugere otimizações",
  },
  {
    id: "weather-advisor",
    name: "Weather Advisor",
    type: "Preditivo",
    status: "active",
    accuracy: 85.6,
    tasksCompleted: 1823,
    avgResponseTime: 0.5,
    lastActive: "Agora",
    icon: Activity,
    description: "Previsões meteorológicas e alertas",
  },
];

// Decisões pendentes
const PENDING_DECISIONS: AIDecision[] = [
  {
    id: "dec-1",
    agentName: "Crew Optimizer",
    action: "Realocar tripulante João Silva para MV Atlantic Star",
    confidence: 92,
    status: "pending",
    timestamp: "Há 5 min",
    impact: "medium",
  },
  {
    id: "dec-2",
    agentName: "Maintenance Predictor",
    action: "Agendar manutenção preventiva do motor principal - MV Pacific Queen",
    confidence: 88,
    status: "pending",
    timestamp: "Há 12 min",
    impact: "high",
  },
  {
    id: "dec-3",
    agentName: "Route Optimizer",
    action: "Alterar rota para evitar tempestade - economizar 4.500L combustível",
    confidence: 95,
    status: "pending",
    timestamp: "Há 3 min",
    impact: "high",
  },
  {
    id: "dec-4",
    agentName: "Compliance Auditor",
    action: "Renovar certificado ISPS antes do vencimento (30 dias)",
    confidence: 78,
    status: "pending",
    timestamp: "Há 20 min",
    impact: "medium",
  },
];

export function AICommandDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [decisions, setDecisions] = useState(PENDING_DECISIONS);
  const [agentSettings, setAgentSettings] = useState({
    autoApprove: false,
    confidenceThreshold: 85,
    maxActionsPerHour: 50,
  });

  const getStatusColor = (status: AIAgent["status"]) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "idle": return "bg-amber-500";
      case "error": return "bg-red-500";
      case "learning": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: AIAgent["status"]) => {
    switch (status) {
      case "active": return "Ativo";
      case "idle": return "Ocioso";
      case "error": return "Erro";
      case "learning": return "Aprendendo";
      default: return status;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high": return <Badge className="bg-red-500/20 text-red-400">Alto Impacto</Badge>;
      case "medium": return <Badge className="bg-amber-500/20 text-amber-400">Médio Impacto</Badge>;
      case "low": return <Badge className="bg-emerald-500/20 text-emerald-400">Baixo Impacto</Badge>;
      default: return null;
    }
  };

  const handleApproveDecision = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: "approved" as const } : d));
  };

  const handleRejectDecision = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" as const } : d));
  };

  // Métricas globais
  const globalMetrics = {
    totalDecisions: 4523,
    approvalRate: 87.3,
    avgConfidence: 91.2,
    actionsToday: 156,
    tokensUsed: 2456000,
    costToday: 12.45,
  };

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
            <p className="text-2xl font-bold mt-1">
              {AI_AGENTS.filter(a => a.status === "active").length}/{AI_AGENTS.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-muted-foreground">Taxa Aprovação</span>
            </div>
            <p className="text-2xl font-bold mt-1">{globalMetrics.approvalRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Confiança Média</span>
            </div>
            <p className="text-2xl font-bold mt-1">{globalMetrics.avgConfidence}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Ações Hoje</span>
            </div>
            <p className="text-2xl font-bold mt-1">{globalMetrics.actionsToday}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-pink-400" />
              <span className="text-sm text-muted-foreground">Tokens Usados</span>
            </div>
            <p className="text-2xl font-bold mt-1">{(globalMetrics.tokensUsed / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Custo Hoje</span>
            </div>
            <p className="text-2xl font-bold mt-1">${globalMetrics.costToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agentes</span>
          </TabsTrigger>
          <TabsTrigger value="decisions" className="gap-2">
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">Decisões</span>
            {decisions.filter(d => d.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {decisions.filter(d => d.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat IA</span>
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

        {/* Tab: Agentes */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_AGENTS.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedAgent?.id === agent.id ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <agent.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{agent.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{agent.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`} />
                        <span className="text-xs">{getStatusLabel(agent.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{agent.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Precisão</span>
                        <span className="font-medium">{agent.accuracy}%</span>
                      </div>
                      <Progress value={agent.accuracy} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{agent.tasksCompleted} tarefas</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{agent.avgResponseTime}s média</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Painel de detalhes do agente */}
          <AnimatePresence>
            {selectedAgent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <selectedAgent.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{selectedAgent.name}</CardTitle>
                          <CardDescription>{selectedAgent.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <History className="h-4 w-4 mr-2" />
                          Histórico
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Logs
                        </Button>
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retreinar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Gauge className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{selectedAgent.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">Precisão</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedAgent.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}s</p>
                        <p className="text-xs text-muted-foreground">Tempo Médio</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <Activity className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <p className="text-2xl font-bold">{selectedAgent.lastActive}</p>
                        <p className="text-xs text-muted-foreground">Última Atividade</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Tab: Decisões Pendentes */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Decisões Pendentes de Aprovação
                  </CardTitle>
                  <CardDescription>
                    Revise e aprove/rejeite as ações sugeridas pelos agentes de IA
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {decisions.filter(d => d.status === "pending").length} pendentes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {decisions.map((decision) => (
                    <motion.div
                      key={decision.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border ${
                        decision.status === "approved" 
                          ? "bg-emerald-500/5 border-emerald-500/30" 
                          : decision.status === "rejected"
                          ? "bg-red-500/5 border-red-500/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{decision.agentName}</Badge>
                            {getImpactBadge(decision.impact)}
                            <span className="text-xs text-muted-foreground">{decision.timestamp}</span>
                          </div>
                          <p className="text-sm mb-3">{decision.action}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confiança:</span>
                              <Progress value={decision.confidence} className="w-24 h-2" />
                              <span className="text-xs font-medium">{decision.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {decision.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-500 hover:bg-red-500/10"
                              onClick={() => handleRejectDecision(decision.id)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveDecision(decision.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          </div>
                        ) : (
                          <Badge className={
                            decision.status === "approved" 
                              ? "bg-emerald-500" 
                              : "bg-red-500"
                          }>
                            {decision.status === "approved" ? "Aprovado" : "Rejeitado"}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Chat IA */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Assistente IA Marítimo
              </CardTitle>
              <CardDescription>
                Converse com a IA para obter insights, análises e recomendações
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-primary/10 h-fit">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">
                        Olá! Sou o assistente IA do Nautilus. Posso ajudar com análises de frota, 
                        otimização de tripulação, previsões de manutenção, compliance e muito mais. 
                        Como posso ajudar?
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      📊 Resumo da frota hoje
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      ⚠️ Alertas críticos pendentes
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      🔧 Status de manutenções
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      📋 Certificados vencendo
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      💰 Análise de custos
                    </Button>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta para a IA..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance por Agente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {AI_AGENTS.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <agent.icon className="h-4 w-4 text-muted-foreground" />
                          {agent.name}
                        </span>
                        <span className="font-medium">{agent.accuracy}%</span>
                      </div>
                      <Progress value={agent.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decisões por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Otimização de Rotas", value: 234, color: "bg-blue-500" },
                    { label: "Manutenção Preditiva", value: 189, color: "bg-amber-500" },
                    { label: "Alocação de Tripulação", value: 156, color: "bg-emerald-500" },
                    { label: "Compliance", value: 98, color: "bg-purple-500" },
                    { label: "Documentos", value: 67, color: "bg-pink-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações dos Agentes</CardTitle>
              <CardDescription>
                Configure o comportamento e limites dos agentes de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-aprovação</p>
                  <p className="text-sm text-muted-foreground">
                    Aprovar automaticamente decisões acima do limiar de confiança
                  </p>
                </div>
                <Switch 
                  checked={agentSettings.autoApprove}
                  onCheckedChange={(checked) => 
                    setAgentSettings(prev => ({ ...prev, autoApprove: checked }))
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="font-medium">Limiar de Confiança</p>
                  <span className="text-sm">{agentSettings.confidenceThreshold}%</span>
                </div>
                <Slider
                  value={[agentSettings.confidenceThreshold]}
                  onValueChange={([value]) => 
                    setAgentSettings(prev => ({ ...prev, confidenceThreshold: value }))
                  }
                  min={50}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="font-medium">Máximo de Ações por Hora</p>
                  <span className="text-sm">{agentSettings.maxActionsPerHour}</span>
                </div>
                <Slider
                  value={[agentSettings.maxActionsPerHour]}
                  onValueChange={([value]) => 
                    setAgentSettings(prev => ({ ...prev, maxActionsPerHour: value }))
                  }
                  min={10}
                  max={200}
                  step={10}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AICommandDashboard;
