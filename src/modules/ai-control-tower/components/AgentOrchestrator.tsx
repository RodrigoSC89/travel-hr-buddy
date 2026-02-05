/**
 * Agent Orchestrator - Orquestração de Agentes de IA
 * Controle e monitoramento de agentes especializados
 * UPDATED: Usando dados reais do Supabase
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Brain,
  Zap,
  Activity,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Send,
  Terminal,
  Cpu,
  BarChart3,
  Shield,
  Eye,
  Loader2,
  ChevronRight,
  Sparkles,
  Network,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAgentOrchestratorData, Agent, AgentLog } from "@/hooks/useAgentOrchestratorData";

interface Conversation {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  agentId?: string;
  confidence?: number;
}

export default function AgentOrchestrator() {
  const { agents, logs, stats, isLoading, sendCommand, toggleAgentStatus, isSending } = useAgentOrchestratorData();
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation[]>([
    {
      id: "1",
      role: "system",
      content: "Sistema de orquestração de agentes iniciado. Todos os agentes estão operacionais.",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: Agent["status"]) => {
    const config = {
      active: { label: "Ativo", color: "bg-green-500/10 text-green-500" },
      idle: { label: "Ocioso", color: "bg-gray-500/10 text-gray-500" },
      processing: { label: "Processando", color: "bg-blue-500/10 text-blue-500" },
      error: { label: "Erro", color: "bg-destructive/10 text-destructive" },
      disabled: { label: "Desativado", color: "bg-gray-500/10 text-gray-400" },
    };
    const { label, color } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const getAutonomyLabel = (level: Agent["autonomyLevel"]) => {
    const labels = ["L0: Apenas Sugestões", "L1: Ações Simples", "L2: Ações Complexas", "L3: Autônomo"];
    return labels[level];
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage: Conversation = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, newUserMessage]);
    const messageToSend = userMessage;
    setUserMessage("");
    setIsProcessing(true);

    // Send to backend
    sendCommand({ message: messageToSend });

    // Simulate agent response
    setTimeout(() => {
      const targetAgent = agents.length > 0 ? agents[0] : null;
      const agentResponse: Conversation = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `Analisando sua solicitação: "${messageToSend}"\n\n${targetAgent ? `O agente ${targetAgent.name} foi designado para processar esta tarefa.` : "Comando registrado para processamento."} Estimativa de conclusão: 30 segundos.`,
        timestamp: new Date(),
        agentId: targetAgent?.id,
        confidence: 0.92,
      };
      setConversation((prev) => [...prev, agentResponse]);
      setIsProcessing(false);
      toast.success(targetAgent ? `Tarefa atribuída ao agente ${targetAgent.name}` : "Comando enviado");
    }, 1500);
  };

  const getLogStatusIcon = (status: AgentLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando agentes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold">{stats.activeAgents}/{stats.totalAgents}</p>
              </div>
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processando</p>
                <p className="text-2xl font-bold">{stats.processingAgents}</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarefas (total)</p>
                <p className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{stats.avgSuccessRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-2">
                {agents.map((agent: Agent) => (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAgent?.id === agent.id
                        ? "border-primary bg-primary/5"
                        : agent.status === "disabled"
                        ? "opacity-50"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        agent.status === "active" ? "bg-green-500/10" :
                        agent.status === "processing" ? "bg-blue-500/10" :
                        "bg-gray-500/10"
                      }`}>
                        <Bot className={`h-5 w-5 ${
                          agent.status === "active" ? "text-green-500" :
                          agent.status === "processing" ? "text-blue-500" :
                          "text-gray-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{agent.name}</p>
                          {agent.status === "processing" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.type}</p>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                    {agent.currentTask && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="text-muted-foreground">Tarefa: </span>
                        {agent.currentTask}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interface de Comandos
            </CardTitle>
            <CardDescription>
              Envie comandos para os agentes de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[400px]">
              <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {conversation.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : msg.role === "system"
                              ? "bg-muted/50 text-muted-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "agent" && (
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="h-4 w-4" />
                              <span className="text-xs font-medium">
                                {agents.find((a: Agent) => a.id === msg.agentId)?.name || "Agent"}
                              </span>
                              {msg.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(msg.confidence * 100)}%
                                </Badge>
                              )}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(msg.timestamp, "HH:mm")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processando...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite um comando para os agentes..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isProcessing}
                />
                <Button onClick={handleSendMessage} disabled={isProcessing || !userMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Detalhes do Agente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgent ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{selectedAgent.name}</h3>
                      {getStatusBadge(selectedAgent.status)}
                    </div>
                    <p className="text-muted-foreground">{selectedAgent.type}</p>
                    <p className="text-sm mt-2">{getAutonomyLabel(selectedAgent.autonomyLevel)}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedAgent.status === "disabled" ? (
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Ativar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{selectedAgent.tasksCompleted}</p>
                    <p className="text-xs text-muted-foreground">Tarefas</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}ms</p>
                    <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{selectedAgent.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Sucesso</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Capacidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((cap, i) => (
                      <Badge key={i} variant="outline">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Nível de Autonomia</h4>
                    <span className="text-sm">L{selectedAgent.autonomyLevel}</span>
                  </div>
                  <Progress value={(selectedAgent.autonomyLevel / 3) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getAutonomyLabel(selectedAgent.autonomyLevel)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Selecione um agente para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Log de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {logs.map((log: AgentLog) => (
                  <div key={log.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                    {getLogStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.agentName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(log.timestamp, "HH:mm:ss")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.action}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      )}
                    </div>
                    {log.duration && (
                      <span className="text-xs text-muted-foreground">
                        {(log.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
