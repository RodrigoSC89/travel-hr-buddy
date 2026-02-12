/**
 * M004 - Explainable AI (XAI) Decision Card
 * Chain-of-thought reasoning display with full transparency
 * Inspired by Anthropic Constitutional AI explainability
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, CheckCircle, XCircle, Clock, TrendingUp, 
  FileText, AlertTriangle, Lightbulb, ArrowRight,
  Shield, BookOpen
} from 'lucide-react';

interface ReasoningStep {
  step: number;
  description: string;
  evidence?: string;
  confidence: number;
}

interface Source {
  type: 'regulation' | 'manual' | 'historical' | 'sensor' | 'ai-model';
  reference: string;
  relevance: number;
}

interface Alternative {
  option: string;
  pros: string[];
  cons: string[];
  score: number;
}

export interface XAIDecision {
  id: string;
  agentName: string;
  agentLevel: string;
  decision: string;
  confidence: number;
  timestamp: Date;
  reasoning: ReasoningStep[];
  sources: Source[];
  alternatives: Alternative[];
  outcome?: 'success' | 'pending' | 'rejected';
  impact: string;
}

const SOURCE_ICONS = {
  regulation: Shield,
  manual: BookOpen,
  historical: Clock,
  sensor: TrendingUp,
  'ai-model': Brain,
};

const SOURCE_LABELS = {
  regulation: 'Regulamento',
  manual: 'Manual',
  historical: 'Histórico',
  sensor: 'Sensor IoT',
  'ai-model': 'Modelo IA',
};

export function XAIDecisionCard({ decision }: { decision: XAIDecision }) {
  const confidenceColor = decision.confidence >= 0.9 
    ? 'text-success' 
    : decision.confidence >= 0.7 
      ? 'text-warning' 
      : 'text-destructive';

  return (
    <Card className="border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{decision.decision}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{decision.agentName}</Badge>
                <Badge variant="secondary" className="text-xs">{decision.agentLevel}</Badge>
                <span className="text-xs text-muted-foreground">
                  {decision.timestamp.toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${confidenceColor}`}>
              {(decision.confidence * 100).toFixed(0)}%
            </span>
            <p className="text-xs text-muted-foreground">Confiança</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain of Thought */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-warning" />
            Cadeia de Raciocínio
          </h4>
          <div className="space-y-2 pl-2 border-l-2 border-primary/30">
            {decision.reasoning.map((step) => (
              <div key={`step-${step.step}`} className="relative pl-4">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{step.step}</span>
                </div>
                <p className="text-sm">{step.description}</p>
                {step.evidence && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    📋 {step.evidence}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={step.confidence * 100} className="h-1 flex-1 max-w-[100px]" />
                  <span className="text-xs text-muted-foreground">{(step.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        {decision.sources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-info" />
              Fontes ({decision.sources.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {decision.sources.map((source, idx) => {
                const Icon = SOURCE_ICONS[source.type];
                return (
                  <Badge key={`src-${source.type}-${source.reference}`} variant="outline" className="gap-1 text-xs">
                    <Icon className="h-3 w-3" />
                    {SOURCE_LABELS[source.type]}: {source.reference}
                    <span className="text-muted-foreground">({source.relevance}%)</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Alternatives Considered */}
        {decision.alternatives.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-accent-foreground" />
              Alternativas Avaliadas
            </h4>
            <div className="space-y-2">
              {decision.alternatives.map((alt) => (
                <div key={alt.option} className="p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{alt.option}</span>
                    <Badge variant={alt.score >= 70 ? 'default' : 'secondary'} className="text-xs">
                      Score: {alt.score}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      {alt.pros.map((p, i) => (
                        <div key={i} className="flex items-center gap-1 text-success">
                          <CheckCircle className="h-3 w-3" /> {p}
                        </div>
                      ))}
                    </div>
                    <div>
                      {alt.cons.map((c, i) => (
                        <div key={i} className="flex items-center gap-1 text-destructive">
                          <XCircle className="h-3 w-3" /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact */}
        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Impacto:</span>
            <span className="text-sm text-muted-foreground">{decision.impact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default XAIDecisionCard;
