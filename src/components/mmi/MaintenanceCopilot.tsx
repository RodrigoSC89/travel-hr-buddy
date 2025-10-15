import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Wrench,
  AlertCircle,
  ClipboardList,
  Clock,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    jobNumber?: number;
    osNumber?: string;
    riskLevel?: "low" | "medium" | "high" | "critical";
    actions?: MessageAction[];
  };
}

interface MessageAction {
  label: string;
  type: "primary" | "secondary" | "danger";
  action: () => void;
}

const MaintenanceCopilot: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "👋 Olá! Sou o Copilot de Manutenção Inteligente do Nautilus One. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsProcessing(true);

    try {
      // Call the assistant-query Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("assistant-query", {
        body: { question: currentMessage },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date(),
        metadata: extractMetadata(data),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling assistant:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "❌ Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou use os botões de ação rápida abaixo.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractMetadata = (data: Record<string, unknown>): Message["metadata"] => {
    const metadata: Message["metadata"] = {};

    // Extract job number from response
    const jobMatch = data.answer?.match(/#(\d+)/);
    if (jobMatch) {
      metadata.jobNumber = parseInt(jobMatch[1]);
    }

    // Extract OS number from response
    const osMatch = data.answer?.match(/OS-(\d{4}-\d{6})/);
    if (osMatch) {
      metadata.osNumber = osMatch[0];
    }

    // Extract risk level from response
    if (data.answer?.includes("Risco Baixo") || data.answer?.includes("risco baixo")) {
      metadata.riskLevel = "low";
    } else if (data.answer?.includes("Risco Médio") || data.answer?.includes("risco médio")) {
      metadata.riskLevel = "medium";
    } else if (data.answer?.includes("Risco Alto") || data.answer?.includes("risco alto")) {
      metadata.riskLevel = "high";
    } else if (data.answer?.includes("CRÍTICO") || data.answer?.includes("crítico")) {
      metadata.riskLevel = "critical";
    }

    return metadata;
  };

  const handleQuickAction = (command: string) => {
    setCurrentMessage(command);
    // Automatically send the message after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRiskBadgeColor = (riskLevel?: string) => {
    switch (riskLevel) {
    case "low":
      return "bg-green-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <CardTitle>Copilot de Manutenção Inteligente</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Criar novo job de manutenção")}
            disabled={isProcessing}
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            Criar Job
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Listar OS críticas")}
            disabled={isProcessing}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            OS Críticas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Listar jobs pendentes")}
            disabled={isProcessing}
          >
            <Clock className="h-4 w-4 mr-1" />
            Jobs Pendentes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction("Avaliar postergação de job")}
            disabled={isProcessing}
          >
            <Clock className="h-4 w-4 mr-1" />
            Postergar
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                  {/* Metadata badges */}
                  {message.metadata && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.metadata.jobNumber && (
                        <Badge variant="secondary" className="text-xs">
                          Job #{message.metadata.jobNumber}
                        </Badge>
                      )}
                      {message.metadata.osNumber && (
                        <Badge variant="secondary" className="text-xs">
                          {message.metadata.osNumber}
                        </Badge>
                      )}
                      {message.metadata.riskLevel && (
                        <Badge
                          className={`text-xs text-white ${getRiskBadgeColor(
                            message.metadata.riskLevel
                          )}`}
                        >
                          {message.metadata.riskLevel === "low" && "Risco Baixo"}
                          {message.metadata.riskLevel === "medium" && "Risco Médio"}
                          {message.metadata.riskLevel === "high" && "Risco Alto"}
                          {message.metadata.riskLevel === "critical" && "CRÍTICO"}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Processando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2 border-t pt-3">
          <Input
            placeholder="Digite sua mensagem ou comando... (ex: 'Criar job de troca de óleo')"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isProcessing}
            size="icon"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Helper text */}
        <div className="text-xs text-gray-500 text-center">
          💡 Dica: Use comandos como &quot;criar job&quot;, &quot;postergar job #123&quot;, &quot;listar OS críticas&quot;
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceCopilot;
