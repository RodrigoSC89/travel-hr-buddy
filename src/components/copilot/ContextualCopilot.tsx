/**
 * Contextual Copilot - AI Assistant integrated into all modules
 * Provides context-aware suggestions, actions, and feedback
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { logger } from '@/lib/logger';

interface CopilotSuggestion {
  id: string;
  type: "action" | "insight" | "warning" | "tip";
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ContextualCopilotProps {
  moduleContext?: string;
  customSuggestions?: CopilotSuggestion[];
  onClose?: () => void;
}

const MODULE_CONTEXTS: Record<string, {
  name: string;
  icon: string;
  systemPrompt: string;
  defaultSuggestions: CopilotSuggestion[];
}> = {
  "/dashboard": {
    name: "Dashboard",
    icon: "📊",
    systemPrompt: "Você está no Dashboard principal. Ajude o usuário a entender métricas, KPIs e sugerir otimizações.",
    defaultSuggestions: [
      { id: "d1", type: "insight", title: "Resumo do Dia", description: "Gere um resumo das principais métricas de hoje" },
      { id: "d2", type: "action", title: "Comparar Períodos", description: "Compare performance com período anterior", actionLabel: "Comparar" }
    ]
  },
  "/esg-dashboard": {
    name: "ESG",
    icon: "🌱",
    systemPrompt: "Você está no módulo ESG. Ajude com métricas ambientais, sociais e de governança.",
    defaultSuggestions: [
      { id: "e1", type: "action", title: "Sugestões de Mitigação", description: "Gere recomendações para melhorar índices ESG", actionLabel: "Gerar" },
      { id: "e2", type: "warning", title: "Alertas de Compliance", description: "Verifique pendências de conformidade ambiental" }
    ]
  },
  "/security-audit": {
    name: "Segurança",
    icon: "🔒",
    systemPrompt: "Você está na Auditoria de Segurança. Ajude a identificar vulnerabilidades e recomendar correções.",
    defaultSuggestions: [
      { id: "s1", type: "action", title: "Plano de Ação", description: "Gere plano de correção para findings de segurança", actionLabel: "Gerar Plano" },
      { id: "s2", type: "tip", title: "Melhores Práticas", description: "Veja recomendações de segurança OWASP" }
    ]
  },
  "/crew-management": {
    name: "Tripulação",
    icon: "👥",
    systemPrompt: "Você está no módulo de Gestão de Tripulação. Ajude com escalas, certificações e bem-estar da equipe.",
    defaultSuggestions: [
      { id: "c1", type: "warning", title: "Certificados Vencendo", description: "3 tripulantes com certificados próximos ao vencimento" },
      { id: "c2", type: "insight", title: "Análise de Fadiga", description: "Verifique níveis de fadiga da tripulação" }
    ]
  },
  "/telemetria-command": {
    name: "Telemetria",
    icon: "📡",
    systemPrompt: "Você está no módulo de Telemetria. Ajude a analisar dados de sensores e identificar anomalias.",
    defaultSuggestions: [
      { id: "t1", type: "insight", title: "Análise Causal", description: "Identifique causas raiz de anomalias recentes" },
      { id: "t2", type: "action", title: "Previsão de Falhas", description: "Execute análise preditiva de equipamentos", actionLabel: "Analisar" }
    ]
  }
};

export function ContextualCopilot({ 
  moduleContext: propContext, 
  customSuggestions = [],
  onClose 
}: ContextualCopilotProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPath = location.pathname;
  const moduleContext = propContext || currentPath;
  const context = MODULE_CONTEXTS[moduleContext] || {
    name: "Nautilus",
    icon: "🚢",
    systemPrompt: "Você é o Copilot do Nauti One. Ajude o usuário com qualquer dúvida sobre o sistema.",
    defaultSuggestions: []
  };

  useEffect(() => {
    // Merge default and custom suggestions
    const allSuggestions = [...context.defaultSuggestions, ...customSuggestions];
    setSuggestions(allSuggestions);
  }, [moduleContext, customSuggestions, context.defaultSuggestions]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: CopilotMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "copilot",
          context: {
            module: context.name,
            path: currentPath,
            history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
          },
          messages: [
            { role: "system", content: context.systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: input }
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: CopilotMessage = {
        id: `msg_${Date.now()}_resp`,
        role: "assistant",
        content: data?.response || data?.content || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for new suggestions in response
      if (data?.suggestions) {
        setSuggestions(prev => [...prev, ...data.suggestions]);
      }
    } catch (error) {
      logger.error("Copilot error:", error);
      toast.error("Erro ao processar mensagem");
      
      // Fallback response
      const fallbackMessage: CopilotMessage = {
        id: `msg_${Date.now()}_fallback`,
        role: "assistant",
        content: `Entendi sua pergunta sobre "${input}". Posso ajudar com:\n\n• Análise de dados e métricas\n• Geração de relatórios\n• Sugestões de otimização\n• Identificação de problemas\n\nComo posso ajudar especificamente?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, context, currentPath]);

  const handleSuggestionClick = (suggestion: CopilotSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    } else {
      setInput(`${suggestion.title}: ${suggestion.description}`);
    }
  };

  const getSuggestionIcon = (type: CopilotSuggestion["type"]) => {
    switch (type) {
      case "action": return <Zap className="h-4 w-4 text-primary" />;
      case "insight": return <Lightbulb className="h-4 w-4 text-warning" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "tip": return <Target className="h-4 w-4 text-info" />;
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-20 right-6 z-40"
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setIsMinimized(false)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed bottom-20 right-6 z-40 w-96"
    >
      <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
        {/* Header */}
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{context.icon}</span>
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Bot className="h-4 w-4 text-primary" />
                  Copilot
                </CardTitle>
                <p className="text-xs text-muted-foreground">{context.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Recolher copilot" : "Expandir copilot"}
                title={isExpanded ? "Recolher" : "Expandir"}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setIsMinimized(true)}
                aria-label="Fechar copilot"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="p-3 pt-0">
                {/* Suggestions */}
                {suggestions.length > 0 && messages.length === 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Sugestões
                    </p>
                    <div className="space-y-1.5">
                      {suggestions.slice(0, 3).map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-start gap-2">
                            {getSuggestionIcon(suggestion.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{suggestion.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.description}</p>
                            </div>
                            {suggestion.actionLabel && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {suggestion.actionLabel}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                  <ScrollArea className="h-48 mb-3 pr-2">
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg p-2 text-sm ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte algo..."
                    className="min-h-[40px] max-h-[80px] resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="shrink-0"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    aria-label="Enviar mensagem"
                    title="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Hook for using Copilot in modules
export function useCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [customSuggestions, setCustomSuggestions] = useState<CopilotSuggestion[]>([]);

  const openCopilot = (suggestions?: CopilotSuggestion[]) => {
    if (suggestions) {
      setCustomSuggestions(suggestions);
    }
    setIsOpen(true);
  };

  const closeCopilot = () => {
    setIsOpen(false);
    setCustomSuggestions([]);
  };

  const addSuggestion = (suggestion: CopilotSuggestion) => {
    setCustomSuggestions(prev => [...prev, suggestion]);
  };

  return {
    isOpen,
    openCopilot,
    closeCopilot,
    addSuggestion,
    customSuggestions,
    CopilotComponent: isOpen ? (
      <ContextualCopilot 
        customSuggestions={customSuggestions} 
        onClose={closeCopilot} 
      />
    ) : null
  };
}
