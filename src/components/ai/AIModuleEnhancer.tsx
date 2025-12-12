/**
import { useState, useCallback } from "react";;
 * AI Module Enhancer - Componente reutilizável para adicionar IA a qualquer módulo
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI, AIModule, AIAction } from "@/hooks/useNautilusAI";
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  TrendingUp,
  Search,
  FileText,
  MessageSquare,
  Zap,
  Target,
  Copy,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  action: AIAction;
  icon: React.ReactNode;
}

interface AIModuleEnhancerProps {
  module: AIModule;
  title?: string;
  description?: string;
  quickActions?: QuickAction[];
  context?: Record<string, unknown>;
  compact?: boolean;
  className?: string;
}

const DEFAULT_ACTIONS: Record<AIModule, QuickAction[]> = {
  maintenance: [
    { id: "predict", label: "Prever Falhas", prompt: "Analise os equipamentos e preveja próximas falhas", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "optimize", label: "Otimizar Cronograma", prompt: "Otimize o cronograma de manutenção preventiva", action: "optimize", icon: <Target className="h-4 w-4" /> },
    { id: "analyze", label: "Analisar Histórico", prompt: "Analise o histórico de manutenções e identifique padrões", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "generate", label: "Gerar Relatório", prompt: "Gere um relatório de status de manutenção", action: "generate", icon: <FileText className="h-4 w-4" /> }
  ],
  crew: [
    { id: "match", label: "Matching Tripulação", prompt: "Encontre o tripulante ideal para a vaga disponível", action: "match", icon: <Target className="h-4 w-4" /> },
    { id: "analyze", label: "Análise de Fadiga", prompt: "Analise os níveis de fadiga da tripulação atual", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "optimize", label: "Otimizar Escala", prompt: "Otimize a escala de embarque considerando certificações e fadiga", action: "optimize", icon: <Zap className="h-4 w-4" /> },
    { id: "predict", label: "Prever Turnover", prompt: "Preveja risco de turnover da tripulação", action: "predict", icon: <TrendingUp className="h-4 w-4" /> }
  ],
  procurement: [
    { id: "predict", label: "Prever Necessidades", prompt: "Preveja necessidades de compras para próximo mês", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "analyze", label: "Análise TCO", prompt: "Analise o custo total de propriedade dos equipamentos", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "suggest", label: "Sugerir Fornecedores", prompt: "Sugira os melhores fornecedores para os itens pendentes", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "optimize", label: "Otimizar Estoque", prompt: "Otimize os níveis de estoque considerando lead times", action: "optimize", icon: <Zap className="h-4 w-4" /> }
  ],
  voyage: [
    { id: "optimize", label: "Otimizar Rota", prompt: "Otimize a rota considerando clima, combustível e custos", action: "optimize", icon: <Target className="h-4 w-4" /> },
    { id: "analyze", label: "Análise Integrada", prompt: "Analise a viagem considerando crew, manutenção e bunker", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "predict", label: "Prever Consumo", prompt: "Preveja o consumo de combustível para a viagem", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "suggest", label: "Sugestões de Parada", prompt: "Sugira os melhores portos para abastecimento e descanso", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> }
  ],
  qhse: [
    { id: "analyze", label: "Gaps de Compliance", prompt: "Analise gaps de conformidade ISM/ISPS", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "generate", label: "Gerar Evidências", prompt: "Gere evidências de conformidade para auditoria", action: "generate", icon: <FileText className="h-4 w-4" /> },
    { id: "predict", label: "Prever Riscos", prompt: "Preveja riscos de não-conformidade", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "suggest", label: "Preparar Vetting", prompt: "Sugira ações para preparação de vetting OCIMF/TMSA", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> }
  ],
  training: [
    { id: "generate", label: "Criar Trilha", prompt: "Crie uma trilha de treinamento personalizada", action: "generate", icon: <FileText className="h-4 w-4" /> },
    { id: "analyze", label: "Analisar Competências", prompt: "Analise gaps de competência do tripulante", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "suggest", label: "Sugerir Certificações", prompt: "Sugira certificações prioritárias", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "generate", label: "Gerar Quiz", prompt: "Gere um quiz de avaliação sobre o tema", action: "generate", icon: <Zap className="h-4 w-4" /> }
  ],
  peodp: [
    { id: "generate", label: "Gerar Evidências", prompt: "Gere evidências de conformidade para auditoria PEO-DP", action: "generate", icon: <FileText className="h-4 w-4" /> },
    { id: "analyze", label: "Analisar Pilares", prompt: "Analise conformidade dos 7 pilares do PEO-DP", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "suggest", label: "ASOG Status", prompt: "Sugira o status ASOG adequado para condições atuais", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "chat", label: "Dúvidas IMCA/IMO", prompt: "Responda dúvidas sobre normas IMCA, IMO, NORMAM", action: "chat", icon: <MessageSquare className="h-4 w-4" /> }
  ],
  finance: [
    { id: "analyze", label: "Análise OPEX", prompt: "Analise os custos operacionais e identifique anomalias", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "predict", label: "Prever Budget", prompt: "Preveja despesas para próximo trimestre", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "suggest", label: "Otimizar Custos", prompt: "Sugira otimizações de custos operacionais", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "generate", label: "Relatório Financeiro", prompt: "Gere relatório financeiro executivo", action: "generate", icon: <FileText className="h-4 w-4" /> }
  ],
  command: [
    { id: "analyze", label: "Visão 360°", prompt: "Dê uma visão geral do status de toda operação", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "predict", label: "Alertas Críticos", prompt: "Identifique e priorize alertas críticos", action: "predict", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "suggest", label: "Ações Prioritárias", prompt: "Sugira ações prioritárias para hoje", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "generate", label: "Briefing Diário", prompt: "Gere briefing executivo do dia", action: "generate", icon: <FileText className="h-4 w-4" /> }
  ],
  general: [
    { id: "chat", label: "Perguntar", prompt: "", action: "chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "analyze", label: "Analisar", prompt: "", action: "analyze", icon: <Search className="h-4 w-4" /> },
    { id: "suggest", label: "Sugerir", prompt: "", action: "suggest", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "generate", label: "Gerar", prompt: "", action: "generate", icon: <FileText className="h-4 w-4" /> }
  ]
};

export const AIModuleEnhancer = memo(function({
  module,
  title,
  description,
  quickActions,
  context = {},
  compact = false,
  className = ""
}: AIModuleEnhancerProps) {
  const { query, isLoading } = useNautilusAI();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const actions = quickActions || DEFAULT_ACTIONS[module] || DEFAULT_ACTIONS.general;

  const handleQuery = async (action: QuickAction) => {
    const prompt = action.prompt || input;
    if (!prompt.trim()) {
      toast.error("Digite uma pergunta ou selecione uma ação");
      return;
    }

    const result = await query({
      module,
      action: action.action,
      prompt,
      context
    });

    if (result) {
      setResponse(result.response);
      setSuggestions(result.suggestions || []);
    }
  };

  const handleSend = () => {
    handleQuery({ id: "custom", label: "Custom", prompt: input, action: "chat", icon: null });
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      toast.success("Copiado!");
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={input}
          onChange={handleChange}
          onKeyPress={(e) => e.key === "Enter" && handleSend(}
          placeholder="Pergunte à IA..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                {title || "Assistente IA"}
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  LLM
                </Badge>
              </CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handlehandleQuery}
              disabled={isLoading}
              className="text-xs"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleChange}
            onKeyPress={(e) => e.key === "Enter" && handleSend(}
            placeholder="Ou faça sua pergunta..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">Resposta IA</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyResponse}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-60">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {response}
              </div>
            </ScrollArea>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {suggestions.map((s, i) => (
                  <Button
                    key={i}
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7"
                    onClick={handleSetInput}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIModuleEnhancer;
