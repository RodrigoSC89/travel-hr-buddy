import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Calendar,
  BarChart3,
  Tool,
  AlertCircle,
  Battery,
  Gauge
} from 'lucide-react';

interface MaintenanceItem {
  id: string;
  equipment: string;
  vessel: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'inprogress' | 'completed' | 'overdue';
  scheduledDate: string;
  predictedFailure?: {
    probability: number;
    daysUntil: number;
    confidence: number;
  };
  healthScore: number;
  lastService: string;
  nextService: string;
  hoursOperation: number;
  estimatedCost: number;
  aiRecommendation: string;
}

export const PredictiveMaintenanceSystem: React.FC = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([
    {
      id: '1',
      equipment: 'Motor Principal - Diesel MAN B&W',
      vessel: 'MV-Atlas',
      type: 'predictive',
      priority: 'high',
      status: 'scheduled',
      scheduledDate: '2025-05-18',
      predictedFailure: {
        probability: 87,
        daysUntil: 6,
        confidence: 92
      },
      healthScore: 68,
      lastService: '2025-03-10',
      nextService: '2025-05-18',
      hoursOperation: 2450,
      estimatedCost: 35000,
      aiRecommendation: 'Análise de vibração detectou anomalia crescente. Substituição preventiva de rolamentos recomendada para evitar falha catastrófica.'
    },
    {
      id: '2',
      equipment: 'Sistema Hidráulico de Propulsão',
      vessel: 'MV-Neptune',
      type: 'preventive',
      priority: 'medium',
      status: 'scheduled',
      scheduledDate: '2025-05-25',
      healthScore: 82,
      lastService: '2025-04-01',
      nextService: '2025-05-25',
      hoursOperation: 1850,
      estimatedCost: 18500,
      aiRecommendation: 'Manutenção preventiva de rotina. Pressão do sistema estável. Trocar filtros e verificar vedações.'
    },
    {
      id: '3',
      equipment: 'Gerador Auxiliar #2',
      vessel: 'MV-Poseidon',
      type: 'predictive',
      priority: 'critical',
      status: 'overdue',
      scheduledDate: '2025-05-10',
      predictedFailure: {
        probability: 94,
        daysUntil: -2,
        confidence: 96
      },
      healthScore: 45,
      lastService: '2025-02-15',
      nextService: '2025-05-10',
      hoursOperation: 3200,
      estimatedCost: 42000,
      aiRecommendation: 'URGENTE: Temperatura de operação 15% acima do normal. Provável falha de sistema de resfriamento. Intervenção imediata necessária.'
    },
    {
      id: '4',
      equipment: 'Sistema DP (Dynamic Positioning)',
      vessel: 'MV-Atlas',
      type: 'preventive',
      priority: 'high',
      status: 'inprogress',
      scheduledDate: '2025-05-12',
      healthScore: 88,
      lastService: '2025-02-20',
      nextService: '2025-08-20',
      hoursOperation: 1200,
      estimatedCost: 28000,
      aiRecommendation: 'Calibração de sensores em andamento. Performance dentro da especificação. Concluir testes de redundância.'
    },
    {
      id: '5',
      equipment: 'Bomba de Incêndio Principal',
      vessel: 'MV-Neptune',
      type: 'preventive',
      priority: 'medium',
      status: 'completed',
      scheduledDate: '2025-05-05',
      healthScore: 95,
      lastService: '2025-05-05',
      nextService: '2025-08-05',
      hoursOperation: 450,
      estimatedCost: 8500,
      aiRecommendation: 'Manutenção concluída com sucesso. Sistema operando em condições ótimas. Próxima verificação em 90 dias.'
    },
    {
      id: '6',
      equipment: 'Compressor de Ar Principal',
      vessel: 'MV-Poseidon',
      type: 'predictive',
      priority: 'medium',
      status: 'scheduled',
      scheduledDate: '2025-05-30',
      predictedFailure: {
        probability: 65,
        daysUntil: 18,
        confidence: 78
      },
      healthScore: 75,
      lastService: '2025-03-15',
      nextService: '2025-05-30',
      hoursOperation: 1980,
      estimatedCost: 15000,
      aiRecommendation: 'Consumo elétrico 8% acima do padrão. Possível desgaste de válvulas. Agendar inspeção e manutenção preventiva.'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'inprogress': return 'text-blue-600';
      case 'scheduled': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'predictive': return <Zap className="h-5 w-5 text-purple-600" />;
      case 'preventive': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'corrective': return <Tool className="h-5 w-5 text-orange-600" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Wrench className="h-5 w-5" />;
    }
  };

  const totalItems = maintenanceItems.length;
  const criticalItems = maintenanceItems.filter(i => i.priority === 'critical').length;
  const overdueItems = maintenanceItems.filter(i => i.status === 'overdue').length;
  const avgHealthScore = Math.round(
    maintenanceItems.reduce((sum, i) => sum + i.healthScore, 0) / maintenanceItems.length
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Sob monitoramento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems + overdueItems}</div>
            <p className="text-xs text-muted-foreground">Ação urgente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saúde Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(avgHealthScore)}`}>
              {avgHealthScore}%
            </div>
            <p className="text-xs text-muted-foreground">Score da frota</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(maintenanceItems.reduce((sum, i) => sum + i.estimatedCost, 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Sistema de Manutenção Preditiva
              </CardTitle>
              <CardDescription>
                IA analisa padrões e prevê falhas antes que ocorram
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              IA Ativa
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="predictive">Preditiva</TabsTrigger>
              <TabsTrigger value="preventive">Preventiva</TabsTrigger>
              <TabsTrigger value="critical">Críticos</TabsTrigger>
              <TabsTrigger value="overdue">Atrasados</TabsTrigger>
            </TabsList>

            {['all', 'predictive', 'preventive', 'critical', 'overdue'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                {maintenanceItems
                  .filter(item => {
                    if (tab === 'all') return true;
                    if (tab === 'predictive') return item.type === 'predictive';
                    if (tab === 'preventive') return item.type === 'preventive';
                    if (tab === 'critical') return item.priority === 'critical';
                    if (tab === 'overdue') return item.status === 'overdue';
                    return true;
                  })
                  .map((item) => (
                    <Card key={item.id} className={`border-l-4 ${
                      item.priority === 'critical' || item.status === 'overdue' ? 'border-l-red-600' :
                      item.priority === 'high' ? 'border-l-orange-600' :
                      item.priority === 'medium' ? 'border-l-yellow-600' :
                      'border-l-green-600'
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">{item.equipment}</CardTitle>
                                <Badge variant={getPriorityColor(item.priority) as any}>
                                  {item.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <CardDescription className="mt-1">
                                {item.vessel} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                              {item.status === 'completed' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                              {item.status === 'inprogress' && <Activity className="h-4 w-4 inline mr-1" />}
                              {item.status === 'overdue' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                              {item.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Health Score */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Battery className="h-4 w-4" />
                              Saúde do Equipamento
                            </span>
                            <span className={`font-medium ${getHealthColor(item.healthScore)}`}>
                              {item.healthScore}%
                            </span>
                          </div>
                          <Progress value={item.healthScore} className="h-2" />
                        </div>

                        {/* Predictive Failure Alert */}
                        {item.predictedFailure && (
                          <div className={`p-3 rounded-lg ${
                            item.predictedFailure.probability >= 90 ? 'bg-red-50 dark:bg-red-950' :
                            item.predictedFailure.probability >= 75 ? 'bg-orange-50 dark:bg-orange-950' :
                            'bg-yellow-50 dark:bg-yellow-950'
                          }`}>
                            <div className="flex items-start gap-2">
                              <AlertCircle className={`h-5 w-5 mt-0.5 ${
                                item.predictedFailure.probability >= 90 ? 'text-red-600' :
                                item.predictedFailure.probability >= 75 ? 'text-orange-600' :
                                'text-yellow-600'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">Previsão de Falha</div>
                                <div className="text-sm mt-1">
                                  Probabilidade: <span className="font-bold">{item.predictedFailure.probability}%</span>
                                  {' • '}
                                  Tempo: <span className="font-bold">
                                    {item.predictedFailure.daysUntil > 0 
                                      ? `${item.predictedFailure.daysUntil} dias` 
                                      : `${Math.abs(item.predictedFailure.daysUntil)} dias atrás`}
                                  </span>
                                  {' • '}
                                  Confiança IA: <span className="font-bold">{item.predictedFailure.confidence}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Horas Op.</div>
                            <div className="font-bold">{item.hoursOperation.toLocaleString()}h</div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Último</div>
                            <div className="text-xs font-medium">
                              {new Date(item.lastService).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Próximo</div>
                            <div className="text-xs font-medium">
                              {new Date(item.nextService).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground mb-1">Custo</div>
                            <div className="font-bold text-xs">R$ {(item.estimatedCost / 1000).toFixed(0)}k</div>
                          </div>
                        </div>

                        {/* AI Recommendation */}
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 mt-0.5 text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Recomendação da IA
                              </div>
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {item.aiRecommendation}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {item.status === 'scheduled' && (
                            <>
                              <Button size="sm" className="flex-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                Iniciar Manutenção
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Reagendar
                              </Button>
                            </>
                          )}
                          {item.status === 'overdue' && (
                            <>
                              <Button size="sm" variant="destructive" className="flex-1">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Ação Urgente
                              </Button>
                              <Button size="sm" variant="outline">
                                Detalhes
                              </Button>
                            </>
                          )}
                          {item.status === 'inprogress' && (
                            <>
                              <Button size="sm" variant="default" className="flex-1">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Concluir
                              </Button>
                              <Button size="sm" variant="outline">
                                Atualizar Status
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
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

export default PredictiveMaintenanceSystem;
