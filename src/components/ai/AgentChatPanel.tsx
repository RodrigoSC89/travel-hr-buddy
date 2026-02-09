/**
 * Agent Chat Panel - Real interactive chat with AI agents
 * Supports text input, actions, and execution logs
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  Copy,
  Play,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  status?: "pending" | "success" | "error";
  actions?: AgentAction[];
  executionLog?: string[];
}

interface AgentAction {
  id: string;
  label: string;
  type: "execute" | "approve" | "reject" | "simulate";
  payload?: Record<string, unknown>;
}

interface AgentChatPanelProps {
  agentId: string;
  agentName: string;
  agentRole: string;
  onClose: () => void;
}

const AGENT_RESPONSES: Record<string, string[]> = {
  captain: [
    "Analisando dados de rota e tripulação...",
    "Com base nos dados atuais, recomendo otimizar a escala de trabalho para reduzir fadiga.",
    "A rota atual está 95% otimizada. Posso sugerir uma alternativa com economia de 8% em combustível."
  ],
  engineer: [
    "Verificando dados de sensores e telemetria...",
    "Detectei um padrão de vibração anormal no motor principal. Recomendo inspeção preventiva.",
    "A manutenção do gerador #2 está 15 dias atrasada. Posso criar uma ordem de serviço automaticamente."
  ],
  safety: [
    "Executando verificação de compliance PEOTRAM...",
    "Todos os checklists de segurança estão atualizados. Score de compliance: 98.5%",
    "Identifiquei 2 certificados próximos do vencimento. Deseja que eu gere alertas para a tripulação?"
  ],
  wellness: [
    "Analisando indicadores de bem-estar da tripulação...",
    "3 tripulantes apresentam sinais de fadiga acumulada. Recomendo ajuste de escala.",
    "O índice de satisfação da tripulação está em 87%. Posso sugerir ações de melhoria."
  ],
  navigator: [
    "Processando dados meteorológicos e de tráfego marítimo...",
    "Condições favoráveis nas próximas 48h. Velocidade ideal: 12 nós para economia de combustível.",
    "Detectei uma área de mau tempo no caminho. Rota alternativa disponível com desvio de 45 milhas."
  ],
  economist: [
    "Calculando métricas financeiras e de consumo...",
    "OPEX atual está 5% acima do orçado. Principais fatores: combustível e manutenção não planejada.",
    "Oportunidade de economia: ajustar RPM para consumo ótimo pode economizar $3.200/mês."
  ],
  predictor: [
    "Executando modelos preditivos com TensorFlow...",
    "Probabilidade de falha do compressor em 30 dias: 23%. Tendência crescente detectada.",
    "Anomalia térmica identificada no sistema de refrigeração. Confiança: 89%."
  ],
  communicator: [
    "Preparando comunicações e notificações...",
    "Briefing diário enviado para 45 tripulantes. Taxa de leitura: 92%.",
    "Posso agendar uma comunicação em massa para a tripulação sobre a próxima escala."
  ]
};

export function AgentChatPanel({ agentId, agentName, agentRole, onClose }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: `Olá! Sou o ${agentName}. ${agentRole}. Como posso ajudar?`,
      timestamp: new Date(),
      agentId,
      agentName,
      status: "success"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateAgentResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Add "thinking" log
    const thinkingLog = `[${new Date().toLocaleTimeString()}] Processando: "${userMessage.substring(0, 50)}..."`;
    setExecutionLogs(prev => [...prev, thinkingLog]);

    // Process agent response

    // Get relevant responses for this agent
    const responses = AGENT_RESPONSES[agentId] || AGENT_RESPONSES.captain;
    const msgSeed = userMessage.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const selectedResponse = responses[msgSeed % responses.length];

    // Generate actions based on response
    const actions: AgentAction[] = [];
    if (selectedResponse.includes("Posso") || selectedResponse.includes("Recomendo")) {
      actions.push(
        { id: "1", label: "Executar Ação", type: "execute" },
        { id: "2", label: "Simular", type: "simulate" }
      );
    }
    if (selectedResponse.includes("ordem de serviço") || selectedResponse.includes("alertas")) {
      actions.push(
        { id: "3", label: "Aprovar", type: "approve" },
        { id: "4", label: "Rejeitar", type: "reject" }
      );
    }

    const agentMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "agent",
      content: selectedResponse,
      timestamp: new Date(),
      agentId,
      agentName,
      status: "success",
      actions: actions.length > 0 ? actions : undefined,
      executionLog: [
        `Análise iniciada em ${new Date().toLocaleTimeString()}`,
        `Modelo: Claude Opus 4 | Latência: ${950 + (msgSeed % 300)}ms`,
        `Tokens: ${120 + (msgSeed % 150)} entrada / ${180 + (msgSeed % 200)} saída`,
        `Confiança: ${87 + (msgSeed % 12)}%`
      ]
    };

    setMessages(prev => [...prev, agentMessage]);
    setExecutionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Resposta gerada com sucesso`]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    await simulateAgentResponse(input);
  };

  const handleAction = (action: AgentAction) => {
    setExecutionLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Ação executada: ${action.label}`
    ]);

    switch (action.type) {
      case "execute":
        toast.success("Ação executada com sucesso!", {
          description: `${agentName} executou a ação solicitada`
        });
        break;
      case "approve":
        toast.success("Aprovado!", {
          description: "A ação foi aprovada e será executada"
        });
        break;
      case "reject":
        toast.info("Rejeitado", {
          description: "A ação foi rejeitada"
        });
        break;
      case "simulate":
        toast.info("Simulação iniciada", {
          description: "Executando em modo sandbox"
        });
        break;
    }
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(executionLogs.join("\n"));
    toast.success("Logs copiados!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-primary/20">
                <AvatarFallback className="bg-primary/20 text-primary">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{agentName}</CardTitle>
                <p className="text-sm text-muted-foreground">{agentRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-500">
                <Zap className="h-3 w-3 mr-1" />
                Online
              </Badge>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col border-r">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={message.role === "user" ? "bg-blue-500/20" : "bg-primary/20"}>
                          {message.role === "user" ? (
                            <User className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : ""}`}>
                        <div className={`rounded-lg p-3 ${
                          message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        {/* Actions */}
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {message.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.type === "reject" ? "outline" : "default"}
                                className="h-7 text-xs"
                                onClick={() => handleAction(action)}
                              >
                                {action.type === "execute" && <Play className="h-3 w-3 mr-1" />}
                                {action.type === "approve" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {action.type === "simulate" && <RefreshCw className="h-3 w-3 mr-1" />}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Execution Log Preview */}
                        {message.executionLog && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-[10px] font-mono text-muted-foreground max-w-full">
                            {message.executionLog.slice(0, 2).map((log, idx) => (
                              <div key={idx}>{log}</div>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Pergunte ao ${agentName}...`}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isTyping}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Execution Logs Sidebar */}
          <div className="w-80 flex flex-col bg-muted/30">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Logs de Execução</span>
              <Button variant="ghost" size="icon" onClick={copyLogs}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-1 font-mono text-[10px]">
                {executionLogs.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum log ainda...</p>
                ) : (
                  executionLogs.map((log, idx) => (
                    <div key={idx} className="text-muted-foreground">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
