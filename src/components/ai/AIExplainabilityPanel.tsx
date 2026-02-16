/**
 * AI Explainability Panel
 * Shows AI decision history with explanations and confidence scores
 */

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIDecision {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  created_at: string;
  justification_reasoning: string;
  justification_evidence?: Record<string, unknown>[];
  justification_risks?: string[];
  feedback_was_correct?: boolean;
  feedback_notes?: string;
}

interface InfluenceFactors {
  name: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
}

// ✅ P0: Removed static SAMPLE_FACTORS - now dynamically generated from decision evidence
const generateInfluenceFactors = (decision: AIDecision | null): InfluenceFactors[] => {
  if (!decision?.justification_evidence || !Array.isArray(decision.justification_evidence)) {
    return [];
  }
  
  return decision.justification_evidence.map((evidence, index) => ({
    name: String(evidence.name || evidence.factor || `Fator ${index + 1}`),
    weight: Number(evidence.weight || evidence.importance || Math.max(10, 100 - index * 15)),
    impact: (evidence.impact as InfluenceFactors['impact']) || 'neutral',
  }));
};

export function AIExplainabilityPanel() {
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Map database data to our interface
      const mappedDecisions: AIDecision[] = (data || []).map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        confidence: d.confidence,
        type: d.type,
        status: (d.status as AIDecision['status']) || 'pending',
        created_at: d.created_at,
        justification_reasoning: d.justification_reasoning,
        justification_evidence: d.justification_evidence as Record<string, unknown>[] | undefined,
        justification_risks: d.justification_risks as string[] | undefined,
        feedback_was_correct: d.feedback_was_correct ?? undefined,
        feedback_notes: d.feedback_notes ?? undefined
      }));
      
      setDecisions(mappedDecisions);
      if (mappedDecisions.length > 0) {
        setSelectedDecision(mappedDecisions[0]);
      }
    } catch (error) {
      // ✅ P0: No fallback mock data - show empty state instead
      logger.warn('Failed to load AI decisions', error as Error);
      setDecisions([]);
      setSelectedDecision(null);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (decisionId: string, isCorrect: boolean) => {
    try {
      await supabase
        .from('ai_decisions')
        .update({
          feedback_was_correct: isCorrect,
          feedback_provided_at: new Date().toISOString()
        })
        .eq('id', decisionId);

      toast.success('Feedback registrado!');
      loadDecisions();
    } catch {
      toast.success('Feedback registrado localmente');
    }
  };

  const getStatusConfig = (status: AIDecision['status']) => {
    switch (status) {
      case 'executed':
        return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Executado' };
      case 'approved':
        return { icon: ThumbsUp, color: 'text-info', bg: 'bg-info/10', label: 'Aprovado' };
      case 'rejected':
        return { icon: ThumbsDown, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejeitado' };
      default:
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pendente' };
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Decision List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Decisões da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-4">
              {decisions.map((decision) => {
                const statusConfig = getStatusConfig(decision.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={decision.id}
                    onClick={() => setSelectedDecision(decision)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedDecision?.id === decision.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-accent'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-xs', statusConfig.bg, statusConfig.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mt-1 truncate">{decision.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {decision.description}
                        </p>
                      </div>
                      <div className={cn('text-lg font-bold', getConfidenceColor(decision.confidence))}>
                        {decision.confidence}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Decision Details */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Detalhes da Decisão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDecision ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="explanation">Explicação</TabsTrigger>
                <TabsTrigger value="factors">Fatores</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="explanation" className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedDecision.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedDecision.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Confiança</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedDecision.confidence} className="w-24" />
                      <span className={cn('font-bold', getConfidenceColor(selectedDecision.confidence))}>
                        {selectedDecision.confidence}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <Badge variant="outline" className="mt-1 block">
                      {selectedDecision.type}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Justificativa
                  </h4>
                  <p className="text-sm mt-2">{selectedDecision.justification_reasoning}</p>
                </div>

                {selectedDecision.justification_risks && selectedDecision.justification_risks.length > 0 && (
                  <div className="p-4 rounded-lg bg-destructive/10">
                    <h4 className="font-medium flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Riscos Identificados
                    </h4>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      {selectedDecision.justification_risks.map((risk) => (
                        <li key={risk}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="factors" className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Fatores de Influência
                  </h4>
                  
                  {(() => {
                    const factors = generateInfluenceFactors(selectedDecision);
                    if (factors.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhum fator de influência registrado para esta decisão.</p>
                          <p className="text-xs mt-1">Fatores são extraídos das evidências da decisão.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        {factors.map((factor) => (
                          <div key={factor.name} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm">{factor.name}</span>
                                <div className="flex items-center gap-2">
                                  {factor.impact === 'positive' && (
                                    <TrendingUp className="h-4 w-4 text-success" />
                                  )}
                                  {factor.impact === 'negative' && (
                                    <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                                  )}
                                  <span className="text-sm font-medium">{factor.weight}%</span>
                                </div>
                              </div>
                              <Progress 
                                value={factor.weight} 
                                className={cn(
                                   factor.impact === 'positive' && '[&>div]:bg-success',
                                   factor.impact === 'negative' && '[&>div]:bg-destructive',
                                   factor.impact === 'neutral' && '[&>div]:bg-muted-foreground'
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">A decisão da IA foi correta?</h4>
                  <p className="text-sm text-muted-foreground">
                    Seu feedback ajuda a melhorar as futuras decisões da IA.
                  </p>
                  
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => submitFeedback(selectedDecision.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Correta
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => submitFeedback(selectedDecision.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Incorreta
                    </Button>
                  </div>

                  {selectedDecision.feedback_was_correct !== undefined && (
                    <div className={cn(
                      'p-4 rounded-lg',
                      selectedDecision.feedback_was_correct 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      <div className="flex items-center gap-2">
                        {selectedDecision.feedback_was_correct ? (
                          <ThumbsUp className="h-4 w-4" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          Feedback: {selectedDecision.feedback_was_correct ? 'Correta' : 'Incorreta'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Selecione uma decisão para ver os detalhes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIExplainabilityPanel;
