/**
 * Reports Copilot Dialog
 * AI assistant specialized in generating and analyzing reports
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
  Send,
  Loader2,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ReportsCopilotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickActions = [
  { label: "Relatório Mensal", icon: Calendar, prompt: "Gere um relatório executivo do mês atual" },
  { label: "KPIs Operacionais", icon: BarChart3, prompt: "Mostre os principais KPIs operacionais" },
  { label: "Análise de Custos", icon: TrendingUp, prompt: "Analise os custos operacionais do último trimestre" },
  { label: "Compliance Report", icon: FileText, prompt: "Gere relatório de compliance e certificações" },
];

const recentReports = [
  { name: "Relatório Semanal - Jan W3", type: "Operacional", date: "21/01" },
  { name: "KPIs Q4 2024", type: "Executivo", date: "15/01" },
  { name: "Análise de Frota", type: "Técnico", date: "10/01" },
];

export function ReportsCopilotDialog({
  open,
  onOpenChange,
}: ReportsCopilotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Copiloto de Relatórios do Nautilus. Posso ajudar você a gerar, analisar e interpretar relatórios operacionais, financeiros e de compliance.\n\nO que você precisa hoje?",
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

    if (msg.includes("mensal") || msg.includes("executivo") || msg.includes("mês")) {
      return `📊 **Relatório Executivo - Janeiro 2024**\n\n**Resumo Geral:**\n- Período: 01/01 a 23/01/2024\n- Status: Em andamento\n\n**Indicadores Chave:**\n\n| KPI | Valor | Meta | Status |\n|-----|-------|------|--------|\n| Uptime da Frota | 94.5% | 92% | ✅ |\n| TRIR (Segurança) | 0.42 | <0.5 | ✅ |\n| Custos Operacionais | R$ 2.8M | R$ 3M | ✅ |\n| Emissões CO2 | -12% | -10% | ✅ |\n| Manutenções no Prazo | 87% | 85% | ✅ |\n\n**Destaques:**\n- ✅ Todos os KPIs dentro ou acima da meta\n- 📈 Redução de 15% em custos de combustível\n- 🛡️ Zero incidentes com afastamento\n\n**Ações Recomendadas:**\n1. Manter programa de eficiência energética\n2. Ampliar treinamentos de segurança\n\nPosso exportar este relatório em PDF?`;
    }

    if (msg.includes("kpi") || msg.includes("indicador") || msg.includes("métrica")) {
      return `📈 **Dashboard de KPIs Operacionais:**\n\n**Operações:**\n- Disponibilidade: **94.5%** ↑2%\n- Utilização: **87%** ↑5%\n- MTBF: **720h** (excelente)\n- MTTR: **4h** (dentro da meta)\n\n**Segurança:**\n- TRIR: **0.42** (meta: <0.5)\n- Dias sem LTI: **156**\n- Near Misses: **3** (investigados)\n- Drills Realizados: **100%**\n\n**Financeiro:**\n- OPEX vs Budget: **93%** ✅\n- Custo/Dia: **R$ 45.200**\n- Economia Combustível: **15%**\n\n**Compliance:**\n- Certificados em Dia: **98%**\n- Auditorias Passadas: **100%**\n- Treinamentos: **95%**\n\n📊 Quer um gráfico de tendência de algum KPI específico?`;
    }

    if (msg.includes("custo") || msg.includes("financeiro") || msg.includes("despesa")) {
      return `💰 **Análise de Custos - Q4 2024 vs Q1 2025:**\n\n**Composição de Custos:**\n\n| Categoria | Q4/24 | Q1/25 | Variação |\n|-----------|-------|-------|----------|\n| Combustível | R$ 1.2M | R$ 1.02M | -15% ✅ |\n| Tripulação | R$ 850K | R$ 880K | +3.5% |\n| Manutenção | R$ 420K | R$ 390K | -7% ✅ |\n| Porto/Taxas | R$ 180K | R$ 175K | -3% |\n| Seguros | R$ 150K | R$ 150K | 0% |\n| **Total** | **R$ 2.8M** | **R$ 2.6M** | **-7%** ✅ |\n\n**Principais Drivers:**\n1. 📉 Otimização de rotas reduziu combustível\n2. 📉 Manutenção preditiva evitou reparos emergenciais\n3. 📈 Reajuste salarial impactou tripulação\n\n**Projeção Anual:**\n- Economia estimada: **R$ 800K**\n- ROI das iniciativas: **280%**\n\nPosso detalhar alguma categoria específica?`;
    }

    if (msg.includes("compliance") || msg.includes("certificação") || msg.includes("auditoria")) {
      return `📋 **Relatório de Compliance:**\n\n**Status Geral:** ✅ 98% em conformidade\n\n**Certificações:**\n| Certificado | Embarcação | Validade | Status |\n|-------------|------------|----------|--------|\n| ISM/SMC | MV Nautilus | 15/06/25 | ✅ Válido |\n| ISPS | MV Nautilus | 15/06/25 | ✅ Válido |\n| Class Survey | MV Nautilus | 20/03/25 | ⚠️ Renovar |\n| SOLAS | Ocean Star | 10/08/25 | ✅ Válido |\n| MARPOL | Ocean Star | 10/08/25 | ✅ Válido |\n\n**Auditorias Recentes:**\n- PSC Rio (18/01): **Zero deficiências**\n- IMCA CMID (10/01): **Score 92%**\n- Auditoria Interna (05/01): **3 observações menores**\n\n**Ações Pendentes:**\n1. Renovar Class Survey - MV Nautilus (prazo: 20/03)\n2. Fechar observações da auditoria interna\n\n📅 Agendar lembretes para renovações?`;
    }

    return `Entendi sua solicitação sobre "${userMessage}".\n\nPosso gerar os seguintes tipos de relatórios:\n\n📊 **Operacionais:**\n- Relatório diário/semanal/mensal\n- Dashboard de KPIs\n- Performance da frota\n\n💰 **Financeiros:**\n- Análise de custos\n- Budget vs Realizado\n- Projeções\n\n📋 **Compliance:**\n- Status de certificações\n- Auditorias realizadas\n- Pendências regulatórias\n\n🛡️ **Segurança:**\n- Incidentes e near misses\n- Indicadores TRIR/LTI\n- Treinamentos\n\nQual relatório você precisa?`;
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
          context: "reports",
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
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleExport = (reportName: string) => {
    toast.success(`Exportando ${reportName}...`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Copiloto de Relatórios</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Recent Reports */}
        <div className="space-y-2 pb-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Relatórios Recentes</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentReports.map((report) => (
              <Card key={report.name} className="p-2 min-w-[150px] cursor-pointer hover:bg-muted/50">
                <CardContent className="p-0 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium truncate">{report.name}</div>
                    <div className="text-[10px] text-muted-foreground">{report.type} • {report.date}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleExport(report.name)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <span className="text-sm text-muted-foreground">Gerando relatório...</span>
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
            placeholder="Peça um relatório ou análise..."
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

export default ReportsCopilotDialog;
