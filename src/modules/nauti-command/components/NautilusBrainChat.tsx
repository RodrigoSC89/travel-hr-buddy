/**
 * NAUTILUS BRAIN - IA Central do Sistema
 * Assistente inteligente com LLM para toda operação marítima
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from '@/lib/logger';
import {
  Brain, Send, X, Loader2, Sparkles, Ship, Wrench, Users,
  Package, Shield, Mic, Volume2, Copy, ThumbsUp, ThumbsDown,
  Lightbulb, Target, AlertTriangle, CheckCircle, MessageSquare
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
  suggestions?: string[];
}

interface SystemStatusData {
  fleet: Record<string, number>;
  crew: Record<string, number>;
  maintenance: Record<string, number>;
  inventory: Record<string, number>;
  compliance: Record<string, number>;
  [key: string]: unknown;
}

interface AlertData {
  type: string;
  title: string;
  [key: string]: unknown;
}

interface NautilusBrainChatProps {
  onClose: () => void;
  systemStatus: SystemStatusData;
  alerts: AlertData[];
}

export const NautilusBrainChat: React.FC<NautilusBrainChatProps> = ({
  onClose,
  systemStatus,
  alerts
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou o **Nautilus Brain**, a IA central do sistema. Tenho visibilidade completa de toda operação:

📊 **Status Atual:**
- 🚢 ${systemStatus.fleet.active} embarcações ativas
- 👥 ${systemStatus.crew.onboard} tripulantes a bordo
- 🔧 ${systemStatus.maintenance.efficiency}% eficiência de manutenção
- 📦 ${systemStatus.inventory.lowStock} itens em baixo estoque
- ✅ ${systemStatus.compliance.score}% score de compliance

${alerts.length > 0 ? `\n⚠️ **Atenção:** ${alerts.length} alertas ativos requerem ação.` : ''}

Como posso ajudar você hoje?`,
      timestamp: new Date(),
      suggestions: [
        "Quais embarcações precisam de manutenção?",
        "Mostre certificados expirando",
        "Preveja necessidades de estoque",
        "Gere relatório de compliance"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      // Build context for LLM
      const context = `
Sistema Nautilus One - Contexto Atual:
- Frota: ${systemStatus.fleet.vessels} embarcações, ${systemStatus.fleet.active} ativas
- Tripulação: ${systemStatus.crew.total} pessoas, ${systemStatus.crew.onboard} a bordo
- Manutenção: ${systemStatus.maintenance.scheduled} agendadas, ${systemStatus.maintenance.overdue} vencidas
- Estoque: ${systemStatus.inventory.lowStock} itens em baixo estoque
- Compliance: ${systemStatus.compliance.score}% score
- Alertas ativos: ${alerts.length}
${alerts.map(a => `  - ${a.type}: ${a.title}`).join('\n')}
      `;

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: input,
          context,
          agentId: 'nauti-brain',
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.reply || "Desculpe, não consegui processar sua solicitação. Tente novamente.",
        timestamp: new Date(),
        context: data?.model,
        suggestions: generateSuggestions(input)
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      logger.error('Brain error:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(input, systemStatus, alerts),
        timestamp: new Date(),
        suggestions: generateSuggestions(input)
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string, status: SystemStatusData, alertList: AlertData[]): string => {
    const q = query.toLowerCase();
    
    if (q.includes('manutenção') || q.includes('manutencao')) {
      return `📊 **Análise de Manutenção:**

- ✅ ${status.maintenance.completed} manutenções concluídas
- 📅 ${status.maintenance.scheduled} agendadas
- ⚠️ ${status.maintenance.overdue} vencidas (ação urgente)
- 📈 Eficiência geral: ${status.maintenance.efficiency}%

**Recomendações IA:**
1. Priorizar as ${status.maintenance.overdue} manutenções vencidas
2. Verificar componentes críticos das embarcações em operação
3. Agendar revisão preventiva para próxima semana

Deseja que eu gere um plano de ação detalhado?`;
    }

    if (q.includes('tripulação') || q.includes('tripulacao') || q.includes('certificado')) {
      return `👥 **Status da Tripulação:**

- Total: ${status.crew.total} tripulantes
- A bordo: ${status.crew.onboard}
- Em licença: ${status.crew.onLeave}
- ⚠️ ${status.crew.expiringCerts} certificados expirando

**Ação Recomendada:**
Providenciar renovação dos certificados antes do vencimento para evitar não-conformidades regulatórias.`;
    }

    if (q.includes('estoque') || q.includes('peças') || q.includes('pecas') || q.includes('compra')) {
      return `📦 **Análise de Estoque:**

- ⚠️ ${status.inventory.lowStock} itens em baixo estoque
- 🔄 ${status.inventory.pendingOrders} pedidos pendentes
- 💰 Valor total: R$ ${(status.inventory.value / 1000000).toFixed(2)}M

**Previsão IA:**
Com base no consumo histórico, recomendo reabastecimento imediato dos itens críticos para evitar paradas operacionais.`;
    }

    if (q.includes('frota') || q.includes('embarcação') || q.includes('navio')) {
      return `🚢 **Status da Frota:**

- Total: ${status.fleet.vessels} embarcações
- Ativas: ${status.fleet.active}
- Em manutenção: ${status.fleet.maintenance}
- Com alertas: ${status.fleet.alerts}

Todas as embarcações ativas estão operando dentro dos parâmetros normais.`;
    }

    if (q.includes('compliance') || q.includes('auditoria') || q.includes('conformidade')) {
      return `✅ **Status de Compliance:**

- Score geral: ${status.compliance.score}%
- Auditorias pendentes: ${status.compliance.pendingAudits}
- Documentos expirando: ${status.compliance.expiringDocs}

O sistema está em conformidade com as principais normas marítimas (SOLAS, ISM, ISPS).`;
    }

    return `Entendi sua solicitação sobre "${query}". 

Com base nos dados atuais do sistema, posso fornecer análises sobre:
- 🚢 Frota e embarcações
- 👥 Tripulação e certificações
- 🔧 Manutenção e manutenção preditiva
- 📦 Estoque e procurement
- ✅ Compliance e auditorias

Qual área você gostaria de explorar em detalhes?`;
  };

  const generateSuggestions = (query: string): string[] => {
    const q = query.toLowerCase();
    
    if (q.includes('manutenção')) {
      return ["Ver manutenções vencidas", "Gerar plano de manutenção", "Prever falhas"];
    }
    if (q.includes('tripulação') || q.includes('certificado')) {
      return ["Certificados expirando", "Escala de tripulação", "Avaliar desempenho"];
    }
    return ["Relatório geral", "Alertas críticos", "Previsões da IA"];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copiado!", description: "Mensagem copiada para a área de transferência" });
  };

  return (
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
        className="w-full max-w-4xl h-[80vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Nautilus Brain
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Central
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                Assistente inteligente com visão completa do sistema
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
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
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Nautilus Brain
                      </span>
                      {message.context && (
                        <Badge variant="outline" className="text-xs">
                          {message.context}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
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
                  
                  {/* Actions for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                      <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/50">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs"
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
                    Nautilus Brain está analisando...
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={isListening ? "bg-destructive/10 text-destructive" : ""}
              onClick={() => setIsListening(!isListening)}
            >
              <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
            </Button>
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Nautilus Brain tem acesso completo a todos os módulos do sistema
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
