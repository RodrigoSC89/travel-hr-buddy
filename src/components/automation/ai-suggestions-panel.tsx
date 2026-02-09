// AI Suggestions Panel - Fully Interactive
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  X,
  Clock,
  Users,
  Ship,
  FileText,
  ChevronRight,
  Zap,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from '@/lib/supabase/edge-function-helper';

interface ActionData {
  route?: string;
  action?: string;
  params?: Record<string, unknown>;
  savings?: string;
  vessel?: string;
  days_overdue?: number;
  [key: string]: unknown;
}

interface AISuggestion {
  id: string;
  type: "action" | "insight" | "reminder" | "optimization";
  title: string;
  description: string;
  priority: number;
  action_data: ActionData;
  is_read: boolean;
  is_dismissed: boolean;
  is_acted_upon: boolean;
  created_at: string;
  valid_until?: string;
}

// Map DB schema to local interface
const mapDbToSuggestion = (dbItem: Record<string, unknown>): AISuggestion => ({
  id: String(dbItem.id || ''),
  type: (dbItem.suggestion_type as AISuggestion['type']) || 'action',
  title: String(dbItem.title || dbItem.suggestion_type || 'Sugestão'),
  description: String(dbItem.description || ''),
  priority: Number(dbItem.priority || 2),
  action_data: (dbItem.action_data as ActionData) || {},
  is_read: Boolean(dbItem.is_read),
  is_dismissed: Boolean(dbItem.is_dismissed),
  is_acted_upon: Boolean(dbItem.applied_at),
  created_at: String(dbItem.created_at || new Date().toISOString()),
  valid_until: dbItem.valid_until ? String(dbItem.valid_until) : undefined,
});

export const AISuggestionsPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadSuggestions = useCallback(async (showToast = false) => {
    try {
      // Load from database - no mock fallback
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("is_dismissed", false)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        logger.warn("Error loading suggestions from database", { error });
        setSuggestions([]);
        return;
      }

      if (data && data.length > 0) {
        // Map DB data to local interface
        const mappedSuggestions = data.map(item => mapDbToSuggestion(item as Record<string, unknown>));
        setSuggestions(mappedSuggestions);
      } else {
        // Empty state - no mock data
        setSuggestions([]);
      }

      if (showToast) {
        toast({
          title: "Atualizado",
          description: "Sugestões de IA atualizadas com sucesso.",
        });
      }
    } catch (error) {
      logger.error("Error loading suggestions:", error);
      // Empty state on error - no mock fallback
      setSuggestions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  const refreshWithAI = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        getEdgeFunctionUrl('automation-ai-copilot'),
        {
          method: "POST",
          headers: getEdgeFunctionHeaders(),
          body: JSON.stringify({ type: "ai_suggestions" }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        try {
          const parsed = JSON.parse(data.result);
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            const newSuggestions = parsed.suggestions.map((s: any, idx: number) => ({
              ...s,
              id: s.id || `ai-${Date.now()}-${idx}`,
              is_read: false,
              is_dismissed: false,
              is_acted_upon: false,
              created_at: new Date().toISOString(),
              action_data: s.action_data || {},
            }));
            setSuggestions(prev => [...newSuggestions, ...prev.slice(0, 10)]);
            toast({
              title: "Novas sugestões",
              description: `${newSuggestions.length} sugestões geradas pela IA.`,
            });
          }
        } catch {
          // If parsing fails, just reload from database
          await loadSuggestions(true);
        }
      } else {
        await loadSuggestions(true);
      }
    } catch (error) {
      logger.error("Error refreshing with AI:", error);
      await loadSuggestions(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAction = async (suggestion: AISuggestion, actionType: "accept" | "dismiss") => {
    // Optimistically update UI
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { 
              ...s, 
              is_read: true,
              ...(actionType === "accept" && { is_acted_upon: true }),
              ...(actionType === "dismiss" && { is_dismissed: true })
            }
          : s
      ).filter(s => !s.is_dismissed)
    );

    // Try to update database (don't block UI on failure)
    if (!suggestion.id.startsWith("mock-") && !suggestion.id.startsWith("ai-")) {
      try {
        await supabase
          .from("ai_suggestions")
          .update({
            applied_at: actionType === "accept" ? new Date().toISOString() : null,
            is_dismissed: actionType === "dismiss"
          })
          .eq("id", suggestion.id);
      } catch (error) {
        // Silent fail - non-blocking operation
      }
    }

    if (actionType === "accept") {
      await executeAction(suggestion);
      toast({
        title: "Ação executada!",
        description: "A sugestão da IA foi implementada com sucesso.",
      });
    } else {
      toast({
        title: "Sugestão dispensada",
        description: "A sugestão foi removida da sua lista.",
      });
    }
  };

  const executeAction = async (suggestion: AISuggestion) => {
    const { action_data } = suggestion;
    
    if (action_data.route) {
      navigate(action_data.route);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "action": return CheckCircle;
      case "insight": return Lightbulb;
      case "reminder": return Clock;
      case "optimization": return TrendingUp;
      default: return Zap;
    }
  };

  const getSuggestionColor = (priority: number) => {
    switch (priority) {
      case 4: return "bg-destructive/10 text-destructive border-destructive/20";
      case 3: return "bg-warning/10 text-warning border-warning/20";
      case 2: return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return "Urgente";
      case 3: return "Alta";
      case 2: return "Média";
      default: return "Baixa";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "action": return "Ação Requerida";
      case "insight": return "Insight";
      case "reminder": return "Lembrete";
      case "optimization": return "Otimização";
      default: return type;
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === "all") return true;
    return suggestion.type === filter;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando sugestões...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Sugestões da IA</h2>
          <Badge variant="secondary" className="ml-2">
            {filteredSuggestions.length}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshWithAI}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Atualizar
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "action" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("action")}
          >
            Ações
          </Button>
          <Button
            variant={filter === "optimization" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("optimization")}
          >
            Otimizações
          </Button>
        </div>
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Análise Concluída</h3>
            <p className="text-muted-foreground mb-4">
              Nenhuma ação urgente identificada. Seus processos estão otimizados.
            </p>
            <Button onClick={refreshWithAI} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar Análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.type);
            const isExpired = suggestion.valid_until && new Date(suggestion.valid_until) < new Date();
            
            return (
              <Card 
                key={suggestion.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  !suggestion.is_read ? "border-l-4 border-l-primary" : ""
                } ${isExpired ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.priority)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{suggestion.title}</h3>
                            {!suggestion.is_read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(suggestion.type)}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSuggestionColor(suggestion.priority)}`}
                            >
                              {getPriorityLabel(suggestion.priority)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {(suggestion.type === "action" || suggestion.action_data?.route) && !suggestion.is_acted_upon && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(suggestion, "accept")}
                              className="h-8 px-3"
                            >
                              Executar
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(suggestion, "dismiss")}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      
                      {suggestion.action_data && Object.keys(suggestion.action_data).length > 0 && (
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {(suggestion.action_data?.savings as unknown as string) && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Economia: {(suggestion.action_data.savings as unknown as string)}
                            </div>
                          )}
                          {(suggestion.action_data?.vessel as unknown as string) && (
                            <div className="flex items-center gap-1">
                              <Ship className="w-3 h-3" />
                              {(suggestion.action_data.vessel as unknown as string)}
                            </div>
                          )}
                          {(suggestion.action_data?.days_overdue as unknown as number) && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {(suggestion.action_data.days_overdue as unknown as number)} dias em atraso
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleString("pt-BR")}
                        {suggestion.valid_until && (
                          <span className="ml-2">
                            • Válido até {new Date(suggestion.valid_until).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
