import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Wrench,
  Calendar,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MaintenancePrediction {
  id: string;
  component: string;
  vesselId: string;
  vesselName: string;
  probability: number;
  timeframe: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  estimatedCost: number;
  lastMaintenance: Date;
  nextScheduled: Date;
  riskFactors: string[];
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export const PredictiveMaintenanceSystem = () => {
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictiveData();
  }, [selectedTimeframe]);

  const loadPredictiveData = () => {
    // Mock predictive maintenance data
    const mockPredictions: MaintenancePrediction[] = [
      {
        id: '1',
        component: 'Motor Principal - Sistema de Resfriamento',
        vesselId: '1',
        vesselName: 'MV Atlantic Explorer',
        probability: 85,
        timeframe: '7-14 dias',
        priority: 'high',
        recommendation: 'Verificar bombas de água e termostatos',
        estimatedCost: 15000,
        lastMaintenance: new Date('2024-10-15'),
        nextScheduled: new Date('2024-12-20'),
        riskFactors: ['Temperatura elevada', 'Horas de operação', 'Idade do componente']
      },
      {
        id: '2',
        component: 'Eixo Principal - Rolamentos',
        vesselId: '1',
        vesselName: 'MV Atlantic Explorer',
        probability: 72,
        timeframe: '14-30 dias',
        priority: 'medium',
        recommendation: 'Inspeção de vibração e lubrificação',
        estimatedCost: 25000,
        lastMaintenance: new Date('2024-09-01'),
        nextScheduled: new Date('2025-01-15'),
        riskFactors: ['Vibração anormal', 'Análise de óleo']
      },
      {
        id: '3',
        component: 'Sistema Elétrico - Gerador Auxiliar',
        vesselId: '2',
        vesselName: 'MV Pacific Navigator',
        probability: 65,
        timeframe: '30-60 dias',
        priority: 'medium',
        recommendation: 'Teste de carga e verificação de conexões',
        estimatedCost: 8000,
        lastMaintenance: new Date('2024-11-01'),
        nextScheduled: new Date('2025-02-01'),
        riskFactors: ['Flutuação de tensão', 'Tempo de operação']
      },
      {
        id: '4',
        component: 'Sistema Hidráulico - Bombas',
        vesselId: '2',
        vesselName: 'MV Pacific Navigator',
        probability: 45,
        timeframe: '60-90 dias',
        priority: 'low',
        recommendation: 'Monitoramento contínuo de pressão',
        estimatedCost: 5000,
        lastMaintenance: new Date('2024-08-15'),
        nextScheduled: new Date('2025-03-01'),
        riskFactors: ['Perda de pressão gradual']
      }
    ];

    const mockMetrics: PerformanceMetric[] = [
      { metric: 'Eficiência Energética', current: 87, target: 90, trend: 'up', unit: '%' },
      { metric: 'Disponibilidade', current: 94, target: 95, trend: 'stable', unit: '%' },
      { metric: 'MTBF', current: 720, target: 800, trend: 'up', unit: 'h' },
      { metric: 'Custos de Manutenção', current: 125000, target: 100000, trend: 'down', unit: 'R$' },
      { metric: 'Consumo de Combustível', current: 18.5, target: 17.0, trend: 'down', unit: 'L/h' },
      { metric: 'Emissões CO2', current: 45, target: 40, trend: 'down', unit: 'kg/h' }
    ];

    setPredictions(mockPredictions);
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-red-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMetricStatus = (current: number, target: number, metric: string) => {
    const isGood = metric.includes('Custos') || metric.includes('Consumo') || metric.includes('Emissões')
      ? current <= target
      : current >= target;
    return isGood;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manutenção Preditiva</h2>
          <p className="text-muted-foreground">
            Sistema inteligente de previsão e otimização de manutenção
          </p>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === '7d' ? '7 Dias' : timeframe === '30d' ? '30 Dias' : '90 Dias'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {predictions.filter(p => p.priority === 'critical' || p.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Projetada</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 180k</div>
            <p className="text-xs text-muted-foreground">
              Próximos 6 meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência IA</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Precisão das previsões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">97.2%</div>
            <p className="text-xs text-muted-foreground">
              Uptime da frota
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        {prediction.component}
                      </CardTitle>
                      <CardDescription>
                        {prediction.vesselName} • Última manutenção: {prediction.lastMaintenance.toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(prediction.priority)}>
                        {prediction.priority.toUpperCase()}
                      </Badge>
                      <div className={`text-2xl font-bold mt-1 ${getProbabilityColor(prediction.probability)}`}>
                        {prediction.probability}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Prazo Estimado</h4>
                      <p className="text-sm text-muted-foreground">{prediction.timeframe}</p>
                      
                      <h4 className="font-medium mt-3 mb-2">Custo Estimado</h4>
                      <p className="text-sm font-semibold">R$ {prediction.estimatedCost.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recomendação</h4>
                      <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Fatores de Risco</h4>
                      <div className="space-y-1">
                        {prediction.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Agendar
                    </Button>
                    <Button size="sm">
                      Criar Ordem de Trabalho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {metric.metric}
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Atual</span>
                      <span className="text-lg font-bold">
                        {metric.current.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Meta</span>
                      <span className="text-sm">
                        {metric.target.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>
                          {getMetricStatus(metric.current, metric.target, metric.metric) ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <Progress 
                        value={
                          metric.metric.includes('Custos') || metric.metric.includes('Consumo') || metric.metric.includes('Emissões')
                            ? Math.max(0, 100 - (metric.current / metric.target) * 100)
                            : (metric.current / metric.target) * 100
                        } 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Otimizações Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Reagrupamento de Manutenções</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Combine 3 serviços no MV Atlantic Explorer para economizar R$ 12.000
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Pré-pedido de Peças</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Solicite rolamentos antecipadamente para reduzir tempo de parada em 40%
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Rota Otimizada</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Ajuste rota do MV Pacific Navigator para coincidir com manutenção em porto
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análise de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Manutenção Preventiva</span>
                      <span>70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Manutenção Corretiva</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Emergências</span>
                      <span>5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">-23%</div>
                      <div className="text-sm text-muted-foreground">Redução de custos vs ano anterior</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relatório Mensal</CardTitle>
                <CardDescription>Análise completa de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Gerar Relatório</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auditoria de IA</CardTitle>
                <CardDescription>Validação das previsões</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Ver Auditoria</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Benchmark</CardTitle>
                <CardDescription>Comparação com indústria</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">Comparar</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};