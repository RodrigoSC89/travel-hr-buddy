/**
 * Interactive AI Agent Chat - Agentes com chat real, ações e logs
 * Para AI Command Center, Autonomous Command, Agent Orchestration
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Brain,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  History,
  Settings,
  AlertTriangle,
  TrendingUp,
  Activity,
  Terminal,
  FileText,
  ChevronRight,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  actions?: AgentAction[];
  metadata?: {
    tokens?: number;
    latency_ms?: number;
    confidence?: number;
  };
}

interface AgentAction {
  id: string;
  type: "suggestion" | "automation" | "alert" | "analysis";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "executed";
  impact?: "low" | "medium" | "high";
  params?: Record<string, any>;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  type: "assistant" | "analyst" | "automator" | "guardian";
  status: "active" | "idle" | "busy" | "offline";
  capabilities: string[];
  stats: {
    tasks_completed: number;
    success_rate: number;
    avg_response_ms: number;
  };
}

interface ExecutionLog {
  id: string;
  agent_id: string;
  action: string;
  status: "success" | "error" | "warning";
  message: string;
  timestamp: string;
  duration_ms?: number;
  details?: Record<string, any>;
}

const mockAgents: Agent[] = [
  {
    id: "agent-voyage",
    name: "Voyage Optimizer",
    description: "Otimização de rotas e consumo de combustível",
    type: "analyst",
    status: "active",
    capabilities: ["Route optimization", "Fuel analysis", "Weather integration", "ETA prediction"],
    stats: { tasks_completed: 1247, success_rate: 94.5, avg_response_ms: 850 },
  },
  {
    id: "agent-compliance",
    name: "Compliance Guardian",
    description: "Monitoramento de conformidade regulatória",
    type: "guardian",
    status: "active",
    capabilities: ["MLC 2006", "STCW", "SOLAS", "MARPOL", "Document validation"],
    stats: { tasks_completed: 892, success_rate: 99.1, avg_response_ms: 420 },
  },
  {
    id: "agent-maintenance",
    name: "Predictive Maintenance",
    description: "Predição de falhas e manutenção preventiva",
    type: "analyst",
    status: "busy",
    capabilities: ["Failure prediction", "Sensor analysis", "Work order generation"],
    stats: { tasks_completed: 567, success_rate: 91.2, avg_response_ms: 1200 },
  },
  {
    id: "agent-crew",
    name: "Crew Wellness AI",
    description: "Monitoramento de bem-estar da tripulação",
    type: "assistant",
    status: "active",
    capabilities: ["Fatigue detection", "Work hours tracking", "Wellness recommendations"],
    stats: { tasks_completed: 2341, success_rate: 96.8, avg_response_ms: 380 },
  },
];

const mockLogs: ExecutionLog[] = [
  {
    id: "log-001",
    agent_id: "agent-voyage",
    action: "Route Optimization",
    status: "success",
    message: "Rota Santos → Rotterdam otimizada. Economia estimada: 12% combustível",
    timestamp: "2026-01-31T10:15:00Z",
    duration_ms: 2340,
    details: { fuel_saved_tons: 45.2, time_saved_hours: 8 },
  },
  {
    id: "log-002",
    agent_id: "agent-compliance",
    action: "Document Validation",
    status: "warning",
    message: "Certificado STCW de 3 tripulantes expira em 30 dias",
    timestamp: "2026-01-31T09:45:00Z",
    duration_ms: 890,
    details: { crew_ids: ["crew-123", "crew-456", "crew-789"] },
  },
  {
    id: "log-003",
    agent_id: "agent-maintenance",
    action: "Failure Prediction",
    status: "error",
    message: "Sensor de temperatura do motor principal offline",
    timestamp: "2026-01-31T09:30:00Z",
    duration_ms: 1100,
  },
];

export function InteractiveAgentChat() {
  const { toast } = useToast();
  const [agents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(mockAgents[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: `Olá! Sou o ${mockAgents[0].name}. Como posso ajudar com otimização de viagens hoje?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [logs, setLogs] = useState<ExecutionLog[]>(mockLogs);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<AgentAction | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Change agent
  const handleAgentChange = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        id: `msg-welcome-${agent.id}`,
        role: "assistant",
        content: `Olá! Sou o ${agent.name}. ${agent.description}. Como posso ajudar?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate response directly

    // Generate contextual response with actions
    const response = generateAgentResponse(inputValue, selectedAgent);
    
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);

    // Log the interaction
    const newLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      agent_id: selectedAgent.id,
      action: "Chat Interaction",
      status: "success",
      message: `Respondeu: "${inputValue.substring(0, 50)}..."`,
      timestamp: new Date().toISOString(),
      duration_ms: 1500,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Generate contextual response
  const generateAgentResponse = (query: string, agent: Agent): Message => {
    const lowerQuery = query.toLowerCase();
    let content = "";
    const actions: AgentAction[] = [];

    if (agent.id === "agent-voyage") {
      if (lowerQuery.includes("rota") || lowerQuery.includes("viagem")) {
        content = "Analisei as rotas ativas. Encontrei 2 oportunidades de otimização:\n\n1. **Santos → Rotterdam**: Desvio por corrente favorável economiza 8h\n2. **Singapore → Dubai**: Alteração de velocidade reduz consumo em 15%\n\nDeseja que eu aplique essas otimizações?";
        actions.push({
          id: "act-1",
          type: "automation",
          title: "Otimizar Rota Santos-Rotterdam",
          description: "Aplicar desvio por corrente favorável",
          status: "pending",
          impact: "high",
          params: { voyage_id: "VYG-001", fuel_save: "12%" },
        });
      } else if (lowerQuery.includes("combustível") || lowerQuery.includes("fuel")) {
        content = "O consumo atual da frota está 8% acima da média. Principais causas:\n\n• Velocidade excessiva em 3 embarcações\n• Condições meteorológicas adversas\n• Cascos precisando de limpeza\n\nRecomendo redução de velocidade imediata.";
        actions.push({
          id: "act-2",
          type: "suggestion",
          title: "Reduzir Velocidade da Frota",
          description: "Ajustar velocidade de 3 navios para economizar combustível",
          status: "pending",
          impact: "medium",
        });
      } else {
        content = "Entendi sua solicitação. Posso ajudar com:\n\n• Otimização de rotas\n• Análise de consumo de combustível\n• Previsão de ETA\n• Integração meteorológica\n\nO que você gostaria de explorar?";
      }
    } else if (agent.id === "agent-compliance") {
      if (lowerQuery.includes("certificado") || lowerQuery.includes("documento")) {
        content = "**Situação de Documentos:**\n\n🔴 3 certificados STCW expiram em 30 dias\n🟡 5 certificados médicos expiram em 60 dias\n🟢 Demais documentos em conformidade\n\nDeseja que eu gere alertas automáticos para os responsáveis?";
        actions.push({
          id: "act-3",
          type: "alert",
          title: "Gerar Alertas de Certificados",
          description: "Notificar tripulantes e RH sobre renovações pendentes",
          status: "pending",
          impact: "high",
        });
      } else if (lowerQuery.includes("mlc") || lowerQuery.includes("stcw")) {
        content = "**Status MLC 2006 / STCW:**\n\n✅ Horas de trabalho: Conformidade 98%\n✅ Contratos SEA: 100% válidos\n⚠️ Treinamentos: 2 tripulantes pendentes\n\nGeral: **94% de conformidade**";
      } else {
        content = "Posso verificar conformidade com:\n\n• MLC 2006 (trabalho marítimo)\n• STCW (treinamentos)\n• SOLAS (segurança)\n• MARPOL (meio ambiente)\n\nQual regulamentação deseja verificar?";
      }
    } else if (agent.id === "agent-maintenance") {
      if (lowerQuery.includes("falha") || lowerQuery.includes("manutenção")) {
        content = "**Previsão de Manutenção:**\n\n🔴 Motor principal (Navio A): 72% prob. falha em 15 dias\n🟡 Sistema hidráulico (Navio B): 45% prob. em 30 dias\n🟢 Demais sistemas estáveis\n\nRecomendo gerar ordem de serviço preventiva.";
        actions.push({
          id: "act-4",
          type: "automation",
          title: "Criar Ordem de Serviço",
          description: "OS preventiva para motor principal do Navio A",
          status: "pending",
          impact: "high",
        });
      } else {
        content = "Monitoro continuamente:\n\n• Sensores de temperatura\n• Vibração de motores\n• Pressão de sistemas\n• Histórico de manutenções\n\nAlgum equipamento específico que deseja analisar?";
      }
    } else {
      if (lowerQuery.includes("fadiga") || lowerQuery.includes("bem-estar")) {
        content = "**Análise de Bem-estar:**\n\n• 12% da tripulação com sinais de fadiga\n• 3 tripulantes excederam horas recomendadas\n• Score geral de bem-estar: 78/100\n\nRecomendo ajuste de escalas.";
        actions.push({
          id: "act-5",
          type: "suggestion",
          title: "Ajustar Escalas",
          description: "Redistribuir turnos para reduzir fadiga",
          status: "pending",
          impact: "medium",
        });
      } else {
        content = "Acompanho a saúde da tripulação:\n\n• Detecção de fadiga\n• Horas de trabalho/descanso\n• Indicadores de bem-estar\n• Recomendações preventivas\n\nComo posso ajudar?";
      }
    }

    return {
      id: `msg-${Date.now()}-response`,
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
      actions,
      metadata: {
        tokens: 150 + (content.length % 100),
        latency_ms: 900 + (content.length % 300),
        confidence: 88 + (content.length % 10),
      },
    };
  };

  // Handle action
  const handleAction = (action: AgentAction) => {
    setPendingAction(action);
    setIsApprovalOpen(true);
  };

  // Approve action
  const handleApprove = async () => {
    if (!pendingAction) return;

    setIsApprovalOpen(false);

    // Update action status in messages
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((a) =>
          a.id === pendingAction.id ? { ...a, status: "executed" as const } : a
        ),
      }))
    );

    // Add log
    const newLog: ExecutionLog = {
      id: `log-${Date.now()}`,
      agent_id: selectedAgent.id,
      action: pendingAction.title,
      status: "success",
      message: `Ação "${pendingAction.title}" executada com sucesso`,
      timestamp: new Date().toISOString(),
      duration_ms: 750,
    };
    setLogs((prev) => [newLog, ...prev]);

    toast({
      title: "Ação executada",
      description: pendingAction.title,
    });

    // Add confirmation message
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-confirm`,
        role: "system",
        content: `✅ Ação "${pendingAction.title}" executada com sucesso.`,
        timestamp: new Date().toISOString(),
      },
    ]);

    setPendingAction(null);
  };

  // Reject action
  const handleReject = () => {
    if (!pendingAction) return;

    setIsApprovalOpen(false);

    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        actions: msg.actions?.map((a) =>
          a.id === pendingAction.id ? { ...a, status: "rejected" as const } : a
        ),
      }))
    );

    toast({
      title: "Ação rejeitada",
      description: pendingAction.title,
      variant: "destructive",
    });

    setPendingAction(null);
  };

  // Copy message
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copiado!", description: "Mensagem copiada para área de transferência" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Agent List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Agentes IA</CardTitle>
          <CardDescription>Selecione um agente para conversar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleAgentChange(agent)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedAgent.id === agent.id
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  agent.status === "active"
                    ? "bg-green-500/20"
                    : agent.status === "busy"
                    ? "bg-yellow-500/20"
                    : "bg-muted"
                }`}>
                  <Bot className={`h-4 w-4 ${
                    agent.status === "active"
                      ? "text-green-500"
                      : agent.status === "busy"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{agent.stats.success_rate}% sucesso</span>
                <span>•</span>
                <span>{agent.stats.avg_response_ms}ms</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{selectedAgent.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedAgent.status === "active" ? "default" : "secondary"}>
                    {selectedAgent.status === "active" ? "Ativo" : selectedAgent.status === "busy" ? "Ocupado" : "Offline"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedAgent.capabilities.slice(0, 2).join(", ")}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`p-2 rounded-full h-fit ${
                  msg.role === "user"
                    ? "bg-primary"
                    : msg.role === "system"
                    ? "bg-muted"
                    : "bg-secondary"
                }`}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : msg.role === "system" ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div className={`p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.role === "system"
                      ? "bg-muted"
                      : "bg-muted"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.actions.map((action) => (
                        <div
                          key={action.id}
                          className="p-3 bg-background border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className={`h-4 w-4 ${
                                action.impact === "high"
                                  ? "text-destructive"
                                  : action.impact === "medium"
                                  ? "text-warning"
                                  : "text-muted-foreground"
                              }`} />
                              <span className="font-medium text-sm">{action.title}</span>
                            </div>
                            <Badge variant={
                              action.status === "executed"
                                ? "default"
                                : action.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }>
                              {action.status === "executed"
                                ? "Executado"
                                : action.status === "rejected"
                                ? "Rejeitado"
                                : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                          {action.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleAction(action)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setPendingAction(action);
                                  handleReject();
                                }}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.metadata && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{msg.metadata.latency_ms}ms</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{msg.metadata.confidence}% conf.</span>
                      </>
                    )}
                    {msg.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(msg.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-secondary h-fit">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              GPT-4o
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Contexto: Marítimo
            </span>
          </div>
        </div>
      </Card>

      {/* Logs Panel */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Logs de Execução
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-muted rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  {log.status === "success" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : log.status === "warning" ? (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive" />
                  )}
                  <span className="font-medium text-xs">{log.action}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{log.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                  {log.duration_ms && (
                    <>
                      <span>•</span>
                      <span>{log.duration_ms}ms</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Approval Modal */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Ação</DialogTitle>
            <DialogDescription>
              Revise os detalhes antes de executar
            </DialogDescription>
          </DialogHeader>
          {pendingAction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className={`h-5 w-5 ${
                    pendingAction.impact === "high"
                      ? "text-destructive"
                      : pendingAction.impact === "medium"
                      ? "text-warning"
                      : "text-muted-foreground"
                  }`} />
                  <span className="font-semibold">{pendingAction.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{pendingAction.description}</p>
                {pendingAction.params && (
                  <div className="mt-3 p-2 bg-background rounded text-xs font-mono">
                    {JSON.stringify(pendingAction.params, null, 2)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  pendingAction.impact === "high"
                    ? "destructive"
                    : pendingAction.impact === "medium"
                    ? "default"
                    : "secondary"
                }>
                  Impacto: {pendingAction.impact === "high" ? "Alto" : pendingAction.impact === "medium" ? "Médio" : "Baixo"}
                </Badge>
                <Badge variant="outline">{pendingAction.type}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprovar e Executar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
