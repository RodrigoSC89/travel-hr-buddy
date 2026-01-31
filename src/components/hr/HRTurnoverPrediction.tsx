/**
 * HR Turnover Prediction Component
 * Predição de turnover com ML e recomendações de ação
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Brain, AlertTriangle, TrendingUp, TrendingDown, 
  Target, RefreshCw, Filter, Download, ChevronDown,
  DollarSign, Clock, Award, Users, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function HRTurnoverPrediction() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  // Mock predictions data
  const predictions = [
    {
      id: '1',
      name: 'João Santos',
      position: 'Gerente de Projetos',
      department: 'Operações',
      riskScore: 87,
      riskLevel: 'critical',
      departureWindow: '30-60 dias',
      factors: {
        salary: 90,
        tenure: 70,
        performance: 60,
        engagement: 70,
        manager: 45,
        workload: 80,
        growth: 75,
      },
      topRiskFactors: [
        'Salário 18% abaixo do mercado',
        'Sem promoção há 24 meses',
        '45h extras no último mês'
      ],
      recommendedActions: [
        'URGENTE: Agendar 1-on-1 com gestor',
        'Revisar salário (sugestão: +15%)',
        'Oferecer projeto de liderança'
      ]
    },
    {
      id: '2',
      name: 'Maria Silva',
      position: 'Desenvolvedora Sr',
      department: 'Tecnologia',
      riskScore: 72,
      riskLevel: 'high',
      departureWindow: '60-90 dias',
      factors: {
        salary: 75,
        tenure: 60,
        performance: 85,
        engagement: 65,
        manager: 50,
        workload: 70,
        growth: 80,
      },
      topRiskFactors: [
        'Alta performance - risco de ofertas',
        'Pouco feedback do gestor',
        'Solicitou home office negado'
      ],
      recommendedActions: [
        'Conversa sobre expectativas',
        'Flexibilizar home office',
        'Incluir em programa de liderança'
      ]
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      position: 'Analista Financeiro',
      department: 'Financeiro',
      riskScore: 45,
      riskLevel: 'medium',
      departureWindow: '3-6 meses',
      factors: {
        salary: 50,
        tenure: 40,
        performance: 45,
        engagement: 50,
        manager: 35,
        workload: 45,
        growth: 55,
      },
      topRiskFactors: [
        'Estagnação na carreira',
        'Baixo engajamento em pesquisas'
      ],
      recommendedActions: [
        'PDI estruturado em 90 dias',
        'Mentoria com líder sênior'
      ]
    },
  ];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('hr-turnover-prediction', {
        body: { analyze_all: true }
      });

      if (error) throw error;
      toast.success(`Análise concluída: ${data.total_analyzed} colaboradores analisados`);
    } catch (error) {
      logger.error('Error running analysis:', error);
      toast.error('Erro ao executar análise. Usando dados de demonstração.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-green-500 bg-green-500/10 border-green-500/30';
    }
  };

  const factorLabels: Record<string, { label: string; icon: any }> = {
    salary: { label: 'Salário vs Mercado', icon: DollarSign },
    tenure: { label: 'Tempo de Casa', icon: Clock },
    performance: { label: 'Desempenho', icon: Award },
    engagement: { label: 'Engajamento', icon: Target },
    manager: { label: 'Gestor', icon: Users },
    workload: { label: 'Carga de Trabalho', icon: TrendingUp },
    growth: { label: 'Crescimento', icon: TrendingUp },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Predição de Turnover com IA
          </h2>
          <p className="text-sm text-muted-foreground">
            Análise preditiva de risco de saída baseada em Machine Learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-2" onClick={handleRunAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analisando...' : 'Rodar Análise'}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Crítico', count: predictions.filter(p => p.riskLevel === 'critical').length, color: 'text-red-500' },
          { label: 'Alto', count: predictions.filter(p => p.riskLevel === 'high').length, color: 'text-orange-500' },
          { label: 'Médio', count: predictions.filter(p => p.riskLevel === 'medium').length, color: 'text-amber-500' },
          { label: 'Baixo', count: 330, color: 'text-green-500' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-sm text-muted-foreground">Risco {item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className={`border ${getRiskColor(prediction.riskLevel)}`}>
            <CardContent className="p-4">
              {/* Main Row */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {prediction.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{prediction.name}</p>
                    <p className="text-sm text-muted-foreground">{prediction.position}</p>
                    <Badge variant="outline" className="mt-1">{prediction.department}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${
                      prediction.riskLevel === 'critical' ? 'text-red-500' :
                      prediction.riskLevel === 'high' ? 'text-orange-500' : 'text-amber-500'
                    }`}>
                      {prediction.riskScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">Score de Risco</p>
                  </div>
                  <div>
                    <Badge variant={
                      prediction.riskLevel === 'critical' ? 'destructive' : 
                      prediction.riskLevel === 'high' ? 'default' : 'secondary'
                    }>
                      {prediction.riskLevel.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saída em {prediction.departureWindow}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    1-on-1
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setExpandedEmployee(
                      expandedEmployee === prediction.id ? null : prediction.id
                    )}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      expandedEmployee === prediction.id ? 'rotate-180' : ''
                    }`} />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEmployee === prediction.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Factor Breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Fatores de Risco</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(prediction.factors).map(([key, value]) => {
                        const factor = factorLabels[key];
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{factor.label}</span>
                              <span className="text-xs font-medium">{value}%</span>
                            </div>
                            <Progress 
                              value={value} 
                              className={`h-1.5 ${
                                value >= 70 ? '[&>div]:bg-red-500' : 
                                value >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Risk Factors & Actions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <h4 className="text-sm font-medium text-red-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Principais Fatores de Risco
                      </h4>
                      <ul className="space-y-1">
                        {prediction.topRiskFactors.map((factor, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <h4 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Ações Recomendadas
                      </h4>
                      <ul className="space-y-1">
                        {prediction.recommendedActions.map((action, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-1">{i + 1}.</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
