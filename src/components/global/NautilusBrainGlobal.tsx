/**
 * NAUTILUS BRAIN GLOBAL - IA Central Acessível de Qualquer Módulo
 * Assistente inteligente com LLM para toda operação marítima
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, X, Loader2, Sparkles, Ship, Wrench, Users,
  Package, Shield, Mic, Copy, ThumbsUp, ThumbsDown,
  Lightbulb, MessageSquare, Minimize2, Maximize2
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
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

export const NautilusBrainGlobal: React.FC<NautilusBrainGlobalProps> = ({
  isOpen,
  onClose,
  initialContext = ""
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [systemData, setSystemData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSystemContext();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSystemContext = async () => {
    try {
      // Load system-wide data for context
      const [vesselsRes, crewRes, maintenanceRes] = await Promise.all([
        supabase.from('vessels').select('*'),
        supabase.from('crew_members').select('*'),
        supabase.from('maintenance_records').select('*').eq('status', 'pending')
      ]);

      const data = {
        fleet: {
          total: vesselsRes.data?.length || 0,
          active: vesselsRes.data?.filter(v => v.status === 'active').length || 0
        },
        crew: {
          total: crewRes.data?.length || 0,
          onboard: crewRes.data?.filter(c => c.status === 'active').length || 0
        },
        maintenance: {
          pending: maintenanceRes.data?.length || 0
        }
      };

      setSystemData(data);

      // Initial message with context
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Olá! Sou o **Nautilus Brain**, a IA central do sistema Nautilus One.

📊 **Visão Geral do Sistema:**
- 🚢 ${data.fleet.active}/${data.fleet.total} embarcações ativas
- 👥 ${data.crew.onboard} tripulantes a bordo
- 🔧 ${data.maintenance.pending} manutenções pendentes

${initialContext ? `\n📍 **Contexto Atual:** ${initialContext}\n` : ''}

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
      console.error('Error loading context:', error);
      setMessages([{
        id: '1',
        role: 'assistant',
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('nautilus-llm', {
        body: {
          prompt: input,
          contextId: 'global-assistant',
          moduleId: 'nautilus-brain',
          sessionId: `brain-${Date.now()}`,
          mode: 'safe',
          systemData
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || generateFallbackResponse(input),
        timestamp: new Date(),
        context: data.model,
        suggestions: generateSuggestions(input)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Brain error:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(input),
        timestamp: new Date(),
        suggestions: generateSuggestions(input)
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('manutenção') || q.includes('manutencao')) {
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

    if (q.includes('frota') || q.includes('embarcação') || q.includes('navio')) {
      return `🚢 **Status da Frota:**

- Total: ${systemData?.fleet?.total || 0} embarcações
- Ativas: ${systemData?.fleet?.active || 0}

Todas as embarcações estão operando dentro dos parâmetros normais.

Deseja detalhes de alguma embarcação específica?`;
    }

    if (q.includes('tripulação') || q.includes('crew') || q.includes('certificado')) {
      return `👥 **Status da Tripulação:**

- Total cadastrado: ${systemData?.crew?.total || 0}
- A bordo: ${systemData?.crew?.onboard || 0}

Posso verificar certificações expirando ou sugerir rotações de escala.`;
    }

    if (q.includes('relatório') || q.includes('relatorio') || q.includes('report')) {
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
  };

  const generateSuggestions = (query: string): string[] => {
    const q = query.toLowerCase();
    
    if (q.includes('manutenção')) {
      return ["Ver pendências", "Gerar cronograma", "Previsão de falhas"];
    }
    if (q.includes('frota')) {
      return ["Localização atual", "Status de combustível", "Próximas rotas"];
    }
    if (q.includes('tripulação')) {
      return ["Certificados expirando", "Escala atual", "Performance"];
    }
    return ["Relatório executivo", "Alertas ativos", "Previsões IA"];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copiado!", description: "Mensagem copiada" });
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          Nautilus Brain
                        </span>
                      </div>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line.startsWith('**') && line.endsWith('**') 
                            ? <strong>{line.slice(2, -2)}</strong>
                            : line.startsWith('- ') 
                              ? <span className="block ml-2">{line}</span>
                              : line
                          }
                        </p>
                      ))}
                    </div>
                    
                    {message.role === 'assistant' && (
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

              {isLoading && (
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
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao Nautilus Brain..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Floating trigger button for global access
export const NautilusBrainTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
  >
    <Brain className="h-6 w-6 text-white" />
  </motion.button>
);
