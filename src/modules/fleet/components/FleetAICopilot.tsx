import { useEffect, useRef, useState, useCallback } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Send, 
  Loader2, 
  Sparkles, 
  Bot, 
  User,
  Wrench,
  Route,
  Fuel,
  BarChart3,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FleetAICopilotProps {
  vessels: unknown[];
  onInsightGenerated?: (insight: unknown: unknown: unknown) => void;
  className?: string;
}

const quickActions = [
  { id: "maintenance", icon: Wrench, label: "Prever Manutenção", action: "maintenance_prediction" },
  { id: "routes", icon: Route, label: "Otimizar Rotas", action: "route_optimization" },
  { id: "fuel", icon: Fuel, label: "Análise de Combustível", action: "fuel_analysis" },
  { id: "insights", icon: BarChart3, label: "Insights da Frota", action: "fleet_insights" },
];

export const FleetAICopilot: React.FC<FleetAICopilotProps> = ({
  vessels,
  onInsightGenerated,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Copilot de Gestão de Frota. Posso ajudar com análises preditivas, otimização de rotas, gestão de combustível e muito mais. Como posso ajudar?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (query: string, action: string = "chat") => {
    if (!query.trim() && action === "chat") return;

    const userMessage: Message = {
      role: "user",
      content: query || getActionLabel(action),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const fleetSummary = {
        total_vessels: vessels.length,
        active: vessels.filter(v => v.status === "active" || v.status === "operational").length,
        maintenance: vessels.filter(v => v.status === "maintenance").length,
        vessels: vessels.slice(0, 10).map(v => ({
          id: v.id,
          name: v.name,
          status: v.status,
          type: v.vessel_type || v.type,
          location: v.current_location || v.location,
          fuel_level: v.fuel_consumption || 75,
          last_maintenance: v.last_maintenance
        }))
      };

      const { data, error } = await supabase.functions.invoke("fleet-ai-copilot", {
        body: {
          action,
          vessels: fleetSummary.vessels,
          query,
          context: { fleet_summary: fleetSummary }
        }
      });

      if (error) throw error;

      let responseContent = "";
      
      if (action === "chat") {
        responseContent = data.raw || data.data?.raw || "Não consegui processar sua solicitação.";
      } else {
        responseContent = formatActionResponse(action, data.data);
        if (onInsightGenerated && data.data) {
          onInsightGenerated({ action, data: data.data });
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Fleet AI error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      maintenance_prediction: "Analisar previsões de manutenção",
      route_optimization: "Otimizar rotas da frota",
      fuel_analysis: "Analisar consumo de combustível",
      fleet_insights: "Gerar insights estratégicos"
    };
    return labels[action] || action;
  };

  const formatActionResponse = (action: string, data: unknown): string => {
    if (!data) return "Análise não disponível.";

    switch (action) {
    case "maintenance_prediction":
      if (data.predictions?.length > 0) {
        const critical = data.predictions.filter((p: unknown) => p.priority === "critical" || p.priority === "high").length;
        return `📊 **Análise de Manutenção Preditiva**\n\n${data.summary || ""}\n\n` +
            `🔴 ${critical} embarcações requerem atenção prioritária\n` +
            `📋 ${data.predictions.length} previsões geradas\n\n` +
            data.predictions.slice(0, 3).map((p: unknown) => 
              `• **${p.vessel_name}**: ${p.priority.toUpperCase()} - ${p.reasoning || "Verificar componentes"}`
            ).join("\n") +
            (data.alerts?.length > 0 ? `\n\n⚠️ Alertas: ${data.alerts.join(", ")}` : "");
      }
      return "Análise de manutenção concluída. Nenhuma ação urgente necessária.";

    case "route_optimization":
      if (data.optimizations?.length > 0 || data.total_savings) {
        return "🗺️ **Otimização de Rotas**\n\n" +
            `💰 Economia potencial: R$ ${data.total_savings?.cost?.toLocaleString() || "N/A"}\n` +
            `⛽ Redução de combustível: ${data.total_savings?.fuel_percent || 0}%\n` +
            `⏱️ Tempo economizado: ${data.total_savings?.time_hours || 0}h\n\n` +
            (data.optimizations?.slice(0, 3).map((o: unknown) => 
              `• **${o.vessel_name}**: ${o.current_route} → ${o.optimized_route}`
            ).join("\n") || "Rotas já otimizadas.");
      }
      return "Rotas analisadas. Sugestões de otimização disponíveis.";

    case "fuel_analysis":
      if (data.analysis?.length > 0 || data.fleet_summary) {
        return "⛽ **Análise de Combustível**\n\n" +
            `📊 Eficiência média: ${data.fleet_summary?.average_efficiency || 85}%\n` +
            `🔋 Consumo diário total: ${data.fleet_summary?.total_daily_consumption || "N/A"} L\n` +
            `⚠️ Embarcações necessitando reabastecimento: ${data.fleet_summary?.vessels_needing_refuel || 0}\n\n` +
            (data.analysis?.slice(0, 3).map((a: unknown) => 
              `• **${a.vessel_name}**: ${a.current_level_percent || 0}% - ${a.recommendations?.[0] || "Nível adequado"}`
            ).join("\n") || "");
      }
      return "Análise de combustível concluída.";

    case "fleet_insights":
      if (data.insights?.length > 0 || data.kpis) {
        return "📈 **Insights Estratégicos da Frota**\n\n" +
            `🎯 Score de Saúde: ${data.kpis?.fleet_health_score || 85}/100\n` +
            `⚡ Eficiência Operacional: ${data.kpis?.operational_efficiency || 90}%\n` +
            `🔧 Compliance de Manutenção: ${data.kpis?.maintenance_compliance || 95}%\n\n` +
            "**Top Insights:**\n" +
            (data.insights?.slice(0, 3).map((i: unknown) => 
              `• [${i.type?.toUpperCase()}] ${i.title}: ${i.description}`
            ).join("\n") || data.recommendations?.join("\n• ") || "");
      }
      return "Insights gerados com sucesso.";

    default:
      return JSON.stringify(data, null, 2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50" : "h-[500px]",
      className
    )}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Fleet AI Copilot
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </CardTitle>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSetIsExpanded}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handlesendMessage}
              disabled={isLoading}
              className="shrink-0"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Analisando...</span>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={handleChange}
            placeholder="Pergunte sobre a frota..."
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
