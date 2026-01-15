/**
 * Autonomous AI Panel - PATCH 851
 * UI for managing AI decisions with justifications and feedback
 */

import React, { useState } from 'react';
import { useAutonomousAI } from '@/hooks/useAutonomousAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';
import type { AIDecision, DecisionStatus } from '@/lib/autonomy';

export function AutonomousAIPanel() {
  const {
    decisions,
    pendingDecisions,
    learningMetrics,
    statistics,
    isActive,
    approveDecision,
    rejectDecision,
    executeDecision,
    provideFeedback,
    start,
    stop
  } = useAutonomousAI();

  const [feedbackNotes, setFeedbackNotes] = useState<Record<string, string>>({});
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedDecisions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusBadge = (status: DecisionStatus) => {
    const variants: Record<DecisionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      approved: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
      executed: { variant: "default", icon: <Zap className="h-3 w-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      failed: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    const color = confidence >= 0.85 ? "text-green-500" : confidence >= 0.6 ? "text-yellow-500" : "text-red-500";
    return (
      <span className={`font-mono font-bold ${color}`}>
        {(confidence * 100).toFixed(0)}%
      </span>
    );
  };

  const handleFeedback = async (decisionId: string, wasCorrect: boolean) => {
    provideFeedback(decisionId, wasCorrect, feedbackNotes[decisionId]);
    setFeedbackNotes(prev => {
      const next = { ...prev };
      delete next[decisionId];
      return next;
    });
  };

  const DecisionCard = ({ decision }: { decision: AIDecision }) => (
    <Collapsible 
      open={expandedDecisions.has(decision.id)}
      onOpenChange={() => toggleExpanded(decision.id)}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(decision.status)}
                <Badge variant="outline" className="text-xs">
                  {decision.type}
                </Badge>
                {getConfidenceBadge(decision.confidence)}
              </div>
              <CardTitle className="text-base">{decision.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {decision.description}
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedDecisions.has(decision.id) ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Justification */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Justificativa da IA
              </h4>
              <p className="text-sm text-muted-foreground">
                {decision.justification.reasoning}
              </p>
              
              {decision.justification.historicalContext && (
                <p className="text-xs text-muted-foreground/80 italic">
                  📊 {decision.justification.historicalContext}
                </p>
              )}
            </div>

            {/* Data Points */}
            {decision.justification.dataPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Dados Analisados</h4>
                <div className="grid grid-cols-2 gap-2">
                  {decision.justification.dataPoints.map((dp, i) => (
                    <div key={i} className="bg-muted/50 rounded-md p-2 text-sm">
                      <span className="text-muted-foreground">{dp.metric}:</span>{' '}
                      <span className="font-mono font-medium">{dp.value}</span>
                      {dp.trend && (
                        <span className={`ml-1 ${dp.trend === 'up' ? 'text-red-500' : dp.trend === 'down' ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {dp.trend === 'up' ? '↑' : dp.trend === 'down' ? '↓' : '→'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-500" />
                Avaliação de Risco
              </h4>
              <div className="text-sm space-y-1">
                <Badge variant={decision.justification.riskAssessment.level === 'low' ? 'secondary' : decision.justification.riskAssessment.level === 'medium' ? 'default' : 'destructive'}>
                  Risco: {decision.justification.riskAssessment.level}
                </Badge>
                {decision.justification.riskAssessment.factors.length > 0 && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Fatores:</span>{' '}
                    {decision.justification.riskAssessment.factors.join(', ')}
                  </div>
                )}
                {decision.justification.riskAssessment.mitigations.length > 0 && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Mitigações:</span>{' '}
                    {decision.justification.riskAssessment.mitigations.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Alternatives */}
            {decision.justification.alternatives && decision.justification.alternatives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Alternativas Consideradas</h4>
                {decision.justification.alternatives.map((alt, i) => (
                  <div key={i} className="bg-muted/30 rounded-md p-2 text-sm">
                    <p className="font-medium">{alt.action}</p>
                    <p className="text-muted-foreground text-xs">
                      Confiança: {(alt.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {decision.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    approveDecision(decision.id);
                    executeDecision(decision.id);
                  }}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Aprovar e Executar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => rejectDecision(decision.id, 'Rejeitado manualmente')}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </div>
            )}

            {/* Feedback for executed decisions */}
            {decision.status === 'executed' && !decision.feedback && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <h4 className="text-sm font-semibold">Feedback (Feedback Loop)</h4>
                <Textarea
                  placeholder="Notas opcionais sobre o resultado..."
                  value={feedbackNotes[decision.id] || ''}
                  onChange={(e) => setFeedbackNotes(prev => ({ ...prev, [decision.id]: e.target.value }))}
                  className="h-16 text-sm"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleFeedback(decision.id, true)}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                    Decisão Correta
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleFeedback(decision.id, false)}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                    Decisão Incorreta
                  </Button>
                </div>
              </div>
            )}

            {/* Show feedback if exists */}
            {decision.feedback && (
              <div className="text-sm bg-muted/30 rounded-md p-2">
                <span className={decision.feedback.wasCorrect ? 'text-green-500' : 'text-red-500'}>
                  {decision.feedback.wasCorrect ? '✓ Marcado como correto' : '✗ Marcado como incorreto'}
                </span>
                {decision.feedback.notes && (
                  <p className="text-muted-foreground mt-1">{decision.feedback.notes}</p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">IA Autônoma</h2>
            <p className="text-sm text-muted-foreground">
              Sistema de decisões automáticas com aprendizado contínuo
            </p>
          </div>
        </div>
        <Button
          variant={isActive ? "destructive" : "default"}
          onClick={isActive ? stop : start}
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </>
          )}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão</p>
                <p className="text-2xl font-bold">
                  {(learningMetrics.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/50" />
            </div>
            <Progress value={learningMetrics.accuracy * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Decisões</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {statistics.executed} executadas • {statistics.pending} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ciclos</p>
                <p className="text-2xl font-bold">{learningMetrics.learningCycles}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-green-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aprendizado contínuo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">
                  {(statistics.averageConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decisions Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Pendentes ({statistics.pending})
          </TabsTrigger>
          <TabsTrigger value="executed">
            <Zap className="h-4 w-4 mr-1" />
            Executadas ({statistics.executed})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4 mr-1" />
            Rejeitadas ({statistics.rejected})
          </TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {pendingDecisions.length === 0 ? (
                <Card className="bg-muted/20">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma decisão pendente</p>
                    <p className="text-sm">A IA está monitorando o sistema</p>
                  </CardContent>
                </Card>
              ) : (
                pendingDecisions.map(decision => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="executed">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {decisions.filter(d => d.status === 'executed').map(decision => (
                <DecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rejected">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {decisions.filter(d => d.status === 'rejected' || d.status === 'failed').map(decision => (
                <DecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {decisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
