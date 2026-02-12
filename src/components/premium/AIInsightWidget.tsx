/**
 * AI Insight Widget - Premium Component
 * Widget de insights IA reutilizável para todos os módulos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, Lightbulb, TrendingUp, TrendingDown, 
  AlertTriangle, Target, Zap, ArrowRight, Send, RefreshCw,
  ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown,
  Copy, Share, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "warning" | "opportunity" | "achievement";
  title: string;
  description: string;
  impact?: string;
  confidence: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  details?: string;
}

interface AIInsightWidgetProps {
  title?: string;
  description?: string;
  insights: AIInsight[];
  showChat?: boolean;
  onRefresh?: () => void;
  onAsk?: (question: string) => Promise<string>;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
}

const typeConfig = {
  prediction: { 
    icon: TrendingUp, 
    color: "text-blue-500", 
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Previsão"
  },
  recommendation: { 
    icon: Lightbulb, 
    color: "text-emerald-500", 
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Recomendação"
  },
  warning: { 
    icon: AlertTriangle, 
    color: "text-warning", 
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Alerta"
  },
  opportunity: { 
    icon: Zap, 
    color: "text-purple-500", 
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    label: "Oportunidade"
  },
  achievement: { 
    icon: Target, 
    color: "text-success", 
    bg: "bg-success/10",
    border: "border-success/20",
    label: "Conquista"
  }
};

export function AIInsightWidget({
  title = "Insights IA",
  description,
  insights,
  showChat = true,
  onRefresh,
  onAsk,
  isLoading = false,
  className = "",
  compact = false
}: AIInsightWidgetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFeedback = (insightId: string, positive: boolean) => {
    toast.success(positive ? "Obrigado pelo feedback positivo!" : "Feedback registrado. Melhoraremos as sugestões.");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para área de transferência");
  };

  const handleAsk = async () => {
    if (!chatMessage.trim() || !onAsk) return;

    const question = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: question }]);
    setIsAsking(true);

    try {
      const response = await onAsk(question);
      setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast.error("Erro ao processar pergunta");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-500/5 to-primary/5 border-purple-500/20 ${className}`}>
      <CardHeader className={compact ? "pb-2 space-y-1" : "pb-3"}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-primary">
              <Brain className="h-4 w-4 text-white" />
            </div>
            {title}
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              GPT-4
            </Badge>
          </CardTitle>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Insights List */}
        <ScrollArea className={compact ? "h-[200px]" : "h-[280px]"}>
          <div className="space-y-3 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Analisando dados...</span>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Nenhum insight disponível</p>
                <p className="text-sm">A IA está analisando os dados</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {insights.map((insight, idx) => {
                  const config = typeConfig[insight.type];
                  const Icon = config.icon;
                  const isExpanded = expandedId === insight.id;

                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg border ${config.border} ${config.bg} transition-colors`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${config.bg}`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{insight.title}</span>
                                <Badge variant="outline" className={`text-xs ${config.color}`}>
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {insight.description}
                              </p>
                            </div>
                            
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {insight.confidence}%
                            </Badge>
                          </div>

                          {/* Impact */}
                          {insight.impact && (
                            <div className={`mt-2 text-xs font-medium ${config.color}`}>
                              Impacto: {insight.impact}
                            </div>
                          )}

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {isExpanded && insight.details && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 pt-3 border-t text-sm text-muted-foreground"
                              >
                                {insight.details}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleFeedback(insight.id, true)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleFeedback(insight.id, false)}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopy(insight.description)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {insight.details && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleToggleExpand(insight.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {insight.action && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={insight.action.onClick}
                              >
                                {insight.action.label}
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* AI Chat */}
        {showChat && onAsk && (
          <div className="border-t pt-4">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <ScrollArea className="h-[120px] mb-3">
                <div className="space-y-2">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={`chat-${i}-${msg.role}`}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-2 rounded-lg text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-2 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre os dados..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAsk()}
                disabled={isAsking}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleAsk}
                disabled={isAsking || !chatMessage.trim()}
                className="bg-gradient-to-r from-purple-500 to-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIInsightWidget;
