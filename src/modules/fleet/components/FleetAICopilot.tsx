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
import { logger } from '@/lib/logger';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface VesselData {
  id: string;
  name: string;
  status: string;
  vessel_type?: string;
  type?: string;
  current_location?: string;
  location?: string;
  fuel_consumption?: number;
  last_maintenance?: string;
}

interface FleetAICopilotProps {
  vessels: VesselData[];
  onInsightGenerated?: (insight: { action: string; data: Record<string, unknown> }) => void;
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
      logger.error("Fleet AI error:", error);
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

  const formatActionResponse = (action: string, data: Record<string, unknown> | null): string => {
    if (!data) return "Análise não disponível.";

    const predictions = data.predictions as Array<Record<string, unknown>> | undefined;
    const optimizations = data.optimizations as Array<Record<string, unknown>> | undefined;
    const totalSavings = data.total_savings as Record<string, unknown> | undefined;
    const analysis = data.analysis as Array<Record<string, unknown>> | undefined;
    const fleetSummary = data.fleet_summary as Record<string, unknown> | undefined;
    const insights = data.insights as Array<Record<string, unknown>> | undefined;
    const kpis = data.kpis as Record<string, unknown> | undefined;
    const recommendations = data.recommendations as string[] | undefined;

    switch (action) {
      case "maintenance_prediction":
        if (predictions && predictions.length > 0) {
          const critical = predictions.filter((p) => p.priority === "critical" || p.priority === "high").length;
          return `📊 **Análise de Manutenção Preditiva**\n\n${data.summary || ""}\n\n` +
            `🔴 ${critical} embarcações requerem atenção prioritária\n` +
            `📋 ${predictions.length} previsões geradas\n\n` +
            predictions.slice(0, 3).map((p) => 
              `• **${p.vessel_name}**: ${String(p.priority).toUpperCase()} - ${p.reasoning || "Verificar componentes"}`
            ).join("\n") +
            ((data.alerts as string[] | undefined)?.length ? `\n\n⚠️ Alertas: ${(data.alerts as string[]).join(", ")}` : "");
        }
        return "Análise de manutenção concluída. Nenhuma ação urgente necessária.";

      case "route_optimization":
        if ((optimizations && optimizations.length > 0) || totalSavings) {
          return `🗺️ **Otimização de Rotas**\n\n` +
            `💰 Economia potencial: R$ ${(totalSavings?.cost as number)?.toLocaleString() || "N/A"}\n` +
            `⛽ Redução de combustível: ${totalSavings?.fuel_percent || 0}%\n` +
            `⏱️ Tempo economizado: ${totalSavings?.time_hours || 0}h\n\n` +
            (optimizations?.slice(0, 3).map((o) => 
              `• **${o.vessel_name}**: ${o.current_route} → ${o.optimized_route}`
            ).join("\n") || "Rotas já otimizadas.");
        }
        return "Rotas analisadas. Sugestões de otimização disponíveis.";

      case "fuel_analysis":
        if ((analysis && analysis.length > 0) || fleetSummary) {
          return `⛽ **Análise de Combustível**\n\n` +
            `📊 Eficiência média: ${fleetSummary?.average_efficiency || 85}%\n` +
            `🔋 Consumo diário total: ${fleetSummary?.total_daily_consumption || "N/A"} L\n` +
            `⚠️ Embarcações necessitando reabastecimento: ${fleetSummary?.vessels_needing_refuel || 0}\n\n` +
            (analysis?.slice(0, 3).map((a) => 
              `• **${a.vessel_name}**: ${a.current_level_percent || 0}% - ${(a.recommendations as string[] | undefined)?.[0] || "Nível adequado"}`
            ).join("\n") || "");
        }
        return "Análise de combustível concluída.";

      case "fleet_insights":
        if ((insights && insights.length > 0) || kpis) {
          return `📈 **Insights Estratégicos da Frota**\n\n` +
            `🎯 Score de Saúde: ${kpis?.fleet_health_score || 85}/100\n` +
            `⚡ Eficiência Operacional: ${kpis?.operational_efficiency || 90}%\n` +
            `🔧 Compliance de Manutenção: ${kpis?.maintenance_compliance || 95}%\n\n` +
            `**Top Insights:**\n` +
            (insights?.slice(0, 3).map((i) => 
              `• [${String(i.type || '').toUpperCase()}] ${i.title}: ${i.description}`
            ).join("\n") || recommendations?.join("\n• ") || "");
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
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Minimizar copilot" : "Expandir copilot"}
          title={isExpanded ? "Minimizar" : "Expandir"}
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
              onClick={() => sendMessage("", action.action)}
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
              {messages.map((message, msgIdx) => (
                <motion.div
                  key={`fleet-msg-${msgIdx}-${message.role}`}
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
            onChange={(e) => setInput(e.target.value)}
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
