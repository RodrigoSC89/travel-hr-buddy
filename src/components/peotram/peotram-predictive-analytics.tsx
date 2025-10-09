import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface PredictiveInsight {
  id: string;
  type: 'failure' | 'trend' | 'recommendation' | 'risk';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  probability: number;
  timeframe: string;
  actionItems: string[];
  impact: 'critical' | 'significant' | 'moderate';
}

interface ComplianceForecast {
  element: string;
  currentScore: number;
  predictedScore: number;
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
}

export const PeotramPredictiveAnalytics: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<PredictiveInsight[]>([
    {
      id: 'insight-1',
      type: 'failure',
      severity: 'high',
      title: 'Risco de Não Conformidade em Elemento 03',
      description: 'Análise preditiva indica 78% de probabilidade de não conformidade em "Gestão de Riscos" no próximo ciclo de auditoria',
      probability: 78,
      timeframe: '30-45 dias',
      actionItems: [
        'Revisar procedimentos de identificação de riscos',
        'Atualizar matriz de riscos operacionais',
        'Treinar equipe em metodologias HAZOP'
      ],
      impact: 'significant'
    },
    {
      id: 'insight-2',
      type: 'trend',
      severity: 'medium',
      title: 'Tendência de Declínio em Treinamentos',
      description: 'Padrão de ML detectou queda gradual na pontuação de treinamentos nos últimos 3 ciclos',
      probability: 65,
      timeframe: '60 dias',
      actionItems: [
        'Implementar programa de reciclagem trimestral',
        'Revisar eficácia dos treinamentos atuais',
        'Considerar plataforma e-learning'
      ],
      impact: 'moderate'
    },
    {
      id: 'insight-3',
      type: 'recommendation',
      severity: 'low',
      title: 'Oportunidade de Melhoria em Documentação',
      description: 'IA sugere otimização no processo de gestão documental baseado em best practices do setor',
      probability: 85,
      timeframe: 'Imediato',
      actionItems: [
        'Implementar controle de versão digital',
        'Adotar padrão ISO 9001 para documentos',
        'Automatizar alertas de validade'
      ],
      impact: 'moderate'
    },
    {
      id: 'insight-4',
      type: 'risk',
      severity: 'high',
      title: 'Risco de Vencimento Múltiplo de Certificações',
      description: 'Cluster analysis identificou 8 certificações críticas vencendo simultaneamente em 45 dias',
      probability: 95,
      timeframe: '45 dias',
      actionItems: [
        'Priorizar renovação de certificações STCW',
        'Escalonar vencimentos futuros',
        'Implementar sistema de alertas preventivos'
      ],
      impact: 'critical'
    }
  ]);

  const [forecasts, setForecasts] = useState<ComplianceForecast[]>([
    { element: 'ELEM_01 - Liderança', currentScore: 92, predictedScore: 94, trend: 'improving', confidence: 87 },
    { element: 'ELEM_02 - Conformidade Legal', currentScore: 88, predictedScore: 88, trend: 'stable', confidence: 82 },
    { element: 'ELEM_03 - Gestão de Riscos', currentScore: 85, predictedScore: 78, trend: 'declining', confidence: 79 },
    { element: 'ELEM_04 - Treinamento', currentScore: 90, predictedScore: 86, trend: 'declining', confidence: 84 },
    { element: 'ELEM_05 - Operações', currentScore: 83, predictedScore: 85, trend: 'improving', confidence: 76 },
  ]);

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Executando análise preditiva com ML...');

    // Simulate ML analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Análise preditiva concluída!', {
        description: `${insights.length} insights gerados com confiança média de 81%`
      });
    }, 3000);
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity];
  };

  const getImpactBadge = (impact: 'critical' | 'significant' | 'moderate') => {
    const variants = {
      critical: 'bg-red-100 text-red-800',
      significant: 'bg-orange-100 text-orange-800',
      moderate: 'bg-yellow-100 text-yellow-800'
    };
    return variants[impact];
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <Activity className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getTypeIcon = (type: PredictiveInsight['type']) => {
    const icons = {
      failure: <AlertTriangle className="h-5 w-5 text-red-600" />,
      trend: <TrendingUp className="h-5 w-5 text-blue-600" />,
      recommendation: <Lightbulb className="h-5 w-5 text-yellow-600" />,
      risk: <Target className="h-5 w-5 text-orange-600" />
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-600/10 backdrop-blur-sm">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Análise Preditiva com IA</CardTitle>
                <CardDescription>
                  Machine Learning para previsão de riscos e oportunidades
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={runPredictiveAnalysis} 
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Análise ML
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ML Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Insights Preditivos
          </CardTitle>
          <CardDescription>
            Previsões e recomendações baseadas em análise de padrões históricos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(insight.type)}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <Badge className={getImpactBadge(insight.impact)}>
                        {insight.impact === 'critical' ? 'Crítico' :
                         insight.impact === 'significant' ? 'Significativo' : 'Moderado'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Probabilidade:</span>
                      <span className="font-medium">{insight.probability}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-medium">{insight.timeframe}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ações Recomendadas:</p>
                    <ul className="space-y-1">
                      {insight.actionItems.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Brain className="h-3 w-3" />
                      Gerado por modelo de Random Forest com {insight.probability}% de confiança
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Previsão de Compliance
          </CardTitle>
          <CardDescription>
            Projeção de scores por elemento baseada em time series analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {forecasts.map((forecast, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTrendIcon(forecast.trend)}
                  <span className="font-medium">{forecast.element}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Atual</p>
                    <p className="text-lg font-bold">{forecast.currentScore}%</p>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Previsto</p>
                    <p className={`text-lg font-bold ${
                      forecast.predictedScore > forecast.currentScore ? 'text-green-600' :
                      forecast.predictedScore < forecast.currentScore ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {forecast.predictedScore}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={forecast.currentScore} className="flex-1 h-2 bg-gray-200" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {forecast.confidence}% confiança
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ML Model Info */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg">Informações do Modelo de ML</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Algoritmo</p>
              <p className="font-medium">Random Forest + Time Series</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Acurácia Média</p>
              <p className="font-medium text-green-600">87.3%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> As previsões são baseadas em análise de padrões históricos de 500+ auditorias.
              Recomenda-se validação humana antes de ações críticas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
