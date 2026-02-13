/**
 * Crew Planning Copilot Dialog
 * AI assistant specialized in crew management and planning
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Loader2,
  Users,
  Calendar,
  Award,
  AlertTriangle,
  UserPlus,
  Clock,
  Sparkles,
  Ship,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CrewPlanningCopilotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselId?: string;
  vesselName?: string;
}

const quickActions = [
  { label: "Escala Atual", icon: Calendar, prompt: "Mostre a escala de tripulação atual" },
  { label: "Certificados Vencendo", icon: AlertTriangle, prompt: "Quais certificados vencem nos próximos 30 dias?" },
  { label: "Otimizar Escala", icon: Sparkles, prompt: "Sugira otimizações para a escala de tripulação" },
  { label: "Disponibilidade", icon: Users, prompt: "Qual a disponibilidade de tripulantes para embarque?" },
];

const crewStats = [
  { label: "Embarcados", value: "45", icon: Ship, color: "text-primary" },
  { label: "Disponíveis", value: "12", icon: Users, color: "text-success" },
  { label: "Em Treinamento", value: "5", icon: Award, color: "text-warning" },
];

export function CrewPlanningCopilotDialog({
  open,
  onOpenChange,
  vesselId,
  vesselName = "Frota",
}: CrewPlanningCopilotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou o Copiloto de Planejamento de Tripulação do Nautilus. Posso ajudar com escalas, certificações, treinamentos e otimização de recursos humanos ${vesselName !== "Frota" ? `para a ${vesselName}` : "da frota"}.\n\nComo posso ajudar?`,
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

    if (msg.includes("escala") || msg.includes("embarque") || msg.includes("rotação")) {
      return `📅 **Escala de Tripulação Atual:**\n\n**MV Nautilus (Embarcado até 15/02):**\n| Função | Nome | Embarque | Desembarque |\n|--------|------|----------|-------------|\n| Capitão | João Silva | 01/01 | 15/02 |\n| 1º Oficial | Pedro Santos | 01/01 | 15/02 |\n| Chefe Máq. | Carlos Lima | 15/12 | 30/01 |\n| 2º Oficial | André Costa | 01/01 | 15/02 |\n\n**Próximas Rotações:**\n- 🔄 Chefe de Máquinas - Rotação em **7 dias**\n- 🔄 Cozinheiro - Rotação em **14 dias**\n\n**Tripulantes Disponíveis (Folga):**\n- Roberto Ferreira (Capitão) - Disponível 25/01\n- Marcos Souza (Chefe Máq.) - Disponível agora\n\n⚠️ **Atenção:** Necessário confirmar substituto para Chefe de Máquinas.\n\nPosso ajudar a planejar a rotação?`;
    }

    if (msg.includes("certificado") || msg.includes("venc") || msg.includes("documento")) {
      return `📋 **Certificados com Vencimento Próximo:**\n\n**⚠️ Vencendo em 30 dias:**\n\n| Tripulante | Certificado | Vencimento | Status |\n|------------|-------------|------------|--------|\n| João Silva | BOSIET | 05/02/25 | 🟡 13 dias |\n| Pedro Santos | HUET | 10/02/25 | 🟡 18 dias |\n| Carlos Lima | Marinheiro de Convés | 15/02/25 | 🟡 23 dias |\n| Ana Oliveira | STCW | 20/02/25 | 🟡 28 dias |\n\n**✅ Renovações em Andamento:**\n- João Silva - BOSIET agendado para 01/02\n- Pedro Santos - HUET agendado para 05/02\n\n**❌ Sem Agendamento:**\n- Carlos Lima - Marinheiro de Convés\n- Ana Oliveira - STCW\n\n📧 **Recomendação:** Enviar lembretes e agendar renovações.\n\nPosso criar os agendamentos automaticamente?`;
    }

    if (msg.includes("otimiz") || msg.includes("sugest") || msg.includes("melhor")) {
      return `⚡ **Otimizações Sugeridas para a Escala:**\n\n**1️⃣ Sincronização de Rotações**\nAlinhar rotações de mesma função para reduzir viagens.\n- Economia estimada: **R$ 15.000/mês** em passagens\n- Impacto: 3 tripulantes\n\n**2️⃣ Antecipação de Férias**\nAntecipar férias de 2 tripulantes para cobrir período de alta demanda.\n- Benefício: Evita contratação temporária\n- Economia: **R$ 8.000**\n\n**3️⃣ Treinamento em Lote**\nAgrupar renovações de certificados no mesmo período.\n- 4 tripulantes com BOSIET vencendo\n- Desconto grupo: **15%**\n\n**4️⃣ Pool Compartilhado**\nCompartilhar tripulantes entre MV Nautilus e Ocean Star.\n- Aumenta flexibilidade\n- Reduz tempo de espera em **40%**\n\n📊 **Impacto Total:**\n- Economia anual estimada: **R$ 180.000**\n- Melhoria de satisfação: **+25%**\n\nQuer que eu aplique alguma dessas otimizações?`;
    }

    if (msg.includes("disponib") || msg.includes("folga") || msg.includes("férias")) {
      return `👥 **Disponibilidade de Tripulantes:**\n\n**Disponíveis para Embarque Imediato (12):**\n\n| Nome | Função | Última Atividade | Status |\n|------|--------|------------------|--------|\n| Marcos Souza | Chefe Máq. | 10/01 | ✅ Pronto |\n| Roberto Ferreira | Capitão | 15/01 | ✅ Pronto |\n| Lucas Mendes | 2º Oficial | 05/01 | ✅ Pronto |\n| Bruno Alves | Marinheiro | 08/01 | ✅ Pronto |\n| Felipe Dias | Eletricista | 12/01 | ✅ Pronto |\n\n**Em Férias (8):**\n- Ana Oliveira - Retorno 01/02\n- José Santos - Retorno 05/02\n\n**Em Treinamento (5):**\n- Ricardo Lima - BOSIET até 25/01\n- Paulo Costa - Básico até 30/01\n\n**Afastados (2):**\n- Carlos Ribeiro - Médico até 15/02\n\n📈 **Taxa de Disponibilidade:** 71%\n\nPrecisa alocar alguém em uma embarcação específica?`;
    }

    if (msg.includes("adicionar") || msg.includes("contratar") || msg.includes("novo")) {
      return `➕ **Processo de Adição de Tripulante:**\n\n**Dados Necessários:**\n1. Nome completo\n2. Função/Cargo\n3. Certificações ativas\n4. Data de disponibilidade\n5. Documentação marítima\n\n**Checklist de Onboarding:**\n- [ ] Contrato assinado\n- [ ] Exames médicos (ASO)\n- [ ] Certificados validados\n- [ ] Treinamentos obrigatórios\n- [ ] CBSP (ANM) válido\n- [ ] Uniforme e EPIs\n\n**Tempo Médio de Onboarding:** 5-7 dias úteis\n\n📝 Para iniciar, preciso das informações básicas do candidato.\n\nQuer que eu inicie o processo de cadastro?`;
    }

    return `Entendi sua pergunta sobre "${userMessage}".\n\nPosso ajudar com:\n\n👥 **Gestão de Tripulação:**\n- Visualizar e editar escalas\n- Planejar rotações\n- Gerenciar disponibilidade\n\n📋 **Certificações:**\n- Monitorar vencimentos\n- Agendar renovações\n- Validar documentos\n\n📊 **Análises:**\n- Otimização de custos\n- Métricas de RH\n- Previsões de demanda\n\n🎓 **Treinamentos:**\n- Planejar capacitações\n- Controlar obrigatoriedades\n\nComo posso ajudar especificamente?`;
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
          context: "crew_planning",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-success to-success/60">
              <Users className="h-5 w-5 text-success-foreground" />
            </div>
            <span>Copiloto de Tripulação</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Crew Stats */}
        <div className="grid grid-cols-3 gap-2 pb-2 border-b">
          {crewStats.map((stat) => (
            <Card key={stat.label} className="p-2">
              <CardContent className="p-0 flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
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
            {messages.map((message, msgIdx) => (
              <div
                key={`${message.role}-${msgIdx}`}
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
                    <span className="text-sm text-muted-foreground">Analisando tripulação...</span>
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
            placeholder="Pergunte sobre a tripulação..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon" aria-label="Enviar mensagem" title="Enviar">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CrewPlanningCopilotDialog;
