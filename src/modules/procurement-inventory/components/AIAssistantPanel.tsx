import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Send,
  Sparkles,
  X,
  Bot,
  User,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  Building2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantPanelProps {
  onClose: () => void;
}

export default function AIAssistantPanel({ onClose }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o assistente de Procurement & Inventory com IA. Posso ajudar com:\n\n• Consultas de estoque e previsões\n• Análise de fornecedores\n• Sugestões de compras\n• Geração de relatórios\n• Otimização de custos\n\nComo posso ajudar?",
      timestamp: new Date(),
      suggestions: ["Qual o status do estoque?", "Pedidos atrasados?", "Melhor fornecedor para filtros?"],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Try to use the AI edge function
      const { data, error } = await supabase.functions.invoke("procurement-ai-assistant", {
        body: { 
          message: inputMessage,
          context: "procurement-inventory"
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.response || getLocalResponse(inputMessage),
        timestamp: new Date(),
        suggestions: data?.suggestions || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to local responses
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getLocalResponse(inputMessage),
        timestamp: new Date(),
        suggestions: getSuggestions(inputMessage),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("estoque") && (lowerMessage.includes("baixo") || lowerMessage.includes("crítico"))) {
      return "📊 **Análise de Estoque Crítico:**\n\n• **Filtro de óleo hidráulico** - 5 un (mín: 10) - ⚠️ Crítico\n• **Válvula de segurança DP** - 3 un (mín: 5) - ⚠️ Baixo\n• **EPI Capacetes** - 12 un (mín: 20) - ⚠️ Baixo\n\n💡 **Recomendação IA:** Sugiro gerar requisições automáticas para os 3 itens. Deseja que eu crie?";
    }

    if (lowerMessage.includes("atrasa") || lowerMessage.includes("atrasado")) {
      return "🚨 **Pedidos Atrasados:**\n\n• **PO-2024-039** - NavTech\n  Válvula de segurança DP\n  Previsão: 17/01 | Atraso: 3 dias\n  Motivo: Peça importada\n\n💡 **Ação sugerida:** Contatar fornecedor para nova previsão ou buscar alternativas locais.";
    }

    if (lowerMessage.includes("fornecedor")) {
      if (lowerMessage.includes("filtro")) {
        return "🏢 **Melhores fornecedores para Filtros:**\n\n1. **HidroMar** ⭐\n   • Rating: 4.8 | On-Time: 97%\n   • Lead Time: 5 dias\n   • Preço médio: R$ 450/un\n\n2. **SealMaster**\n   • Rating: 3.5 | On-Time: 72%\n   • Lead Time: 12 dias\n   • Preço médio: R$ 380/un\n\n💡 **Recomendação:** HidroMar oferece melhor custo-benefício considerando prazo e qualidade.";
      }
      return "🏢 **Top Fornecedores por Performance:**\n\n1. **NavTech** - Rating 4.9, 99% on-time\n2. **HidroMar** - Rating 4.8, 97% on-time\n3. **PetroLub** - Rating 4.6, 94% on-time\n\n⚠️ **Atenção:** SafetyFirst com taxa de 85% - considerar renegociação.";
    }

    if (lowerMessage.includes("custo") || lowerMessage.includes("gasto") || lowerMessage.includes("economia")) {
      return "💰 **Análise de Custos (Último Mês):**\n\n• Total gasto: **R$ 58.000**\n• vs Budget: **-3%** ✅\n• Economia IA: **R$ 4.200** (negociações automáticas)\n\n📊 **Por categoria:**\n• Manutenção: R$ 20k (35%)\n• Consumíveis: R$ 13k (22%)\n• DP System: R$ 11k (19%)\n\n💡 **Oportunidade:** Consolidar pedidos de lubrificantes pode gerar 8% de economia adicional.";
    }

    if (lowerMessage.includes("previsão") || lowerMessage.includes("previsao") || lowerMessage.includes("prever")) {
      return "🔮 **Previsões de Consumo (Próximos 30 dias):**\n\n• Filtro de óleo: Estoque esgota em **7 dias**\n• Óleo lubrificante: Consumo de **80L**\n• EPIs: Necessidade de **15 capacetes**\n\n📈 **Gastos previstos:** R$ 62.000\n\n💡 **Ações sugeridas:**\n1. Gerar PO urgente para filtros\n2. Programar compra de EPIs\n3. Renegociar contrato de lubrificantes";
    }

    if (lowerMessage.includes("relatório") || lowerMessage.includes("relatorio") || lowerMessage.includes("report")) {
      return "📋 **Relatórios Disponíveis:**\n\n1. **Gastos por categoria** - PDF/Excel\n2. **Performance de fornecedores** - Dashboard\n3. **Movimentações de estoque** - Detalhado\n4. **Previsão de demanda** - IA Preditiva\n5. **Auditoria de compras** - Compliance\n\nQual relatório você gostaria que eu gerasse?";
    }

    if (lowerMessage.includes("criar") || lowerMessage.includes("gerar") || lowerMessage.includes("requisição")) {
      return "📝 **Criar Requisição:**\n\nPosso ajudar a criar uma requisição. Por favor, informe:\n\n• Qual item/produto?\n• Quantidade necessária?\n• Urgência (baixa/média/alta/urgente)?\n• Centro de custo?\n\nOu posso sugerir requisições automáticas baseadas nas previsões de estoque.";
    }

    return "Entendi sua pergunta sobre \"" + message + "\". \n\nPosso ajudar com:\n• 📦 Consultas de estoque\n• 🏢 Análise de fornecedores\n• 💰 Otimização de custos\n• 📊 Previsões e relatórios\n• 📝 Criação de requisições\n\nPode me dar mais detalhes sobre o que precisa?";
  };

  const getSuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("estoque")) {
      return ["Gerar reposição automática", "Ver movimentações", "Exportar relatório"];
    }
    if (lowerMessage.includes("fornecedor")) {
      return ["Comparar preços", "Ver histórico de pedidos", "Solicitar cotação"];
    }
    if (lowerMessage.includes("custo")) {
      return ["Ver oportunidades de economia", "Relatório de gastos", "Análise por categoria"];
    }
    return ["Consultar estoque", "Pedidos atrasados", "Gerar relatório"];
  });

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  });

  const quickActions = [
    { icon: Package, label: "Estoque crítico", color: "text-amber-500" },
    { icon: AlertTriangle, label: "Atrasados", color: "text-red-500" },
    { icon: Building2, label: "Fornecedores", color: "text-blue-500" },
    { icon: TrendingUp, label: "Previsões", color: "text-purple-500" },
  ];

  return (
    <Card className="h-[calc(100vh-220px)] flex flex-col bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Assistente IA
            <Badge variant="secondary" className="ml-1">
              <Sparkles className="h-3 w-3 mr-1" />
              LLM
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-11">
                  {msg.suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handlehandleSuggestionClick}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analisando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-2 border-t border-b bg-muted/30">
        <div className="flex gap-1">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => handlehandleSuggestionClick}
            >
              <action.icon className={`h-3 w-3 mr-1 ${action.color}`} />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Pergunte sobre estoque, compras..."
            value={inputMessage}
            onChange={handleChange}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
