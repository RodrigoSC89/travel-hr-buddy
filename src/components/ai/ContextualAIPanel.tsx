/**
 * ContextualAIPanel Component
 * PATCH 1000 - Painel lateral fixo de IA contextual
 * 
 * Analisa a tela atual e sugere ações proativas
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Send,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Zap,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOperationalContext } from "@/hooks/useOperationalContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  title: string;
  description: string;
  action: "navigate" | "analyze" | "report" | "info";
  route?: string;
  icon?: string;
}

interface Insight {
  type: "info" | "warning" | "success";
  message: string;
}

interface Analysis {
  summary: string;
  insights: Insight[];
  recommendations: string[];
  metrics?: Record<string, string | number>;
}

interface ContextualAIPanelProps {
  defaultExpanded?: boolean;
  className?: string;
}

export function ContextualAIPanel({ defaultExpanded = true, className }: ContextualAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  
  const navigate = useNavigate();
  const { context, isLoading: contextLoading, refreshContext } = useOperationalContext();

  // Fetch contextual suggestions
  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("universal-ai-search", {
        body: {
          type: "suggest",
          context,
          currentRoute: context.currentRoute,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Limite de requisições atingido.");
        }
        return;
      }

      setSuggestions(data.suggestions || []);
    } catch {
      // AI suggestions are non-critical - silent fail
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Fetch deep analysis
  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("universal-ai-search", {
        body: {
          type: "analyze",
          context,
          currentRoute: context.currentRoute,
        },
      });

      if (error) {
        // Analysis failure is non-critical
        return;
      }

      setAnalysis(data.analysis || null);
    } catch {
      // AI analysis is non-critical - silent fail
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Auto-refresh suggestions when route changes
  useEffect(() => {
    if (!isMinimized && isExpanded) {
      fetchSuggestions();
    }
  }, [context.currentRoute, isMinimized, isExpanded, fetchSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.route) {
      navigate(suggestion.route);
    }
    if (suggestion.action === "analyze") {
      fetchAnalysis();
    }
  };

  // Handle chat send
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nauti-command", {
        body: {
          type: "chat",
          messages: [...chatMessages, userMessage],
          context,
        },
      });

      if (error) throw error;

      const assistantMessage = { 
        role: "assistant", 
        content: data.response || "Sem resposta" 
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erro ao processar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <Brain className="h-6 w-6" />
          {context.activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
              {context.activeAlerts}
            </span>
          )}
        </Button>
      </motion.div>
    );
  }

  // Collapsed sidebar
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        className={cn(
          "fixed right-0 top-16 bottom-0 bg-background border-l shadow-sm z-40 flex flex-col items-center py-4 gap-4",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Brain className="h-5 w-5" />
          {context.activeAlerts > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">
              {context.activeAlerts}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMinimized(true)}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  // Expanded panel
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className={cn(
        "fixed right-0 top-16 bottom-0 bg-background border-l shadow-lg z-40 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">Assistente IA</span>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Contextual
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={fetchSuggestions} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Info */}
      <div className="px-4 py-2 bg-muted/50 border-b shrink-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tela:</span>
          <Badge variant="outline">{context.routeLabel}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-muted-foreground">Status:</span>
          <Badge 
            variant={context.systemHealth === "healthy" ? "default" : 
                    context.systemHealth === "degraded" ? "secondary" : "destructive"}
          >
            {context.systemHealth === "healthy" ? "Saudável" : 
             context.systemHealth === "degraded" ? "Degradado" : "Crítico"}
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Loading */}
          {isLoading && suggestions.length === 0 && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                Sugestões
              </h4>
              {suggestions.map((suggestion, idx) => (
                <motion.div
                  key={`suggestion-${suggestion.title}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Analysis */}
          {analysis && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Análise
              </h4>
              
              <Card>
                <CardContent className="p-3 space-y-3">
                  <p className="text-sm">{analysis.summary}</p>
                  
                  {analysis.insights?.map((insight, idx) => (
                    <div key={`insight-${insight.type}-${idx}`} className="flex items-start gap-2">
                      {insight.type === "success" && <CheckCircle className="h-4 w-4 text-success shrink-0" />}
                      {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                      {insight.type === "info" && <Info className="h-4 w-4 text-info shrink-0" />}
                      <p className="text-xs">{insight.message}</p>
                    </div>
                  ))}

                  {analysis.recommendations?.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Recomendações:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {analysis.recommendations.map((rec) => (
                          <li key={rec}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Chat */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Chat Rápido
            </h4>
            
            <div className="space-y-2">
              {chatMessages.slice(-4).map((msg, idx) => (
                <div
                  key={`ctx-msg-${idx}-${msg.role}`}
                  className={cn(
                    "text-xs p-2 rounded-lg",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground ml-4" 
                      : "bg-muted mr-4"
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte algo..."
                className="text-sm min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
              />
            </div>
            <Button 
              size="sm" 
              className="w-full"
              onClick={handleChatSend}
              disabled={isLoading || !chatInput.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>

          {/* Deep Analysis Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={fetchAnalysis}
            disabled={isLoading}
          >
            <Brain className="h-4 w-4 mr-2" />
            Análise Profunda
          </Button>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t shrink-0 text-xs text-center text-muted-foreground">
        <span className="flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" />
          Powered by Lovable AI
        </span>
      </div>
    </motion.div>
  );
}

export default ContextualAIPanel;
