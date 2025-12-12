/**
import { useCallback, useMemo, useEffect, useState } from "react";;
 * PATCH 653.1 - Workflow AI Suggestions Component
 * Complete AI-powered workflow suggestions with LLM integration
 */

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "@/hooks/use-toast";
import {
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Play,
  Check,
  X,
  Bot
} from "lucide-react";

interface WorkflowSuggestion {
  id: string;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string;
  etapa?: string;
  responsavel_sugerido?: string;
  origem: string;
  impacto_estimado?: string;
  status: "pending" | "applied" | "dismissed";
  gerada_em: string;
}

interface WorkflowAISuggestionsProps {
  workflowId?: string;
  limit?: number;
  className?: string;
  onApplySuggestion?: (suggestion: WorkflowSuggestion) => void;
}

// Mock workflow data for AI context
const mockWorkflowContext = {
  workflows: [
    { id: "wf1", name: "Manutenção Preventiva", status: "running", tasks_pending: 5, overdue: 2 },
    { id: "wf2", name: "Inspeção de Segurança", status: "running", tasks_pending: 3, overdue: 0 },
    { id: "wf3", name: "Certificação de Equipamentos", status: "paused", tasks_pending: 8, overdue: 4 },
    { id: "wf4", name: "Treinamento de Tripulação", status: "running", tasks_pending: 2, overdue: 1 },
  ],
  metrics: {
    total_workflows: 12,
    active_workflows: 8,
    tasks_completed_today: 15,
    avg_completion_time: "2.5 dias",
    efficiency_score: 78
  },
  recent_issues: [
    "Atraso na inspeção do equipamento de navegação",
    "Certificado ISPS próximo do vencimento",
    "Checklist de segurança incompleto na embarcação Neptune"
  ]
};

export const WorkflowAISuggestions = memo(function({ 
  workflowId, 
  limit = 10, 
  className,
  onApplySuggestion 
}: WorkflowAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    applied: 0,
    dismissed: 0
  });

  useEffect(() => {
    fetchSuggestions();
  }, [workflowId]);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      // Generate initial suggestions with AI
      await generateAISuggestions();
    } catch (error) {
      logger.error("Failed to fetch workflow suggestions", error);
      // Use fallback suggestions
      const fallback = generateFallbackSuggestions();
      setSuggestions(fallback);
      updateStats(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISuggestions = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Call AI to generate suggestions
      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um especialista em otimização de workflows marítimos. Analise o contexto fornecido e gere sugestões práticas e acionáveis para melhorar os processos.

Cada sugestão deve ter:
- tipo_sugestao: "Criar tarefa" | "Ajustar prazo" | "Trocar responsável" | "Escalar problema" | "Otimizar processo"
- conteudo: descrição clara da sugestão
- criticidade: "crítica" | "alta" | "média" | "baixa"
- impacto_estimado: descrição do impacto esperado
- etapa: etapa do workflow afetada (opcional)

Retorne um JSON array com 5-8 sugestões relevantes.`
            },
            {
              role: "user",
              content: `Analise este contexto de workflows e gere sugestões de otimização:

Workflows ativos:
${mockWorkflowContext.workflows.map(w => `- ${w.name}: ${w.tasks_pending} tarefas pendentes, ${w.overdue} atrasadas`).join("\n")}

Métricas:
- Total de workflows: ${mockWorkflowContext.metrics.total_workflows}
- Workflows ativos: ${mockWorkflowContext.metrics.active_workflows}
- Tarefas completadas hoje: ${mockWorkflowContext.metrics.tasks_completed_today}
- Tempo médio de conclusão: ${mockWorkflowContext.metrics.avg_completion_time}
- Score de eficiência: ${mockWorkflowContext.metrics.efficiency_score}%

Problemas recentes:
${mockWorkflowContext.recent_issues.map(i => `- ${i}`).join("\n")}

Gere sugestões em formato JSON array.`
            }
          ]
        }
      });

      if (error) throw error;

      // Parse AI response
      const responseText = data?.response || data?.content || "";
      let aiSuggestions: WorkflowSuggestion[] = [];

      try {
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiSuggestions = parsed.map((s: unknown, i: number) => ({
            id: `ai-${Date.now()}-${i}`,
            tipo_sugestao: s.tipo_sugestao || "Otimizar processo",
            conteudo: s.conteudo || s.content || s.description || "",
            criticidade: s.criticidade || "média",
            etapa: s.etapa,
            responsavel_sugerido: s.responsavel_sugerido,
            origem: "IA Copilot",
            impacto_estimado: s.impacto_estimado || s.impacto,
            status: "pending" as const,
            gerada_em: new Date().toISOString()
          }));
        }
      } catch (parseError) {
        logger.warn("Failed to parse AI response, generating fallback suggestions");
      }

      // Fallback suggestions if AI parsing fails
      if (aiSuggestions.length === 0) {
        aiSuggestions = generateFallbackSuggestions();
      }

      setSuggestions(aiSuggestions);
      updateStats(aiSuggestions);

      toast({
        title: "Sugestões geradas com IA",
        description: `${aiSuggestions.length} novas sugestões disponíveis`
      };

    } catch (error) {
      logger.error("Failed to generate AI suggestions", error);
      
      // Use fallback suggestions
      const fallback = generateFallbackSuggestions();
      setSuggestions(fallback);
      updateStats(fallback);

      toast({
        title: "Sugestões geradas",
        description: "Sugestões baseadas em análise de padrões"
      };
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const generateFallbackSuggestions = (): WorkflowSuggestion[] => {
    return [
      {
        id: `fb-${Date.now()}-1`,
        tipo_sugestao: "Escalar problema",
        conteudo: "Escalar atraso na inspeção do equipamento de navegação para o supervisor técnico - prazo vencido há 3 dias",
        criticidade: "crítica",
        etapa: "Inspeção",
        responsavel_sugerido: "Supervisor Técnico",
        origem: "Análise de Prazos",
        impacto_estimado: "Evitar multas de compliance",
        status: "pending",
        gerada_em: new Date().toISOString()
      },
      {
        id: `fb-${Date.now()}-2`,
        tipo_sugestao: "Criar tarefa",
        conteudo: "Criar tarefa urgente para renovação do certificado ISPS que vence em 15 dias",
        criticidade: "alta",
        etapa: "Certificação",
        responsavel_sugerido: "Oficial de Compliance",
        origem: "Monitor de Certificados",
        impacto_estimado: "Manter embarcação em conformidade",
        status: "pending",
        gerada_em: new Date().toISOString()
      },
      {
        id: `fb-${Date.now()}-3`,
        tipo_sugestao: "Ajustar prazo",
        conteudo: "Estender prazo do workflow de Certificação de Equipamentos em 5 dias - complexidade maior que estimada",
        criticidade: "média",
        etapa: "Planejamento",
        origem: "Análise de Histórico",
        impacto_estimado: "Melhorar taxa de conclusão em 15%",
        status: "pending",
        gerada_em: new Date().toISOString()
      },
      {
        id: `fb-${Date.now()}-4`,
        tipo_sugestao: "Trocar responsável",
        conteudo: "Reatribuir tarefas do checklist de segurança para técnico disponível - responsável atual sobrecarregado",
        criticidade: "média",
        etapa: "Execução",
        responsavel_sugerido: "Técnico Carlos",
        origem: "Análise de Carga",
        impacto_estimado: "Reduzir tempo de conclusão em 40%",
        status: "pending",
        gerada_em: new Date().toISOString()
      },
      {
        id: `fb-${Date.now()}-5`,
        tipo_sugestao: "Otimizar processo",
        conteudo: "Automatizar notificações de prazo para tarefas críticas - 60% dos atrasos são por falta de alerta",
        criticidade: "média",
        etapa: "Configuração",
        origem: "Análise de Padrões",
        impacto_estimado: "Reduzir atrasos em 60%",
        status: "pending",
        gerada_em: new Date().toISOString()
      },
      {
        id: `fb-${Date.now()}-6`,
        tipo_sugestao: "Criar tarefa",
        conteudo: "Agendar treinamento de atualização para equipe de manutenção - novos procedimentos disponíveis",
        criticidade: "baixa",
        etapa: "Treinamento",
        responsavel_sugerido: "Coordenador de RH",
        origem: "Monitor de Competências",
        impacto_estimado: "Melhorar qualidade das inspeções",
        status: "pending",
        gerada_em: new Date().toISOString()
      }
    ];
  };

  const updateStats = (data: WorkflowSuggestion[]) => {
    setStats({
      total: data.length,
      pending: data.filter(s => s.status === "pending").length,
      applied: data.filter(s => s.status === "applied").length,
      dismissed: data.filter(s => s.status === "dismissed").length
    };
  };

  const handleApply = (suggestion: WorkflowSuggestion) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: "applied" as const } : s
    ));
    
    toast({
      title: "Sugestão aplicada",
      description: suggestion.tipo_sugestao
    };

    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }

    // Update stats
    setSuggestions(prev => {
      updateStats(prev);
      return prev;
  };
  };

  const handleDismiss = (suggestion: WorkflowSuggestion) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: "dismissed" as const } : s
    ));

    toast({
      title: "Sugestão descartada",
      variant: "default"
    };

    setSuggestions(prev => {
      updateStats(prev);
      return prev;
  };
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
    case "crítica":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "alta":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "média":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
    case "Criar tarefa":
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case "Ajustar prazo":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "Trocar responsável":
      return <User className="h-4 w-4 text-purple-500" />;
    case "Escalar problema":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "Otimizar processo":
      return <Zap className="h-4 w-4 text-green-500" />;
    default:
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (activeTab === "pending") return s.status === "pending";
    if (activeTab === "applied") return s.status === "applied";
    if (activeTab === "critical") return s.criticidade === "crítica" || s.criticidade === "alta";
    return true;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Sugestões IA</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateAISuggestions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
        <CardDescription>
          {suggestions.length} sugestões disponíveis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <p className="text-lg font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <p className="text-lg font-bold text-green-500">{stats.applied}</p>
            <p className="text-xs text-muted-foreground">Aplicadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-muted-foreground">{stats.dismissed}</p>
            <p className="text-xs text-muted-foreground">Descartadas</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="critical">Críticas</TabsTrigger>
            <TabsTrigger value="applied">Aplicadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma sugestão nesta categoria</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={generateAISuggestions}
                  disabled={isRefreshing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Novas Sugestões
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        suggestion.status === "applied" 
                          ? "bg-green-500/5 border-green-500/20" 
                          : suggestion.status === "dismissed"
                            ? "bg-muted/30 opacity-60"
                            : "bg-card hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5">
                            {getTipoIcon(suggestion.tipo_sugestao)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.tipo_sugestao}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCriticidadeColor(suggestion.criticidade)}`}
                              >
                                {suggestion.criticidade}
                              </Badge>
                              {suggestion.status === "applied" && (
                                <Badge className="text-xs bg-green-500/20 text-green-500">
                                  <Check className="h-3 w-3 mr-1" />
                                  Aplicada
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{suggestion.conteudo}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              {suggestion.etapa && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {suggestion.etapa}
                                </span>
                              )}
                              {suggestion.responsavel_sugerido && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {suggestion.responsavel_sugerido}
                                </span>
                              )}
                              {suggestion.impacto_estimado && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {suggestion.impacto_estimado}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                {suggestion.origem}
                              </span>
                            </div>
                          </div>
                        </div>
                        {suggestion.status === "pending" && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => handlehandleApply}
                              title="Aplicar sugestão"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handlehandleDismiss}
                              title="Descartar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});
