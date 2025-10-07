import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  TrendingUp, 
  Activity, 
  Waves,
  Anchor,
  Timer,
  Gauge,
  BarChart3
} from 'lucide-react';

interface OperationalPattern {
  id: string;
  vessel: string;
  patternType: 'fuel_consumption' | 'maintenance_cycle' | 'route_efficiency' | 'crew_performance';
  patternName: string;
  description: string;
  frequency: string;
  accuracy: number;
  lastOccurrence: Date;
  predictedNext: Date;
  confidence: number;
  metrics: {
    name: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export const PatternRecognition: React.FC = () => {
  const [patterns, setPatterns] = useState<OperationalPattern[]>([
    {
      id: '1',
      vessel: 'MV-Atlas',
      patternType: 'fuel_consumption',
      patternName: 'Consumo Elevado em Mar Agitado',
      description: 'Consumo aumenta 18% em condições de mar com ondas > 2.5m',
      frequency: 'Semanal',
      accuracy: 94,
      lastOccurrence: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      predictedNext: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      confidence: 91,
      metrics: [
        { name: 'Consumo Base', value: 245, trend: 'stable' },
        { name: 'Consumo Previsto', value: 289, trend: 'up' },
        { name: 'Desvio Médio', value: 18, trend: 'stable' }
      ]
    },
    {
      id: '2',
      vessel: 'MV-Neptune',
      patternType: 'maintenance_cycle',
      patternName: 'Ciclo de Manutenção Filtros',
      description: 'Filtros de óleo necessitam troca a cada 2.800 horas de operação',
      frequency: 'Trimestral',
      accuracy: 97,
      lastOccurrence: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      predictedNext: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      confidence: 96,
      metrics: [
        { name: 'Horas desde troca', value: 2650, trend: 'up' },
        { name: 'Horas limite', value: 2800, trend: 'stable' },
        { name: 'Margem segurança', value: 150, trend: 'down' }
      ]
    },
    {
      id: '3',
      vessel: 'MV-Poseidon',
      patternType: 'route_efficiency',
      patternName: 'Eficiência Rota Santos-Rio',
      description: 'Rota apresenta melhor performance com partida entre 05:00-07:00',
      frequency: 'Diário',
      accuracy: 89,
      lastOccurrence: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      predictedNext: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      confidence: 88,
      metrics: [
        { name: 'Tempo médio', value: 8.2, trend: 'down' },
        { name: 'Consumo médio', value: 1850, trend: 'down' },
        { name: 'Economia', value: 12, trend: 'up' }
      ]
    },
    {
      id: '4',
      vessel: 'MV-Atlas',
      patternType: 'crew_performance',
      patternName: 'Performance Equipe Noturna',
      description: 'Equipe apresenta 15% mais eficiência em operações noturnas',
      frequency: 'Diário',
      accuracy: 82,
      lastOccurrence: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      predictedNext: new Date(Date.now()),
      confidence: 79,
      metrics: [
        { name: 'Eficiência média', value: 92, trend: 'up' },
        { name: 'Tempo resposta', value: 3.5, trend: 'down' },
        { name: 'Incidentes', value: 0.8, trend: 'down' }
      ]
    }
  ]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'fuel_consumption': return <Gauge className="h-5 w-5" />;
      case 'maintenance_cycle': return <Activity className="h-5 w-5" />;
      case 'route_efficiency': return <Waves className="h-5 w-5" />;
      case 'crew_performance': return <TrendingUp className="h-5 w-5" />;
      default: return <Network className="h-5 w-5" />;
    }
  };

  const getPatternTypeLabel = (type: string) => {
    switch (type) {
      case 'fuel_consumption': return 'Consumo';
      case 'maintenance_cycle': return 'Manutenção';
      case 'route_efficiency': return 'Rotas';
      case 'crew_performance': return 'Tripulação';
      default: return type;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const averageAccuracy = Math.round(
    patterns.reduce((sum, p) => sum + p.accuracy, 0) / patterns.length
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Padrões Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">Identificados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Confiabilidade do modelo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Embarcações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(patterns.map(p => p.vessel)).size}
            </div>
            <p className="text-xs text-muted-foreground">Monitoradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próxima Previsão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">MV-Poseidon</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Pattern Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Reconhecimento de Padrões Operacionais
              </CardTitle>
              <CardDescription>
                IA identifica e aprende padrões comportamentais por embarcação
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Aprendizado Contínuo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="fuel_consumption">Consumo</TabsTrigger>
              <TabsTrigger value="maintenance_cycle">Manutenção</TabsTrigger>
              <TabsTrigger value="route_efficiency">Rotas</TabsTrigger>
              <TabsTrigger value="crew_performance">Tripulação</TabsTrigger>
            </TabsList>

            {['all', 'fuel_consumption', 'maintenance_cycle', 'route_efficiency', 'crew_performance'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                {patterns
                  .filter(p => tab === 'all' || p.patternType === tab)
                  .map((pattern) => (
                    <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              {getPatternIcon(pattern.patternType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="gap-1">
                                  <Anchor className="h-3 w-3" />
                                  {pattern.vessel}
                                </Badge>
                                <Badge variant="secondary">
                                  {getPatternTypeLabel(pattern.patternType)}
                                </Badge>
                              </div>
                              <CardTitle className="text-base mt-2">
                                {pattern.patternName}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {pattern.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Accuracy and Confidence */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Precisão</span>
                              <span className="font-medium">{pattern.accuracy}%</span>
                            </div>
                            <Progress value={pattern.accuracy} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Confiança</span>
                              <span className="font-medium">{pattern.confidence}%</span>
                            </div>
                            <Progress value={pattern.confidence} />
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {pattern.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">
                                {metric.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold">{metric.value}</span>
                                <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-muted-foreground">Última ocorrência:</span>
                            <span className="ml-2 font-medium">
                              {new Date(pattern.lastOccurrence).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Próxima prevista:</span>
                            <span className="ml-2 font-medium text-blue-600">
                              {new Date(pattern.predictedNext).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Análise Detalhada
                          </Button>
                          <Button size="sm" variant="outline">
                            <Timer className="h-4 w-4 mr-2" />
                            Histórico
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternRecognition;
