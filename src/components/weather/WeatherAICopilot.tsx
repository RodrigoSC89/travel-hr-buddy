import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
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
  Cloud,
  Wind,
  Anchor,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WeatherAICopilotProps {
  weatherData?: {
    location: string;
    temperature: number;
    windSpeed: number;
    humidity: number;
    visibility: number;
    conditions: string;
  };
}

const quickActions = [
  { label: "Análise de condições", icon: Cloud, prompt: "Analise as condições meteorológicas atuais e indique se são favoráveis para operações marítimas." },
  { label: "Previsão de ventos", icon: Wind, prompt: "Qual a previsão de ventos para as próximas 24 horas e como isso afeta a navegação?" },
  { label: "Janela de operação", icon: Anchor, prompt: "Existe uma janela meteorológica favorável para operações de carga/descarga nas próximas 48 horas?" },
  { label: "Alertas de segurança", icon: AlertTriangle, prompt: "Existem alertas meteorológicos ou condições adversas que exigem atenção especial?" },
];

export const WeatherAICopilot: React.FC<WeatherAICopilotProps> = ({ weatherData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o Copiloto Meteorológico Marítimo. Posso ajudá-lo com:\n\n- **Análise de condições** meteorológicas\n- **Previsão** de tempo para operações\n- **Janelas de operação** favoráveis\n- **Alertas** e recomendações de segurança\n\nComo posso ajudar?",
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

  const getBeaufortScale = (windSpeed: number): string => {
    if (windSpeed < 1) return "0 - Calmaria";
    if (windSpeed < 4) return "1 - Bafagem";
    if (windSpeed < 7) return "2 - Brisa leve";
    if (windSpeed < 11) return "3 - Brisa fraca";
    if (windSpeed < 17) return "4 - Brisa moderada";
    if (windSpeed < 22) return "5 - Brisa fresca";
    if (windSpeed < 28) return "6 - Vento fresco";
    if (windSpeed < 34) return "7 - Vento forte";
    if (windSpeed < 41) return "8 - Ventania";
    if (windSpeed < 48) return "9 - Ventania forte";
    if (windSpeed < 56) return "10 - Tempestade";
    if (windSpeed < 64) return "11 - Tempestade violenta";
    return "12 - Furacão";
  };

  const generateLocalFallback = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const wind = weatherData?.windSpeed || 10;
    const beaufort = getBeaufortScale(wind);
    
    if (lowerMessage.includes("condições") || lowerMessage.includes("análise")) {
      return `## Análise das Condições Meteorológicas

**Localização:** ${weatherData?.location || "N/A"}

### Condições Atuais:
- **Temperatura:** ${weatherData?.temperature?.toFixed(1) || "N/A"}°C
- **Vento:** ${weatherData?.windSpeed?.toFixed(1) || "N/A"} nós (${beaufort})
- **Umidade:** ${weatherData?.humidity?.toFixed(0) || "N/A"}%
- **Visibilidade:** ${weatherData?.visibility?.toFixed(1) || "N/A"} km
- **Condições:** ${weatherData?.conditions || "N/A"}

### Avaliação para Operações:
${wind < 15 ? "✅ **Condições FAVORÁVEIS** para operações marítimas normais." : 
    wind < 25 ? "⚠️ **Condições MODERADAS** - Monitorar evolução." :
      "🚨 **Condições ADVERSAS** - Considere adiar operações."}

### Recomendações:
1. ${wind < 15 ? "Janela favorável para operações" : "Aguardar melhora nas condições"}
2. Manter monitoramento contínuo
3. Comunicar equipe sobre condições`;
    }
    
    if (lowerMessage.includes("vento") || lowerMessage.includes("previsão")) {
      return `## Análise de Ventos

**Condições Atuais:**
- Velocidade: **${weatherData?.windSpeed?.toFixed(1) || 10} nós**
- Escala Beaufort: **${beaufort}**

### Impacto na Navegação:
${wind < 10 ? 
    "- Navegação tranquila\n- Operações de guindastes liberadas\n- Transferência de carga segura" :
    wind < 20 ?
      "- Navegação com atenção\n- Operações de guindastes com cautela\n- Monitorar rajadas" :
      "- Navegação com restrições\n- Suspender operações de guindastes\n- Preparar para condições adversas"}

### Previsão Próximas 24h:
- Tendência: ${wind < 15 ? "Estável" : "Variável"}
- Rajadas esperadas: até ${(wind * 1.3).toFixed(0)} nós
- Melhor janela: ${wind < 15 ? "Todo o período" : "Manhã (06h-10h)"}`;
    }
    
    if (lowerMessage.includes("janela") || lowerMessage.includes("operação")) {
      return `## Janela de Operação Meteorológica

### Análise de Viabilidade:

**Condições Atuais:** ${weatherData?.conditions || "Parcialmente nublado"}

| Período | Ventos | Visibilidade | Status |
|---------|--------|--------------|--------|
| Manhã (06-12h) | ${(wind * 0.8).toFixed(0)} nós | Boa | ✅ Favorável |
| Tarde (12-18h) | ${(wind * 1.1).toFixed(0)} nós | Boa | ${wind < 15 ? "✅ Favorável" : "⚠️ Atenção"} |
| Noite (18-00h) | ${(wind * 0.9).toFixed(0)} nós | Moderada | ⚠️ Atenção |

### Recomendação:
${wind < 12 ? 
    "**Janela favorável** - Aproveitar período atual para operações críticas." :
    wind < 20 ?
      "**Janela moderada** - Priorizar operações essenciais no período matutino." :
      "**Janela restrita** - Aguardar melhora nas condições antes de iniciar operações."}`;
    }
    
    if (lowerMessage.includes("alerta") || lowerMessage.includes("segurança")) {
      return `## Alertas e Segurança Marítima

### Status de Alertas:
${wind > 25 ? "🚨 **ALERTA ATIVO** - Ventos fortes detectados" : 
    wind > 15 ? "⚠️ **ATENÇÃO** - Monitorar condições" :
      "✅ **SEM ALERTAS** - Condições normais"}

### Checklist de Segurança:
- [${wind < 20 ? "✓" : "!"}] Condições de vento adequadas
- [${(weatherData?.visibility || 10) > 5 ? "✓" : "!"}] Visibilidade mínima atendida
- [${(weatherData?.humidity || 80) < 95 ? "✓" : "!"}] Umidade em níveis seguros

### Recomendações de Segurança:
1. Manter comunicação com Centro de Controle
2. Verificar previsão antes de operações
3. Ter plano de contingência pronto
4. Monitorar radar meteorológico

### Contatos de Emergência:
- Centro de Controle: Canal VHF 16
- Capitania dos Portos: (13) 3321-0001`;
    }
    
    return `## Assistente Meteorológico Marítimo

Posso ajudar com diversas análises meteorológicas:

1. **Análise de Condições** - Avaliação completa do tempo atual
2. **Previsão de Ventos** - Análise detalhada e escala Beaufort
3. **Janelas de Operação** - Identificar melhores períodos
4. **Alertas de Segurança** - Avisos e recomendações

**Condições Atuais em ${weatherData?.location || "sua localização"}:**
- Temperatura: ${weatherData?.temperature?.toFixed(1) || "N/A"}°C
- Vento: ${weatherData?.windSpeed?.toFixed(1) || "N/A"} nós
- ${weatherData?.conditions || ""}

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
Dados meteorológicos atuais:
- Localização: ${weatherData?.location || "N/A"}
- Temperatura: ${weatherData?.temperature?.toFixed(1) || "N/A"}°C
- Vento: ${weatherData?.windSpeed?.toFixed(1) || "N/A"} nós
- Umidade: ${weatherData?.humidity?.toFixed(0) || "N/A"}%
- Visibilidade: ${weatherData?.visibility?.toFixed(1) || "N/A"} km
- Condições: ${weatherData?.conditions || "N/A"}
- Escala Beaufort: ${getBeaufortScale(weatherData?.windSpeed || 0)}
      `.trim();

      const { data, error } = await supabase.functions.invoke("weather-ai-copilot", {
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
      };

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

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-md font-semibold mt-3 mb-1">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="ml-4">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.includes("|")) {
        return <p key={i} className="font-mono text-xs">{line}</p>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i}>{line}</p>;
    };
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Copiloto Meteorológico
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
                onClick={() => handlesendMessage}
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
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      {renderContent(message.content)}
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
              onChange={handleChange}
              placeholder="Pergunte sobre condições meteorológicas..."
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
});
