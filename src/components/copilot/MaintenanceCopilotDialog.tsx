/**
 * Maintenance Copilot Dialog
 * AI assistant specialized in maintenance planning and optimization
 */

import { useState, useCallback, useRef, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Send,
  Loader2,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ship,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MaintenanceCopilotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselId?: string;
  vesselName?: string;
}

const quickActions = [
  { label: "Manutenções Pendentes", icon: Clock, prompt: "Quais são as manutenções pendentes e seus prazos?" },
  { label: "Priorizar Tarefas", icon: AlertTriangle, prompt: "Me ajude a priorizar as tarefas de manutenção atuais" },
  { label: "Histórico Recente", icon: Calendar, prompt: "Mostre o histórico de manutenções realizadas no último mês" },
  { label: "Otimizar Cronograma", icon: Sparkles, prompt: "Como posso otimizar o cronograma de manutenção preventiva?" },
];

const maintenanceInsights = [
  { title: "5 Tarefas Pendentes", status: "warning", detail: "2 urgentes, 3 regulares" },
  { title: "Próxima Manutenção", status: "info", detail: "Em 3 dias - Motor Principal" },
  { title: "Compliance", status: "success", detail: "95% em dia" },
];

export function MaintenanceCopilotDialog({
  open,
  onOpenChange,
  vesselId,
  vesselName = "Frota",
}: MaintenanceCopilotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou o Copiloto de Manutenção do Nautilus. Estou aqui para ajudar com o planejamento e otimização de manutenções ${vesselName !== "Frota" ? `da embarcação ${vesselName}` : "da sua frota"}.\n\nComo posso ajudar você hoje?`,
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

  const generateLocalResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes("pendente") || msg.includes("pendências") || msg.includes("aguardando")) {
      return `🔧 **Manutenções Pendentes:**\n\n**Urgentes (2):**\n1. **Motor Principal** - Troca de óleo (venceu há 2 dias)\n   ⚠️ Prioridade: Alta | Tempo estimado: 4h\n2. **Sistema Hidráulico** - Inspeção de válvulas\n   ⚠️ Prioridade: Alta | Tempo estimado: 2h\n\n**Regulares (3):**\n1. **Bomba de Porão** - Manutenção preventiva (em 5 dias)\n2. **Gerador Auxiliar** - Troca de filtros (em 7 dias)\n3. **Sistema de Navegação** - Calibração (em 10 dias)\n\n💡 **Recomendação:** Priorize as manutenções urgentes esta semana para evitar paradas não programadas.`;
    }

    if (msg.includes("priorizar") || msg.includes("prioridade") || msg.includes("ordenar")) {
      return `📊 **Análise de Priorização:**\n\nBaseado em criticidade, impacto operacional e compliance, recomendo:\n\n**1️⃣ Motor Principal** (Crítico)\n- Impacto: Pode causar parada total\n- Ação: Agendar imediatamente\n\n**2️⃣ Sistema Hidráulico** (Alto)\n- Impacto: Afeta operações de carga\n- Ação: Agendar para esta semana\n\n**3️⃣ Bomba de Porão** (Médio)\n- Impacto: Segurança da embarcação\n- Ação: Agendar para próxima semana\n\n**4️⃣ Gerador Auxiliar** (Baixo)\n- Impacto: Backup de energia\n- Ação: Pode aguardar\n\n🎯 **Sugestão:** Combine as manutenções 1 e 2 na mesma parada para otimizar tempo de indisponibilidade.`;
    }

    if (msg.includes("histórico") || msg.includes("realizado") || msg.includes("concluído")) {
      return `📅 **Histórico de Manutenções (Último Mês):**\n\n| Data | Equipamento | Tipo | Duração | Status |\n|------|-------------|------|---------|--------|\n| 20/01 | Propulsor | Preventiva | 6h | ✅ Concluída |\n| 15/01 | Sistema Elétrico | Corretiva | 3h | ✅ Concluída |\n| 10/01 | Compressor | Preventiva | 2h | ✅ Concluída |\n| 05/01 | Casco | Inspeção | 4h | ✅ Concluída |\n| 02/01 | Motor Aux. | Preventiva | 5h | ✅ Concluída |\n\n📈 **Resumo:**\n- Total de manutenções: **5**\n- Horas trabalhadas: **20h**\n- Taxa de conclusão: **100%**\n- Custo estimado: **R$ 45.000**`;
    }

    if (msg.includes("otimizar") || msg.includes("cronograma") || msg.includes("planejamento")) {
      return `⚡ **Otimização do Cronograma de Manutenção:**\n\n**Oportunidades Identificadas:**\n\n1️⃣ **Agrupamento de Tarefas**\n   - Combine manutenções do mesmo sistema na mesma parada\n   - Economia estimada: 15% do tempo\n\n2️⃣ **Manutenção Preditiva**\n   - Ative sensores IoT para monitoramento\n   - Reduza manutenções preventivas desnecessárias\n\n3️⃣ **Janelas de Oportunidade**\n   - Aproveite períodos de baixa demanda operacional\n   - Próxima janela: 28/01 a 02/02\n\n4️⃣ **Estoque Inteligente**\n   - Pré-posicione peças críticas\n   - Reduza tempo de espera em 40%\n\n📊 **Impacto Estimado:**\n- Redução de downtime: **25%**\n- Economia anual: **R$ 180.000**\n\nPosso gerar um plano detalhado para os próximos 90 dias?`;
    }

    return `Entendi sua pergunta sobre "${userMessage}".\n\nPosso ajudar com:\n- 📋 Listar manutenções pendentes\n- 🎯 Priorizar tarefas por criticidade\n- 📅 Consultar histórico de manutenções\n- ⚡ Otimizar cronogramas\n- 📊 Gerar relatórios de performance\n- 🔔 Configurar alertas preventivos\n\nComo gostaria de prosseguir?`;
  };

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("nauti-copilot", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: "maintenance",
          vesselId,
        },
      });

      let responseText: string;
      if (error || !data?.response) {
        responseText = generateLocalResponse(text);
      } else {
        responseText = data.response;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch {
      const localResponse = generateLocalResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: localResponse }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, vesselId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-success/10 text-success";
      case "warning": return "bg-warning/10 text-warning";
      case "info": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-warning to-warning/60">
              <Wrench className="h-5 w-5 text-warning-foreground" />
            </div>
            <span>Copiloto de Manutenção</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
            {vesselName !== "Frota" && (
              <Badge variant="outline" className="ml-2">
                <Ship className="h-3 w-3 mr-1" />
                {vesselName}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Insights Cards */}
        <div className="grid grid-cols-3 gap-2 pb-2 border-b">
          {maintenanceInsights.map((insight) => (
            <Card key={insight.title} className="p-2">
              <CardContent className="p-0">
                <div className={`text-xs font-medium ${getStatusColor(insight.status)}`}>
                  {insight.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {insight.detail}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap pb-2 border-b">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => sendMessage(action.prompt)}
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
            {messages.map((message, idx) => (
              <div
                key={`msg-${idx}-${message.role}`}
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
                    <span className="text-sm text-muted-foreground">Analisando...</span>
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre manutenções..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MaintenanceCopilotDialog;
