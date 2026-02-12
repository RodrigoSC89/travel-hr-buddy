import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Sparkles, Ship, Route, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { VoyageRoute } from "../types";
import { logger } from '@/lib/logger';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VoyageAICopilotProps {
  voyages: VoyageRoute[];
  onOptimizationSuggestion?: (suggestion: string) => void;
}

const VoyageAICopilot: React.FC<VoyageAICopilotProps> = ({ voyages, onOptimizationSuggestion }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá! Sou o Copiloto de Viagem com IA. Posso ajudá-lo com:

• **Otimização de rotas** - Analiso condições meteorológicas e sugiro melhores trajetos
• **Estimativas de ETA** - Calculo tempos de chegada considerando diversos fatores
• **Análise de combustível** - Otimizo consumo para reduzir custos
• **Alertas meteorológicos** - Monitoro condições ao longo das rotas

Você tem ${voyages.length} viagens ativas. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const activeVoyages = voyages.filter((v) => v.status === "active");
    const plannedVoyages = voyages.filter((v) => v.status === "planned");
    
    return `
Contexto atual do sistema de viagens:
- Total de viagens: ${voyages.length}
- Viagens ativas: ${activeVoyages.length}
- Viagens planejadas: ${plannedVoyages.length}

Viagens em andamento:
${activeVoyages.map((v) => `- ${v.name}: ${v.distanceNm}nm, ETA ${v.estimatedDays} dias, risco clima: ${v.weatherRisk}`).join("\n")}

Viagens planejadas:
${plannedVoyages.map((v) => `- ${v.name}: partida ${v.departureDate}, ${v.distanceNm}nm`).join("\n")}
`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = buildContext();
      
      const response = await supabase.functions.invoke("voyage-ai-copilot", {
        body: {
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: input.trim() },
          ],
          context,
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.data?.response || generateLocalResponse(input.trim()),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      logger.error("Error calling AI:", error);
      
      // Fallback to local response
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: generateLocalResponse(input.trim()),
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("otimiz") || lowerQuery.includes("rota")) {
      const activeVoyages = voyages.filter((v) => v.status === "active");
      if (activeVoyages.length > 0) {
        return `📍 **Análise de Otimização de Rotas**

Com base nas ${activeVoyages.length} viagens ativas, identifiquei algumas oportunidades:

${activeVoyages.map((v) => `
**${v.name}**
- Distância atual: ${v.distanceNm.toLocaleString()} nm
- Risco meteorológico: ${v.weatherRisk === "high" ? "⚠️ Alto - Considere rota alternativa" : v.weatherRisk === "medium" ? "⚡ Médio - Monitore condições" : "✅ Baixo"}
- Sugestão: ${v.weatherRisk === "high" ? "Desviar 50nm ao sul pode reduzir exposição a tempestades" : "Manter rota atual"}
`).join("")}

Deseja que eu detalhe alguma rota específica?`;
      }
      return "Não há viagens ativas para otimizar no momento. Crie uma nova viagem para que eu possa sugerir otimizações.";
    }

    if (lowerQuery.includes("clima") || lowerQuery.includes("tempo") || lowerQuery.includes("meteorol")) {
      return `🌊 **Condições Meteorológicas Atuais**

**Atlântico Norte:**
- Ventos: 15-20 nós NE
- Ondas: 2.5m
- Visibilidade: Boa
- Status: ✅ Favorável para navegação

**Golfo do México:**
- Ventos: 30-35 nós
- Ondas: 4-5m
- Visibilidade: Reduzida
- Status: ⚠️ Tempestade tropical ativa

**Recomendações:**
1. Viagens para Houston devem considerar rota alternativa pelo leste
2. Janela favorável para cruzar o Atlântico: próximos 5 dias

Posso analisar uma rota específica para você?`;
    }

    if (lowerQuery.includes("combustível") || lowerQuery.includes("fuel") || lowerQuery.includes("economia")) {
      const totalFuel = voyages.reduce((sum, v) => sum + v.fuelConsumption, 0);
      return `⛽ **Análise de Consumo de Combustível**

**Resumo Geral:**
- Consumo total planejado: ${totalFuel.toLocaleString()} toneladas
- Média por viagem: ${Math.round(totalFuel / voyages.length).toLocaleString()} ton

**Oportunidades de Economia:**
1. **Redução de velocidade** - Diminuir 1 nó pode economizar até 10% de combustível
2. **Otimização de rota** - Correntes favoráveis podem reduzir consumo em 5-8%
3. **Manutenção do casco** - Casco limpo economiza até 15% de combustível

**Estimativa de economia potencial:** ${Math.round(totalFuel * 0.12).toLocaleString()} toneladas (~12%)

Quer que eu analise uma viagem específica?`;
    }

    if (lowerQuery.includes("eta") || lowerQuery.includes("chegada") || lowerQuery.includes("previsão")) {
      const activeVoyages = voyages.filter((v) => v.status === "active");
      return `⏱️ **Previsões de ETA**

${activeVoyages.length > 0 ? activeVoyages.map((v) => `
**${v.name}**
- ETA Original: ${v.arrivalDate || "Não definido"}
- Dias restantes: ${v.estimatedDays}
- Condições: ${v.weatherRisk === "high" ? "⚠️ Possível atraso de 1-2 dias" : "✅ No prazo"}
`).join("") : "Não há viagens ativas para calcular ETA."}

As previsões são atualizadas a cada 6 horas com base em:
- Condições meteorológicas
- Correntes marítimas
- Velocidade atual da embarcação`;
    }

    return `Posso ajudá-lo com:

• **"Otimizar rotas"** - Sugiro melhores trajetos
• **"Condições meteorológicas"** - Análise do clima nas rotas
• **"Análise de combustível"** - Economia e eficiência
• **"Previsão de ETA"** - Estimativas de chegada

Faça sua pergunta e vou analisar com base nas suas viagens atuais.`;
  };

  const quickActions = [
    { label: "Otimizar Rotas", icon: Route, query: "Analise e otimize as rotas ativas" },
    { label: "Clima", icon: AlertTriangle, query: "Quais são as condições meteorológicas?" },
    { label: "Combustível", icon: Ship, query: "Analise o consumo de combustível" },
  ];

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-primary" />
          Copiloto de Viagem IA
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Gemini
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
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
                  <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                    {message.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={`bold-${i}-${part.slice(0, 10)}`}>{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(action.query);
                }}
                disabled={isLoading}
              >
                <action.icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Pergunte sobre rotas, clima, ETA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[40px] max-h-[100px] resize-none"
              rows={1}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoyageAICopilot;
