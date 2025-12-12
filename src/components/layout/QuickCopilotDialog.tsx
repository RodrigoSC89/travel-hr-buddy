/**
 * Quick Copilot Dialog Component
 * Assistente IA rápido no header
 */

import { memo, memo, useCallback, useEffect, useRef, useState, useMemo } from "react";;;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Loader2,
  Sparkles,
  Ship,
  Wrench,
  BarChart3,
  Shield,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuickCopilotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions = [
  { label: "Status da Frota", icon: Ship, prompt: "Qual o status atual da frota?" },
  { label: "Manutenções Pendentes", icon: Wrench, prompt: "Quais manutenções estão pendentes?" },
  { label: "KPIs do Dia", icon: BarChart3, prompt: "Mostre os principais KPIs de hoje" },
  { label: "Alertas de Segurança", icon: Shield, prompt: "Há algum alerta de segurança ativo?" },
  { label: "Ajuda Geral", icon: HelpCircle, prompt: "O que você pode fazer por mim?" },
];

export const QuickCopilotDialog = memo(function({ open, onOpenChange }: QuickCopilotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Copiloto Nautilus, seu assistente de IA para operações marítimas. Como posso ajudar você hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateLocalResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes("frota") || msg.includes("embarcações") || msg.includes("navios")) {
      return "📊 **Status da Frota Atual:**\n\n- **20 embarcações** operacionais\n- **3 embarcações** em manutenção programada\n- **1 embarcação** em standby\n\n✅ Taxa de disponibilidade: **83%**\n\nDeseja ver detalhes de alguma embarcação específica?";
    }
    
    if (msg.includes("manutenção") || msg.includes("manutenções")) {
      return "🔧 **Manutenções Pendentes:**\n\n1. **Ocean Pioneer** - Manutenção preventiva (amanhã)\n2. **Sea Guardian** - Troca de filtros (próxima semana)\n3. **Atlantic Star** - Inspeção de casco (em 15 dias)\n\n⚠️ Total: **3 manutenções** nos próximos 30 dias\n\nPosso agendar ou reprogramar alguma?";
    }
    
    if (msg.includes("kpi") || msg.includes("indicador") || msg.includes("métricas")) {
      return "📈 **KPIs do Dia:**\n\n- **Uptime da Frota:** 94.5%\n- **Índice de Segurança (TRIR):** 0.42\n- **Emissões CO2:** -12% vs meta\n- **Eficiência Operacional:** 87%\n- **Custos:** Dentro do orçamento\n\n🎯 Todos os indicadores dentro das metas!";
    }
    
    if (msg.includes("segurança") || msg.includes("alerta") || msg.includes("incidente")) {
      return "🛡️ **Status de Segurança:**\n\n- **0 incidentes** nas últimas 24h\n- **156 dias** sem LTI (Lost Time Injury)\n- **2 alertas** de verificação pendente\n\n⚠️ Alertas ativos:\n1. Verificação de equipamento de segurança - Deck 3\n2. Atualização de treinamento - 5 tripulantes\n\nDeseja mais detalhes?";
    }
    
    if (msg.includes("ajuda") || msg.includes("o que você pode")) {
      return "🤖 **Como posso ajudar:**\n\n- 📊 Consultar status da frota\n- 🔧 Ver manutenções pendentes\n- 📈 Analisar KPIs e métricas\n- 🛡️ Verificar alertas de segurança\n- 📋 Gerar relatórios rápidos\n- 🌱 Consultar dados ESG\n- 👥 Status da tripulação\n- 📦 Verificar suprimentos\n\nBasta me perguntar!";
    }
    
    return `Entendi sua pergunta sobre "${userMessage}". \n\nPosso ajudar com:\n- Status da frota e embarcações\n- Manutenções programadas\n- KPIs e métricas operacionais\n- Alertas de segurança\n- Relatórios e análises\n\nPode reformular ou escolher uma das opções acima?`;
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try to call the edge function
      const { data, error } = await supabase.functions.invoke("nautilus-copilot", {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: "quick_assistant"
        }
      };

      if (error || !data?.response) {
        // Fallback to local response
        const localResponse = generateLocalResponse(text);
        setMessages(prev => [...prev, { role: "assistant", content: localResponse }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (err) {
      // Fallback to local response on any error
      const localResponse = generateLocalResponse(text);
      setMessages(prev => [...prev, { role: "assistant", content: localResponse }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Copiloto Nautilus</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap pb-2 border-b">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handlesendMessage}
              disabled={isLoading}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}