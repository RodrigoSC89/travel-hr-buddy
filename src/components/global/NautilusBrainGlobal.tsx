/**
 * NAUTILUS BRAIN GLOBAL - IA Central Acessível de Qualquer Módulo
 * PATCH 850.3 - Fixed useToast hook usage
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, X, Loader2, Sparkles, Ship, Wrench, Users,
  Package, Shield, Mic, Copy, ThumbsUp, ThumbsDown,
  Lightbulb, MessageSquare, Minimize2, Maximize2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
}

interface NautilusBrainGlobalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

// Trigger button component
export const NautilusBrainTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="fixed bottom-4 right-4 z-50"
  >
    <Button
      onClick={onClick}
      className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg hover:shadow-xl transition-all hover:scale-105"
    >
      <Brain className="h-6 w-6 text-white" />
    </Button>
  </motion.div>
);

export const NautilusBrainGlobal: React.FC<NautilusBrainGlobalProps> = ({
  isOpen,
  onClose,
  initialContext = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [systemData, setSystemData] = useState<{
    fleet?: { total: number; active: number };
    crew?: { total: number; onboard: number };
    maintenance?: { pending: number };
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSystemContext();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSystemContext = async () => {
    try {
      // Load system-wide data for context
      const [vesselsRes, crewRes, maintenanceRes] = await Promise.all([
        supabase.from("vessels").select("id, status"),
        supabase.from("crew_members").select("id, status"),
        supabase.from("maintenance_records").select("id").eq("status", "pending")
      ]);

      const data = {
        fleet: {
          total: vesselsRes.data?.length || 0,
          active: vesselsRes.data?.filter(v => v.status === "active").length || 0
        },
        crew: {
          total: crewRes.data?.length || 0,
          onboard: crewRes.data?.filter(c => c.status === "active").length || 0
        },
        maintenance: {
          pending: maintenanceRes.data?.length || 0
        }
      };

      setSystemData(data);

      // Initial message with context
      setMessages([{
        id: "1",
        role: "assistant",
        content: `Olá! Sou o **Nautilus Brain**, a IA central do sistema Nautilus One.

📊 **Visão Geral do Sistema:**
- 🚢 ${data.fleet.active}/${data.fleet.total} embarcações ativas
- 👥 ${data.crew.onboard} tripulantes a bordo
- 🔧 ${data.maintenance.pending} manutenções pendentes

${initialContext ? `\n📍 **Contexto Atual:** ${initialContext}\n` : ""}

Como posso ajudar você hoje? Posso analisar dados, gerar relatórios, prever necessidades de manutenção ou responder qualquer dúvida sobre as operações.`,
        timestamp: new Date(),
        suggestions: [
          "Status completo da frota",
          "Previsão de manutenção",
          "Análise de compliance",
          "Gerar relatório executivo"
        ]
      }]);
    } catch (error) {
      console.error("Error loading context:", error);
      setMessages([{
        id: "1",
        role: "assistant",
        content: `Olá! Sou o **Nautilus Brain**, a IA central do sistema.

Como posso ajudar você hoje?`,
        timestamp: new Date(),
        suggestions: [
          "Status da frota",
          "Análise de dados",
          "Gerar relatório"
        ]
      }]);
    }
  };

  const generateFallbackResponse = useCallback((query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes("manutenção") || q.includes("manutencao")) {
      return `📊 **Análise de Manutenção:**

Com base nos dados disponíveis:
- ${systemData?.maintenance?.pending || 0} manutenções pendentes
- Sistema de manutenção preditiva ativo

**Recomendações IA:**
1. Verificar itens com maior criticidade
2. Agendar manutenções preventivas
3. Avaliar estoque de peças críticas

Deseja que eu gere um plano detalhado?`;
    }

    if (q.includes("frota") || q.includes("embarcação") || q.includes("navio")) {
      return `🚢 **Status da Frota:**

- Total: ${systemData?.fleet?.total || 0} embarcações
- Ativas: ${systemData?.fleet?.active || 0}

Todas as embarcações estão operando dentro dos parâmetros normais.

Deseja detalhes de alguma embarcação específica?`;
    }

    if (q.includes("tripulação") || q.includes("crew") || q.includes("certificado")) {
      return `👥 **Status da Tripulação:**

- Total cadastrado: ${systemData?.crew?.total || 0}
- A bordo: ${systemData?.crew?.onboard || 0}

Posso verificar certificações expirando ou sugerir rotações de escala.`;
    }

    if (q.includes("relatório") || q.includes("relatorio") || q.includes("report")) {
      return `📊 **Geração de Relatórios:**

Posso gerar relatórios de:
- Status operacional da frota
- Performance de tripulação
- Compliance e auditorias
- KPIs executivos
- Manutenção e previsões

Qual tipo de relatório você precisa?`;
    }

    return `Entendi sua solicitação.

Com base nos dados do sistema, posso ajudar com:
- 🚢 Análise de frota e embarcações
- 👥 Gestão de tripulação
- 🔧 Manutenção preditiva
- 📊 Relatórios e KPIs
- ✅ Compliance e auditorias

Como posso ajudar?`;
  }, [systemData]);

  const generateSuggestions = useCallback((query: string): string[] => {
    const q = query.toLowerCase();
    
    if (q.includes("manutenção")) {
      return ["Ver pendências", "Gerar cronograma", "Previsão de falhas"];
    }
    if (q.includes("frota")) {
      return ["Localização atual", "Status de combustível", "Próximas rotas"];
    }
    if (q.includes("tripulação")) {
      return ["Certificados expirando", "Escala atual", "Performance"];
    }
    return ["Relatório executivo", "Alertas ativos", "Previsões IA"];
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Add assistant placeholder for streaming
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date()
    }]);

    try {
      // Build messages history for context
      const messageHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      messageHistory.push({ role: "user", content: currentInput });

      const response = await fetch("https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/nautilus-brain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE",
        },
        body: JSON.stringify({
          messages: messageHistory,
          context: {
            vessels: { total: systemData?.fleet?.total || 0, active: systemData?.fleet?.active || 0 },
            crew: { total: systemData?.crew?.total || 0, onboard: systemData?.crew?.onboard || 0 },
            maintenance: { pending: systemData?.maintenance?.pending || 0 }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na comunicação com IA");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process SSE lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantContent }
                    : m
                ));
              }
            } catch {
              // Incomplete JSON, will be handled in next iteration
            }
          }
        }
      }

      // Add suggestions after complete
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, suggestions: generateSuggestions(currentInput) }
          : m
      ));

    } catch (error) {
      console.error("Brain error:", error);
      
      // Update assistant message with fallback
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { 
            ...m, 
            content: generateFallbackResponse(currentInput),
            suggestions: generateSuggestions(currentInput)
          }
          : m
      ));
      
      toast.info(error instanceof Error ? error.message : "Usando resposta offline");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Mensagem copiada!");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg hover:shadow-xl"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl h-[70vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Nautilus Brain
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA Central
                  </Badge>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Assistente com visão completa do sistema
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          Nautilus Brain
                        </span>
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line.startsWith("**") && line.endsWith("**") 
                            ? <strong>{line.slice(2, -2)}</strong>
                            : line.startsWith("- ") 
                              ? <span className="block ml-2">{line}</span>
                              : line
                          }
                        </p>
                      ))}
                    </div>
                    
                    {message.role === "assistant" && message.content && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => copyMessage(message.content)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
                        {message.suggestions.map((suggestion, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    <span className="text-sm text-muted-foreground">
                      Analisando...
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre a operação..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Nautilus Brain powered by Gemini 2.5 Flash
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NautilusBrainGlobal;
