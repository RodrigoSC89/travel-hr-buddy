import { useEffect, useRef, useState } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bot, 
  Send, 
  Loader2, 
  Fuel,
  TrendingDown,
  Calculator,
  Route,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FuelAICopilotProps {
  fuelData?: {
    averageConsumption: number;
    totalSavings: number;
    trend: string;
    routesAnalyzed: number;
  };
}

const quickActions = [
  { label: "Analisar consumo atual", icon: Fuel, prompt: "Analise o consumo de combustível atual da frota e identifique oportunidades de economia." },
  { label: "Otimizar velocidade", icon: TrendingDown, prompt: "Qual seria a velocidade ideal para otimizar o consumo de combustível considerando condições normais de navegação?" },
  { label: "Calcular economia", icon: Calculator, prompt: "Calcule a economia potencial se reduzirmos a velocidade média em 2 nós durante as próximas viagens." },
  { label: "Analisar rotas", icon: Route, prompt: "Quais rotas têm maior potencial de otimização de combustível?" },
];

export const FuelAICopilot: React.FC<FuelAICopilotProps> = ({ fuelData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o Copiloto de Otimização de Combustível. Posso ajudá-lo com:\n\n- **Análise de consumo** de combustível\n- **Otimização de rotas** para economia\n- **Recomendações de velocidade** ideal\n- **Cálculos de economia** e projeções\n\nComo posso ajudar?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateLocalFallback = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("consumo") || lowerMessage.includes("análise")) {
      return `## Análise de Consumo de Combustível

Com base nos dados disponíveis:

- **Consumo Médio**: ${fuelData?.averageConsumption?.toFixed(1) || "N/A"} MT
- **Economia Total**: ${fuelData?.totalSavings?.toFixed(1) || "0"} MT
- **Tendência**: ${fuelData?.trend || "Estável"}
- **Rotas Analisadas**: ${fuelData?.routesAnalyzed || 0}

### Recomendações:
1. Mantenha velocidade entre 10-12 nós para eficiência ideal
2. Evite navegação contra correntes fortes
3. Planeje rotas considerando condições meteorológicas`;
    }
    
    if (lowerMessage.includes("velocidade") || lowerMessage.includes("otimizar")) {
      return `## Otimização de Velocidade

A velocidade ideal para máxima eficiência de combustível é:

- **Velocidade Ótima**: 10-12 nós
- **Economia Potencial**: 15-25% vs velocidade máxima

### Fórmula Aplicada:
Consumo = Distância × Taxa Base × (Velocidade/12)^2.5 × Fatores Ambientais

### Dicas:
- Reduza 2 nós da velocidade atual para economia significativa
- Considere a janela de chegada para ajustar velocidade
- Monitore consumo em tempo real para ajustes finos`;
    }
    
    if (lowerMessage.includes("economia") || lowerMessage.includes("calcul")) {
      return `## Cálculo de Economia

### Estimativa de Economia:
- **Redução de 1 nó**: ~8-12% economia
- **Redução de 2 nós**: ~15-22% economia
- **Otimização de rota**: ~5-10% adicional

### Projeção Mensal:
Se aplicarmos otimização em todas as viagens:
- Economia estimada: ${((fuelData?.averageConsumption || 100) * 0.15).toFixed(1)} MT/mês
- Valor aproximado: R$ ${(((fuelData?.averageConsumption || 100) * 0.15) * 3000).toFixed(0)}

*Valores baseados em preço médio de combustível marítimo*`;
    }
    
    if (lowerMessage.includes("rota") || lowerMessage.includes("rotas")) {
      return `## Análise de Rotas

### Rotas com Maior Potencial de Otimização:
1. **Rotas longas** (>500 nm) - maior impacto absoluto
2. **Rotas costeiras** - aproveitamento de correntes
3. **Rotas frequentes** - ganhos multiplicados

### Fatores de Otimização:
- Correntes marítimas favoráveis
- Ventos predominantes
- Zonas de economia de combustível (SECA)
- Pontos de abastecimento estratégicos

### Recomendação:
Priorize otimização das 5 rotas mais frequentes para ROI rápido.`;
    }
    
    return `## Assistente de Otimização de Combustível

Posso ajudar com diversas análises relacionadas a combustível:

1. **Análise de Consumo** - Avaliação do consumo atual
2. **Otimização de Velocidade** - Velocidade ideal para economia
3. **Cálculos de Economia** - Projeções de redução de custos
4. **Análise de Rotas** - Identificar rotas com potencial

Por favor, especifique sua pergunta para uma análise mais detalhada.`;
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = `
Dados atuais do sistema:
- Consumo Médio: ${fuelData?.averageConsumption?.toFixed(1) || "N/A"} MT
- Economia Total: ${fuelData?.totalSavings?.toFixed(1) || "0"} MT
- Tendência: ${fuelData?.trend || "N/A"}
- Rotas Analisadas: ${fuelData?.routesAnalyzed || 0}
      `.trim();

      const { data, error } = await supabase.functions.invoke("fuel-ai-copilot", {
        body: {
          messages: messages
            .filter((m) => m.id !== "welcome")
            .concat(userMessage)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          context,
        },
      });

      let responseContent: string;

      if (error || !data?.response) {
        responseContent = generateLocalFallback(textToSend);
      } else {
        responseContent = data.response;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error sending message:", error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateLocalFallback(textToSend),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          Copiloto de Combustível
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Actions */}
        <div className="p-3 border-b bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => sendMessage(action.prompt)}
                disabled={isLoading}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
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
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-[10px] opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analisando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre otimização de combustível..."
              className="min-h-[40px] max-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
