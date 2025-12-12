import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Send, Loader2, Wrench, AlertTriangle, 
  CheckCircle, Clock, Package, Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: CopilotResponse;
}

interface CopilotResponse {
  tipo_resposta: string;
  titulo: string;
  resumo: string;
  job?: {
    nome: string;
    equipamento_codigo: string;
    equipamento_nome: string;
    criticidade: string;
    prazo_dias: number;
    tipo_manutencao: string;
    descricao: string;
    pecas_necessarias: string[];
    justificativa: string;
  };
  acoes_sugeridas?: string[];
  alertas?: string[];
  metricas?: {
    risco_postergacao: string;
    confianca: number;
    mtbf_estimado: string;
  };
}

interface MMICopilotProps {
  onJobCreated?: (job: unknown: unknown: unknown) => void;
  context?: {
    jobs?: unknown[];
    equipamentos?: unknown[];
    historico?: unknown[];
    estoque?: unknown[];
  };
}

const quickActions = [
  { label: "Criar job urgente", prompt: "Preciso criar um job urgente de manutenção" },
  { label: "Verificar pendências", prompt: "Quais são os jobs críticos pendentes?" },
  { label: "Analisar equipamento", prompt: "Analise o histórico de falhas do motor principal" },
  { label: "Posso postergar?", prompt: "Posso postergar a manutenção preventiva programada?" },
];

export const MMICopilot: React.FC<MMICopilotProps> = ({ onJobCreated, context }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o Copilot de Manutenção do Nautilus One. Como posso ajudar com suas operações de manutenção hoje?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("mmi-copilot", {
        body: { 
          message: messageText,
          context: context,
          action: detectAction(messageText)
        }
      });

      if (error) throw error;

      const assistantMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.resumo || data.error || "Não consegui processar sua solicitação.",
        timestamp: new Date(),
        data: data,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If a job was created, notify parent
      if (data.tipo_resposta === "criacao_job" && data.job && onJobCreated) {
        onJobCreated(data.job);
      }
    } catch (error: SupabaseError | null) {
      console.error("Copilot error:", error);
      
      const errorMessage: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no Copilot",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const detectAction = (text: string): string | undefined => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("criar") || lowerText.includes("novo job") || lowerText.includes("registrar")) {
      return "criar_job";
    }
    if (lowerText.includes("postergar") || lowerText.includes("adiar") || lowerText.includes("posso esperar")) {
      return "postergar";
    }
    if (lowerText.includes("diagnóstico") || lowerText.includes("analise") || lowerText.includes("situação")) {
      return "diagnostico";
    }
    return undefined;
  };

  const getCriticalityColor = (criticidade: string) => {
    switch (criticidade) {
    case "alta": return "bg-red-500";
    case "media": return "bg-yellow-500";
    case "baixa": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getRiskColor = (risco: string) => {
    switch (risco) {
    case "alto": return "text-red-500";
    case "medio": return "text-yellow-500";
    case "baixo": return "text-green-500";
    default: return "text-gray-500";
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Copilot de Manutenção
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Render structured job data */}
                {message.data?.job && (
                  <div className="mt-3 p-3 bg-background/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4" />
                      <span className="font-semibold">{message.data.job.nome}</span>
                      <Badge className={getCriticalityColor(message.data.job.criticidade)}>
                        {message.data.job.criticidade}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>📍 {message.data.job.equipamento_codigo} - {message.data.job.equipamento_nome}</p>
                      <p>📆 Prazo: {message.data.job.prazo_dias} dias</p>
                      <p>🔧 Tipo: {message.data.job.tipo_manutencao}</p>
                      {message.data.job.pecas_necessarias?.length > 0 && (
                        <p>📦 Peças: {message.data.job.pecas_necessarias.join(", ")}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Render metrics */}
                {message.data?.metricas && (
                  <div className="mt-3 p-3 bg-background/50 rounded-lg border">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Risco</p>
                        <p className={`font-semibold ${getRiskColor(message.data.metricas.risco_postergacao)}`}>
                          {message.data.metricas.risco_postergacao}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Confiança</p>
                        <p className="font-semibold">{message.data.metricas.confianca}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">MTBF</p>
                        <p className="font-semibold">{message.data.metricas.mtbf_estimado}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render alerts */}
                {message.data?.alertas && message.data.alertas.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.data.alertas.map((alert, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-yellow-600">
                        <AlertTriangle className="h-3 w-3" />
                        {alert}
                      </div>
                    ))}
                  </div>
                )}

                {/* Render suggested actions */}
                {message.data?.acoes_sugeridas && message.data.acoes_sugeridas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.data.acoes_sugeridas.map((acao, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handlesendMessage}
                      >
                        {acao}
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs"
              onClick={() => handlesendMessage}
              disabled={isLoading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <CardContent className="pt-0 pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={handleChange}
            placeholder="Ex: Criar job urgente para vazamento na bomba STBD..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
