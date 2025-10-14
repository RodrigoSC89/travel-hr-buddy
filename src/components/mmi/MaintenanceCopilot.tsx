"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Tool
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "destructive" | "outline";
  }>;
  metadata?: {
    jobNumber?: string;
    osNumber?: string;
    risk?: string;
  };
}

// Quick command buttons for maintenance
const maintenanceCommands = [
  { 
    label: "Criar Job", 
    command: "Criar job de manutenção preventiva", 
    icon: <Tool className="h-4 w-4" /> 
  },
  { 
    label: "Listar OS Críticas", 
    command: "Listar OS críticas", 
    icon: <AlertTriangle className="h-4 w-4" /> 
  },
  { 
    label: "Jobs Pendentes", 
    command: "Mostrar jobs pendentes", 
    icon: <Clock className="h-4 w-4" /> 
  },
  { 
    label: "Postergar Job", 
    command: "Avaliar postergação de job", 
    icon: <Calendar className="h-4 w-4" /> 
  },
];

// Maintenance capabilities
const capabilities = [
  "Criar jobs de manutenção via linguagem natural",
  "Listar Ordens de Serviço (OS) críticas",
  "Avaliar risco de postergação com IA",
  "Consultar histórico de manutenções",
  "Monitorar status de equipamentos",
  "Gerar relatórios técnicos",
  "Buscar jobs por embarcação ou componente",
  "Recomendar ações preventivas",
];

export function MaintenanceCopilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(commandText?: string) {
    const question = commandText || input.trim();
    if (!question) return;
    
    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      logger.info("MMI Copilot - Sending message:", question);

      // Try Supabase Edge Function first
      const { data, error } = await supabase.functions.invoke("assistant-query", {
        body: { question },
      });

      if (error) {
        logger.error("MMI Copilot - Supabase function error:", error);
        throw error;
      }

      // Parse response and add maintenance-specific enhancements
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "Desculpe, não consegui processar sua solicitação.",
      };

      // Add contextual actions based on the query content
      if (question.toLowerCase().includes("criar job")) {
        assistantMessage.actions = [
          { label: "Ver Jobs", action: "/mmi/jobs", variant: "default" },
          { label: "Novo Job", action: "/mmi/jobs/new", variant: "outline" },
        ];
      } else if (question.toLowerCase().includes("postergar")) {
        assistantMessage.actions = [
          { label: "Avaliar Risco", action: "evaluate_risk", variant: "default" },
          { label: "Ver Histórico", action: "/mmi/history", variant: "outline" },
        ];
      } else if (question.toLowerCase().includes("os") || question.toLowerCase().includes("ordem")) {
        assistantMessage.actions = [
          { label: "Ver OS", action: "/mmi/os", variant: "default" },
          { label: "Criar OS", action: "/mmi/os/create", variant: "outline" },
        ];
      }

      setMessages((prev) => [...prev, assistantMessage]);
      logger.info("MMI Copilot - Response received successfully");

    } catch (error) {
      logger.error("MMI Copilot - Error:", error);
      
      // Fallback with maintenance-specific guidance
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Desculpe, ocorreu um erro ao processar sua solicitação.\n\n💡 **Comandos disponíveis:**\n\n• "Criar job de [descrição]" - Criar novo job de manutenção\n• "Listar OS críticas" - Ver ordens de serviço urgentes\n• "Postergar job #[número]" - Avaliar postergação\n• "Status da embarcação [nome]" - Ver status de manutenção\n• "Histórico do [componente]" - Ver histórico técnico\n\nTente reformular sua pergunta ou use um dos comandos sugeridos.`,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Erro ao processar mensagem");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleActionClick(action: string) {
    if (action.startsWith("/")) {
      // Navigation action
      window.location.href = action;
    } else {
      // Custom action
      toast.info(`Ação: ${action}`);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">🤖 Copilot de Manutenção</CardTitle>
              <CardDescription>
                Seu assistente técnico inteligente para gestão de manutenção
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Commands */}
      {messages.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Wrench className="h-4 w-4 mr-2" />
                  Comandos Rápidos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {maintenanceCommands.map((cmd) => (
                    <Button
                      key={cmd.label}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(cmd.command)}
                      className="text-xs"
                    >
                      {cmd.icon}
                      <span className="ml-2">{cmd.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">✨ Capacidades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-start text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Exemplos:</strong>
                  <br />
                  • "Criar job de troca de óleo no gerador BB"
                  <br />
                  • "Postergar job #2493"
                  <br />
                  • "Listar OS críticas para a docagem"
                  <br />
                  • "Quantos jobs pendentes há para a embarcação Atlas?"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || "outline"}
                            size="sm"
                            onClick={() => handleActionClick(action.action)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Metadata Badges */}
                    {message.metadata && (
                      <div className="flex flex-wrap gap-2">
                        {message.metadata.jobNumber && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {message.metadata.jobNumber}
                          </Badge>
                        )}
                        {message.metadata.osNumber && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {message.metadata.osNumber}
                          </Badge>
                        )}
                        {message.metadata.risk && (
                          <Badge 
                            variant={
                              message.metadata.risk === "high" ? "destructive" :
                              message.metadata.risk === "medium" ? "default" :
                              "secondary"
                            }
                            className="text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Risco {message.metadata.risk}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-secondary rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre manutenção... (ex: 'Criar job de inspeção do motor')"
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pressione Enter para enviar • Use linguagem natural para comandos
          </p>
        </div>
      </Card>
    </div>
  );
}
