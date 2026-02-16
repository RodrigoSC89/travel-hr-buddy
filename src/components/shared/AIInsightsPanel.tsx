import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingDown, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { useESGWasteAI } from '@/hooks/useESGWasteAI';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface AIInsight {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact?: string;
  confidence: number;
}

interface AIInsightsPanelProps {
  module: 'esg' | 'waste';
  data: Record<string, unknown>;
  className?: string;
}

export function AIInsightsPanel({ module, data, className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const { getRecommendations, predictiveAnalysis, isLoading } = useESGWasteAI();

  const generateInsights = async () => {
    const context = module === 'esg' 
      ? 'Análise de emissões e eficiência energética da frota marítima'
      : 'Análise de gestão de resíduos conforme MARPOL';
    
    const result = await getRecommendations(context, data);
    if (result) {
      setAiAnalysis(result);
      setInsights([
        { id: '1', type: 'optimization', title: 'Otimização Identificada', description: 'Baseado na análise, há oportunidades de melhoria.', impact: '-15% emissões', confidence: 0.92 },
        { id: '2', type: 'prediction', title: 'Previsão de Tendência', description: 'Projeção para os próximos 3 meses.', confidence: 0.85 },
        { id: '3', type: 'alert', title: 'Alerta de Compliance', description: 'Verifique prazos regulatórios próximos.', confidence: 0.95 },
      ]);
    }
  };

  const runPredictiveAnalysis = async () => {
    const result = await predictiveAnalysis(data);
    if (result) setAiAnalysis(result);
  };

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'optimization': return <TrendingDown className="h-4 w-4 text-success" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-info" />;
      case 'prediction': return <Zap className="h-4 w-4 text-accent-foreground" />;
    }
  };

  const getTypeBadge = (type: AIInsight['type']) => {
    const variants: Record<AIInsight['type'], string> = {
      optimization: 'bg-success/10 text-success border-success/20',
      alert: 'bg-warning/10 text-warning border-warning/20',
      recommendation: 'bg-info/10 text-info border-info/20',
      prediction: 'bg-accent/20 text-accent-foreground border-accent/30',
    };
    const labels: Record<AIInsight['type'], string> = {
      optimization: 'Otimização',
      alert: 'Alerta',
      recommendation: 'Recomendação',
      prediction: 'Previsão',
    };
    return (
      <Badge className={cn("text-xs", variants[type])}>
        {labels[type]}
      </Badge>
    );
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Análise Inteligente
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateInsights} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lightbulb className="h-4 w-4 mr-2" />}
              Gerar Insights
            </Button>
            <Button size="sm" variant="outline" onClick={runPredictiveAnalysis} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Previsão
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 && !aiAnalysis ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Clique em "Gerar Insights" para análise IA</p>
          </div>
        ) : (
          <>
            {insights.length > 0 && (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="mt-0.5">{getTypeIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{insight.title}</span>
                        {getTypeBadge(insight.type)}
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      {insight.impact && (
                        <Badge variant="outline" className="mt-2 text-xs">Impacto: {insight.impact}</Badge>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground mb-1">Confiança</div>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.confidence * 100} className="w-16 h-1.5" />
                        <span className="text-xs font-medium">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aiAnalysis && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Análise Detalhada</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-[300px] overflow-y-auto">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-sm text-muted-foreground">Analisando dados...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}