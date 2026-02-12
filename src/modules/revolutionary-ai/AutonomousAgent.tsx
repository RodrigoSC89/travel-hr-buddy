/**
 * REVOLUTIONARY AI - Autonomous Agent (AI Ops)
 * Funcionalidade 6 & 10: Gestor Digital Autônomo + Agente Autônomo de Decisão
 * MIGRATED: Uses ai_decisions table from Supabase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, Zap, CheckCircle, AlertTriangle, Clock, 
  ShoppingCart, Wrench, FileText, Bell, Activity,
  Play, Pause, Settings, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Target, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentAction {
  id: string;
  type: 'purchase' | 'maintenance' | 'report' | 'alert' | 'optimization';
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
  result?: string;
  requiresApproval: boolean;
}

interface AgentMetrics {
  actionsToday: number;
  successRate: number;
  timeSaved: number;
  costSaved: number;
  activeRules: number;
}

// Fetch agent actions from ai_decisions
function useAgentActions() {
  return useQuery({
    queryKey: ['agent-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        type: (d.type || 'optimization') as AgentAction['type'],
        title: d.title,
        description: d.description,
        status: (d.status || 'pending') as AgentAction['status'],
        confidence: d.confidence || 85,
        impact: (d.impact || 'medium') as AgentAction['impact'],
        timestamp: new Date(d.created_at),
        result: d.justification_expected_outcome || undefined,
        requiresApproval: d.status === 'pending'
      } as AgentAction));
    },
    staleTime: 30 * 1000
  });
}

// Calculate metrics from actions
function useAgentMetrics(actions: AgentAction[]) {
  const today = new Date().toDateString();
  const actionsToday = actions.filter(a => a.timestamp.toDateString() === today).length;
  const completed = actions.filter(a => a.status === 'completed');
  const successRate = actions.length > 0 ? (completed.length / actions.length) * 100 : 0;

  return {
    actionsToday,
    successRate: Math.round(successRate * 10) / 10,
    timeSaved: actionsToday * 0.5,
    costSaved: completed.length * 650,
    activeRules: 18
  };
}

export function AutonomousAgent() {
  const queryClient = useQueryClient();
  const { data: actions = [], isLoading } = useAgentActions();
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  
  const metrics = useAgentMetrics(actions);

  const updateActionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('ai_decisions')
        .update({ status, executed_at: status === 'completed' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-actions'] });
      toast.success('Ação atualizada');
    }
  });

  const handleApprove = (actionId: string) => {
    updateActionMutation.mutate({ id: actionId, status: 'executing' });
  };

  const handleReject = (actionId: string) => {
    updateActionMutation.mutate({ id: actionId, status: 'cancelled' });
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'report': return <FileText className="h-4 w-4" />;
      case 'alert': return <Bell className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning/20 text-warning border-warning/30',
      executing: 'bg-info/20 text-info border-info/30',
      completed: 'bg-success/20 text-success border-success/30',
      failed: 'bg-destructive/20 text-destructive border-destructive/30',
      cancelled: 'bg-muted text-muted-foreground border-muted'
    };
    return colors[status as keyof typeof colors] || 'bg-muted';
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'text-destructive',
      medium: 'text-warning',
      low: 'text-success'
    };
    return colors[impact as keyof typeof colors] || 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isAgentActive ? 'bg-primary/20' : 'bg-muted'}`}>
                <Brain className={`h-8 w-8 ${isAgentActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Agente Autônomo
                  {isAgentActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </motion.div>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {isAgentActive ? 'Monitorando e agindo proativamente' : 'Pausado - Aguardando ativação'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Agente Ativo</span>
                <Switch
                  checked={isAgentActive}
                  onCheckedChange={setIsAgentActive}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast.info('Abrindo configuração de regras...', {
                    description: 'Configure as regras de decisão do agente autônomo.'
                  });
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Regras
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.actionsToday}</p>
            <p className="text-xs text-muted-foreground">Ações Hoje</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.successRate}%</p>
            <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.timeSaved}h</p>
            <p className="text-xs text-muted-foreground">Tempo Economizado</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">R${(metrics.costSaved/1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Custo Economizado</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Settings className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{metrics.activeRules}</p>
            <p className="text-xs text-muted-foreground">Regras Ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Feed de Ações
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['agent-actions'] })}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {actions.map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            selectedAction?.id === action.id ? 'border-primary ring-2 ring-primary/20' : ''
                          }`}
                          onClick={() => setSelectedAction(action)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                action.status === 'executing' ? 'bg-info/20 text-info' :
                                action.status === 'completed' ? 'bg-success/20 text-success' :
                                action.status === 'pending' ? 'bg-warning/20 text-warning' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {getActionIcon(action.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{action.title}</h4>
                                  <Badge variant="outline" className={getStatusColor(action.status)}>
                                    {action.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {action.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Brain className="h-3 w-3 text-primary" />
                                    {action.confidence}%
                                  </span>
                                  <span className={`flex items-center gap-1 ${getImpactColor(action.impact)}`}>
                                    <Target className="h-3 w-3" />
                                    {action.impact}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {action.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              {action.status === 'pending' && action.requiresApproval && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-success hover:bg-success/20"
                                    onClick={(e) => { e.stopPropagation(); handleApprove(action.id); }}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/20"
                                    onClick={(e) => { e.stopPropagation(); handleReject(action.id); }}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {action.result && (
                              <div className="mt-3 p-2 rounded bg-success/10 text-xs text-success">
                                ✓ {action.result}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Action Details */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedAction ? 'Detalhes da Ação' : 'Selecione uma ação'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAction ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      selectedAction.status === 'completed' ? 'bg-success/20 text-success' :
                      selectedAction.status === 'executing' ? 'bg-info/20 text-info' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {getActionIcon(selectedAction.type)}
                    </div>
                    <div>
                      <Badge variant="outline" className={getStatusColor(selectedAction.status)}>
                        {selectedAction.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">{selectedAction.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Confiança da IA</p>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedAction.confidence} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{selectedAction.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Impacto</span>
                      <Badge variant="outline" className={getImpactColor(selectedAction.impact)}>
                        {selectedAction.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Requer Aprovação</span>
                      <span className="text-sm">{selectedAction.requiresApproval ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>

                  {selectedAction.result && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-xs text-success font-medium mb-1">Resultado</p>
                      <p className="text-sm">{selectedAction.result}</p>
                    </div>
                  )}

                  {selectedAction.status === 'pending' && selectedAction.requiresApproval && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-success hover:bg-success/90"
                        onClick={() => handleApprove(selectedAction.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(selectedAction.id)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Clique em uma ação para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AutonomousAgent;
