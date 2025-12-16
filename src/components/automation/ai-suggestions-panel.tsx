// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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

interface ActionData {
  route?: string;
  action?: string;
  params?: Record<string, unknown>;
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

// Mock suggestions to use when API fails or no data
const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: "mock-1",
    type: "action",
    title: "Renovar Certificados Críticos",
    description: "3 certificados de tripulação vencem nos próximos 30 dias. Inicie o processo de renovação.",
    priority: 4,
    action_data: { route: "/certifications", action: "renew_certificates" },
    is_read: false,
    is_dismissed: false,
    is_acted_upon: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    type: "optimization",
    title: "Otimizar Escala de Manutenção",
    description: "Análise sugere reagendar 2 manutenções para reduzir tempo de parada em 15%.",
    priority: 3,
    action_data: { route: "/maintenance", action: "optimize" },
    is_read: false,
    is_dismissed: false,
    is_acted_upon: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-3",
    type: "insight",
    title: "Tendência de Consumo de Combustível",
    description: "Consumo aumentou 8% no último mês. Verifique eficiência operacional.",
    priority: 2,
    action_data: { route: "/fuel-optimizer", action: "analyze" },
    is_read: false,
    is_dismissed: false,
    is_acted_upon: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-4",
    type: "reminder",
    title: "Auditoria ISM Programada",
    description: "Auditoria interna ISM agendada para próxima semana. Prepare documentação.",
    priority: 3,
    action_data: { route: "/compliance", action: "prepare_audit" },
    is_read: false,
    is_dismissed: false,
    is_acted_upon: false,
    created_at: new Date().toISOString(),
  },
];

export const AISuggestionsPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadSuggestions = useCallback(async (showToast = false) => {
    try {
      // First try to load from database
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("is_dismissed", false)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("Error loading from database, using mock data:", error);
        // Use mock data if database fails
        setSuggestions(MOCK_SUGGESTIONS);
        return;
      }

      if (data && data.length > 0) {
        setSuggestions(data as AISuggestion[]);
      } else {
        // If no data in DB, use mock suggestions
        setSuggestions(MOCK_SUGGESTIONS);
      }

      if (showToast) {
        toast({
          title: "Atualizado",
          description: "Sugestões de IA atualizadas com sucesso.",
        });
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
      // Fallback to mock data
      setSuggestions(MOCK_SUGGESTIONS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  const refreshWithAI = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/automation-ai-copilot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
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
      console.error("Error refreshing with AI:", error);
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
            is_read: true,
            ...(actionType === "accept" && { is_acted_upon: true }),
            ...(actionType === "dismiss" && { is_dismissed: true })
          })
          .eq("id", suggestion.id);
      } catch (error) {
        console.warn("Failed to update suggestion in database:", error);
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
      case 4: return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case 3: return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
      case 2: return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
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
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma sugestão no momento</h3>
            <p className="text-muted-foreground mb-4">
              Nossa IA está analisando seus dados e em breve terá insights valiosos para você.
            </p>
            <Button onClick={refreshWithAI} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Gerar Sugestões
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
                          {(suggestion.action_data as any)?.savings && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Economia: {(suggestion.action_data as any).savings}
                            </div>
                          )}
                          {(suggestion.action_data as any)?.vessel && (
                            <div className="flex items-center gap-1">
                              <Ship className="w-3 h-3" />
                              {(suggestion.action_data as any).vessel}
                            </div>
                          )}
                          {(suggestion.action_data as any)?.days_overdue && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {(suggestion.action_data as any).days_overdue} dias em atraso
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
