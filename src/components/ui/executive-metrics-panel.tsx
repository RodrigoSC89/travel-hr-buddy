import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Users,
  Ship,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const ExecutiveMetricsPanel = () => {
  const executiveMetrics = [
    {
      title: 'EBITDA',
      value: 'R$ 1.85M',
      change: '+15.2%',
      trend: 'up',
      target: 'R$ 2.1M',
      progress: 88.1,
      benchmark: 'Acima do setor',
      period: 'Mensal'
    },
    {
      title: 'ROE',
      value: '18.7%',
      change: '+3.4%',
      trend: 'up',
      target: '20%',
      progress: 93.5,
      benchmark: 'Top 10%',
      period: 'Anual'
    },
    {
      title: 'Margem Operacional',
      value: '15.3%',
      change: '-1.2%',
      trend: 'down',
      target: '16%',
      progress: 95.6,
      benchmark: 'Dentro da meta',
      period: 'Trimestral'
    },
    {
      title: 'Fluxo de Caixa',
      value: 'R$ 980K',
      change: '+8.9%',
      trend: 'up',
      target: 'R$ 1.2M',
      progress: 81.7,
      benchmark: 'Saudável',
      period: 'Mensal'
    }
  ];

  const operationalKPIs = [
    {
      title: 'Utilização da Frota',
      value: '87.3%',
      target: '90%',
      status: 'warning',
      improvement: '+2.1% vs mês anterior'
    },
    {
      title: 'Eficiência Combustível',
      value: '92.1%',
      target: '88%',
      status: 'excellent',
      improvement: '+4.2% vs mês anterior'
    },
    {
      title: 'Score de Segurança',
      value: '98.5%',
      target: '95%',
      status: 'excellent',
      improvement: 'Líder do setor'
    },
    {
      title: 'Compliance Rate',
      value: '99.2%',
      target: '98%',
      status: 'excellent',
      improvement: '100% das auditorias'
    }
  ];

  const revenueData = [
    { month: 'Jul', revenue: 2100, forecast: 2200, expenses: 1580 },
    { month: 'Ago', revenue: 2250, forecast: 2300, expenses: 1690 },
    { month: 'Set', revenue: 2180, forecast: 2400, expenses: 1640 },
    { month: 'Out', revenue: 2350, forecast: 2500, expenses: 1750 },
    { month: 'Nov', revenue: 2420, forecast: 2600, expenses: 1820 },
    { month: 'Dez', revenue: 2450, forecast: 2700, expenses: 1840 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-100 border-green-200';
      case 'good': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'warning': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-secondary-foreground bg-secondary border-border';
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Financial Metrics */}
      <Card className="border-2 border-primary/10 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
              <DollarSign className="w-6 h-6" />
            </div>
            Métricas Financeiras Executivas
          </CardTitle>
          <CardDescription>Indicadores estratégicos de performance financeira</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {executiveMetrics.map((metric, index) => (
              <div key={index} className="relative p-6 rounded-xl border-2 border-border/30 hover:border-primary/30 transition-all bg-gradient-to-br from-background to-muted/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                      <div className="text-sm text-muted-foreground">{metric.title}</div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      metric.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {metric.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta: {metric.target}</span>
                      <span className="font-medium">{metric.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Benchmark:</span>
                      <span className="font-medium text-primary">{metric.benchmark}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Período:</span>
                      <span className="font-medium">{metric.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue vs Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-2 border-primary/10 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Financeira vs Previsão
            </CardTitle>
            <CardDescription>Receita realizada vs forecast (últimos 6 meses)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => [
                    `R$ ${(value/1000).toFixed(0)}K`,
                    name === 'revenue' ? 'Receita' : name === 'forecast' ? 'Previsão' : 'Despesas'
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" name="Receita" radius={[4, 4, 0, 0]} />
                <Bar dataKey="forecast" fill="#93c5fd" name="Previsão" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f87171" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operational KPIs */}
        <Card className="border-2 border-secondary/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              KPIs Operacionais
            </CardTitle>
            <CardDescription>Performance operacional chave</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {operationalKPIs.map((kpi, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kpi.title}</span>
                    <Badge className={getStatusColor(kpi.status)} variant="outline">
                      {kpi.status === 'excellent' ? 'Excelente' :
                       kpi.status === 'good' ? 'Bom' :
                       kpi.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                      <span className="text-sm text-muted-foreground">Meta: {kpi.target}</span>
                    </div>
                    <Progress 
                      value={parseFloat(kpi.value) / parseFloat(kpi.target) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {kpi.improvement}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card className="border-2 border-accent/10 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Resumo Executivo
          </CardTitle>
          <CardDescription>Insights estratégicos e recomendações</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Pontos Fortes</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Performance financeira 12.5% acima da meta
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  Score de segurança líder do setor (98.5%)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  100% compliance em auditorias
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-700">Áreas de Atenção</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  Utilização da frota 2.7% abaixo da meta
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  Margem operacional em queda (-1.2%)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  Necessário otimizar rotas de navegação
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-700">Recomendações</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Implementar IA para otimização de rotas
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Revisar contratos de manutenção
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  Expandir capacidade da frota em 15%
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveMetricsPanel;