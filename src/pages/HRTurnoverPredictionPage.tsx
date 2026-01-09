/**
 * HRTurnoverPredictionPage - Página de Predição de Turnover
 * Análise preditiva com ML para identificar riscos de saída
 */
import { HRTurnoverPrediction } from '@/components/hr/HRTurnoverPrediction';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Users, AlertTriangle, DollarSign, Target } from 'lucide-react';

const AI_INSIGHTS = [
  {
    title: 'Padrão Detectado',
    description: 'Colaboradores com mais de 40h extras/mês têm 3x mais chance de sair nos próximos 90 dias.',
    type: 'warning',
  },
  {
    title: 'Tendência Positiva',
    description: 'A taxa de turnover caiu 12% após implementação do programa de feedback contínuo.',
    type: 'success',
  },
  {
    title: 'Ação Recomendada',
    description: 'Revisar política salarial do departamento de Tecnologia - 78% dos devs estão abaixo do mercado.',
    type: 'info',
  },
];

export default function HRTurnoverPredictionPage() {
  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Predição de Turnover com IA
          </h1>
          <p className="text-muted-foreground">
            Análise preditiva de riscos de saída baseada em Machine Learning
          </p>
        </div>
        <Badge variant="secondary" className="h-fit gap-2">
          <TrendingUp className="h-4 w-4" />
          Precisão: 92% | Última análise: há 2h
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Colaboradores', value: '347', icon: Users, color: 'text-blue-500' },
          { label: 'Risco Crítico', value: '3', icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Risco Alto', value: '8', icon: AlertTriangle, color: 'text-orange-500' },
          { label: 'Custo Potencial', value: 'R$ 420K', icon: DollarSign, color: 'text-amber-500' },
          { label: 'Taxa Atual', value: '4.2%', icon: Target, color: 'text-green-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        {AI_INSIGHTS.map((insight, i) => (
          <Card 
            key={i} 
            className={`border ${
              insight.type === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
              insight.type === 'success' ? 'border-green-500/30 bg-green-500/5' :
              'border-blue-500/30 bg-blue-500/5'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Brain className={`h-5 w-5 mt-0.5 ${
                  insight.type === 'warning' ? 'text-amber-500' :
                  insight.type === 'success' ? 'text-green-500' :
                  'text-blue-500'
                }`} />
                <div>
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Prediction Component */}
      <HRTurnoverPrediction />
    </div>
  );
}
