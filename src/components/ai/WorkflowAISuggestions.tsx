// @ts-nocheck
/**
 * PATCH 653 - Workflow AI Suggestions Component
 * Displays and manages AI-generated workflow suggestions
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronRight
} from "lucide-react";

interface WorkflowSuggestion {
  id: string;
  workflow_id: string;
  etapa: string | null;
  tipo_sugestao: string;
  conteudo: string;
  criticidade: string | null;
  responsavel_sugerido: string | null;
  origem: string | null;
  gerada_em: string;
}

interface WorkflowAISuggestionsProps {
  workflowId?: string;
  limit?: number;
  className?: string;
  onApplySuggestion?: (suggestion: WorkflowSuggestion) => void;
}

export function WorkflowAISuggestions({ 
  workflowId, 
  limit = 10, 
  className,
  onApplySuggestion 
}: WorkflowAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [workflowId]);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("workflow_ai_suggestions")
        .select("*")
        .order("gerada_em", { ascending: false })
        .limit(limit);

      if (workflowId) {
        query = query.eq("workflow_id", workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSuggestions(data || []);
    } catch (error) {
      logger.error("Failed to fetch workflow suggestions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewSuggestions = async () => {
    if (!workflowId) {
      toast({
        title: "Erro",
        description: "ID do workflow é necessário para gerar sugestões",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRefreshing(true);

      const { data, error } = await supabase.functions.invoke("workflows-copilot-suggest", {
        body: {
          context: {
            workflow_id: workflowId,
            workflow_name: "Workflow Atual",
            logs: ["Verificação pendente", "Checklist incompleto"],
            prazos_vencidos: []
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sugestões geradas",
        description: `${data.suggestions?.length || 0} novas sugestões disponíveis`
      });

      await fetchSuggestions();
    } catch (error) {
      logger.error("Failed to generate suggestions", error);
      toast({
        title: "Erro ao gerar sugestões",
        description: "Não foi possível gerar novas sugestões. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCriticidadeColor = (criticidade: string | null) => {
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
        return <CheckCircle2 className="h-4 w-4" />;
      case "Ajustar prazo":
        return <Clock className="h-4 w-4" />;
      case "Trocar responsável":
        return <User className="h-4 w-4" />;
      case "Escalar problema":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
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
            onClick={generateNewSuggestions}
            disabled={isRefreshing || !workflowId}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
        <CardDescription>
          {suggestions.length} sugestões disponíveis
        </CardDescription>
      </CardHeader>

      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma sugestão disponível</p>
            {workflowId && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={generateNewSuggestions}
                disabled={isRefreshing}
              >
                Gerar Sugestões
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
                            {suggestion.criticidade || "baixa"}
                          </Badge>
                        </div>
                        <p className="text-sm">{suggestion.conteudo}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {suggestion.etapa && (
                            <span>Etapa: {suggestion.etapa}</span>
                          )}
                          {suggestion.responsavel_sugerido && (
                            <span>→ {suggestion.responsavel_sugerido}</span>
                          )}
                          <span>{suggestion.origem}</span>
                        </div>
                      </div>
                    </div>
                    {onApplySuggestion && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => onApplySuggestion(suggestion)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
