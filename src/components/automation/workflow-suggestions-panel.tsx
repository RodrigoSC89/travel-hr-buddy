import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWorkflowSuggestions, updateSuggestion } from "@/lib/workflows/seedSuggestions";

interface WorkflowSuggestion {
  id: string;
  workflow_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pendente' | 'em_progresso' | 'concluido' | 'dispensado';
  suggestion_type: 'checklist' | 'compliance' | 'optimization' | 'reminder';
  origin_source: 'template' | 'ai_generated' | 'historical';
  metadata: Record<string, unknown>;
  created_at: string;
  is_acted_upon: boolean;
  is_dismissed: boolean;
}

interface WorkflowSuggestionsPanelProps {
  workflowId: string;
}

export const WorkflowSuggestionsPanel: React.FC<WorkflowSuggestionsPanelProps> = ({ workflowId }) => {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const data = await getWorkflowSuggestions(workflowId);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [workflowId]);

  const handleDismiss = async (suggestionId: string) => {
    try {
      await updateSuggestion(suggestionId, { is_dismissed: true });
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      toast({
        title: "Sugestão dispensada",
        description: "A sugestão foi removida da sua lista."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível dispensar a sugestão.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsActedUpon = async (suggestionId: string) => {
    try {
      await updateSuggestion(suggestionId, { 
        is_acted_upon: true,
        status: 'concluido'
      });
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, is_acted_upon: true, status: 'concluido' as const }
            : s
        )
      );
      toast({
        title: "Ação executada!",
        description: "A sugestão foi marcada como concluída."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a sugestão.",
        variant: "destructive"
      });
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "checklist": return CheckCircle;
      case "compliance": return AlertTriangle;
      case "optimization": return TrendingUp;
      case "reminder": return Clock;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Média";
      default: return "Baixa";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "checklist": return "Checklist";
      case "compliance": return "Conformidade";
      case "optimization": return "Otimização";
      case "reminder": return "Lembrete";
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            🤖 Sugestões Automáticas da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Todas as sugestões foram processadas</h3>
          <p className="text-muted-foreground">
            Ótimo trabalho! Você já implementou todas as sugestões para este workflow.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          🤖 Sugestões Automáticas da IA
          <Badge variant="secondary" className="ml-auto">
            {suggestions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const Icon = getSuggestionIcon(suggestion.suggestion_type);
            
            return (
              <Card 
                key={suggestion.id} 
                className={`p-4 transition-all duration-200 hover:shadow-md ${
                  suggestion.status === 'concluido' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(suggestion.suggestion_type)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                          >
                            {getPriorityLabel(suggestion.priority)}
                          </Badge>
                          {suggestion.origin_source === 'template' && (
                            <Badge variant="secondary" className="text-xs">
                              Template Histórico
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {suggestion.status !== 'concluido' && !suggestion.is_acted_upon && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsActedUpon(suggestion.id)}
                            className="h-8 px-3"
                          >
                            Concluir
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                        {suggestion.status === 'concluido' && (
                          <Badge variant="default" className="text-xs">
                            ✓ Concluído
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(suggestion.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.metadata && Object.keys(suggestion.metadata).length > 0 && (
                      <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                        {suggestion.metadata.category && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {String(suggestion.metadata.category)}
                          </div>
                        )}
                        {suggestion.metadata.estimated_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Tempo estimado: {String(suggestion.metadata.estimated_time)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
