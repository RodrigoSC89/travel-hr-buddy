import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AISuggestion {
  id: string;
  type: 'action' | 'insight' | 'reminder' | 'optimization';
  title: string;
  description: string;
  priority: number;
  action_data: any;
  is_read: boolean;
  is_dismissed: boolean;
  is_acted_upon: boolean;
  created_at: string;
  valid_until?: string;
}

export const AISuggestionsPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data as AISuggestion[] || []);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões da IA.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (suggestion: AISuggestion, actionType: 'accept' | 'dismiss') => {
    try {
      const updates: Partial<AISuggestion> = {
        is_read: true,
        ...(actionType === 'accept' && { is_acted_upon: true }),
        ...(actionType === 'dismiss' && { is_dismissed: true })
      };

      const { error } = await supabase
        .from('ai_suggestions')
        .update(updates)
        .eq('id', suggestion.id);

      if (error) throw error;

      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestion.id 
            ? { ...s, ...updates }
            : s
        ).filter(s => !s.is_dismissed)
      );

      if (actionType === 'accept') {
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
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a ação.",
        variant: "destructive"
      });
    }
  };

  const executeAction = async (suggestion: AISuggestion) => {
    const { action_data } = suggestion;
    
    switch (action_data.action) {
      case 'renew_certificates':
        // Redirecionar para a página de certificados
        window.location.href = '/maritime-certifications';
        break;
      case 'review_schedule':
        // Redirecionar para a página de escalas
        window.location.href = '/crew-management';
        break;
      case 'assign_auditor':
        // Abrir modal de atribuição de auditor
        // Implementar lógica específica
        break;
      default:
        console.log('Ação não implementada:', action_data.action);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'action': return CheckCircle;
      case 'insight': return Lightbulb;
      case 'reminder': return Clock;
      case 'optimization': return TrendingUp;
      default: return Zap;
    }
  };

  const getSuggestionColor = (priority: number) => {
    switch (priority) {
      case 4: return 'bg-red-100 text-red-800 border-red-200';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgente';
      case 3: return 'Alta';
      case 2: return 'Média';
      default: return 'Baixa';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'action': return 'Ação Requerida';
      case 'insight': return 'Insight';
      case 'reminder': return 'Lembrete';
      case 'optimization': return 'Otimização';
      default: return type;
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.type === filter;
  });

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Sugestões da IA</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'action' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('action')}
          >
            Ações
          </Button>
          <Button
            variant={filter === 'optimization' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('optimization')}
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
            <p className="text-muted-foreground">
              Nossa IA está analisando seus dados e em breve terá insights valiosos para você.
            </p>
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
                  !suggestion.is_read ? 'border-l-4 border-l-primary' : ''
                } ${isExpired ? 'opacity-60' : ''}`}
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
                          {suggestion.type === 'action' && !suggestion.is_acted_upon && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(suggestion, 'accept')}
                              className="h-8 px-3"
                            >
                              Executar
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(suggestion, 'dismiss')}
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
                          {suggestion.action_data.savings && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Economia: {suggestion.action_data.savings}
                            </div>
                          )}
                          {suggestion.action_data.vessel && (
                            <div className="flex items-center gap-1">
                              <Ship className="w-3 h-3" />
                              {suggestion.action_data.vessel}
                            </div>
                          )}
                          {suggestion.action_data.days_overdue && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {suggestion.action_data.days_overdue} dias em atraso
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(suggestion.created_at).toLocaleString('pt-BR')}
                        {suggestion.valid_until && (
                          <span className="ml-2">
                            • Válido até {new Date(suggestion.valid_until).toLocaleDateString('pt-BR')}
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