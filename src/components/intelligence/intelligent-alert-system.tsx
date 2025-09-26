import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Shield,
  Thermometer,
  Fuel,
  Ship,
  Users,
  MapPin
} from 'lucide-react';

interface SmartAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'maintenance' | 'safety' | 'efficiency' | 'compliance' | 'crew' | 'weather';
  title: string;
  description: string;
  vessel_id?: string;
  vessel_name?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
  ai_confidence: number;
  recommended_actions: string[];
  impact_assessment: string;
}

interface AIInsight {
  id: string;
  insight_type: 'predictive' | 'diagnostic' | 'prescriptive';
  title: string;
  description: string;
  confidence_score: number;
  business_impact: 'high' | 'medium' | 'low';
  data_sources: string[];
  recommendations: string[];
  timeline: string;
  cost_benefit: {
    potential_savings: number;
    implementation_cost: number;
    roi_percentage: number;
  };
}

interface SystemHealth {
  overall_score: number;
  fleet_efficiency: number;
  safety_compliance: number;
  crew_performance: number;
  fuel_optimization: number;
  maintenance_status: number;
  weather_preparedness: number;
  last_updated: string;
}

export const IntelligentAlertSystem = () => {
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState('alerts');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadIntelligentData();
    setupRealTimeUpdates();
  }, []);

  const loadIntelligentData = async () => {
    try {
      setLoading(true);
      
      // Mock intelligent alerts
      const mockAlerts: SmartAlert[] = [
        {
          id: '1',
          type: 'critical',
          category: 'maintenance',
          title: 'Falha Iminente do Motor - MV Atlantic Explorer',
          description: 'IA detectou padrões anômalos na temperatura e vibração do motor principal. Falha prevista em 72h.',
          vessel_id: '1',
          vessel_name: 'MV Atlantic Explorer',
          priority: 'high',
          status: 'new',
          created_at: '2024-01-20T14:30:00Z',
          ai_confidence: 94,
          recommended_actions: [
            'Inspecionar sistema de refrigeração imediatamente',
            'Verificar níveis de óleo e filtros',
            'Agendar parada para manutenção preventiva',
            'Preparar equipe de engenharia para reparo'
          ],
          impact_assessment: 'Potencial parada operacional de 48-72h, custo estimado R$ 85.000'
        },
        {
          id: '2',
          type: 'warning',
          category: 'weather',
          title: 'Condições Meteorológicas Adversas - Rota Santos',
          description: 'Tempestade tropical se aproximando da rota. Ventos de até 45 nós previstos.',
          vessel_id: '2',
          vessel_name: 'MS Ocean Pioneer',
          priority: 'high',
          status: 'acknowledged',
          created_at: '2024-01-20T12:15:00Z',
          ai_confidence: 87,
          recommended_actions: [
            'Considerar rota alternativa via Canal de São Sebastião',
            'Reduzir velocidade para 8 nós',
            'Alertar tripulação sobre condições adversas',
            'Monitorar previsão meteorológica a cada 2h'
          ],
          impact_assessment: 'Atraso estimado de 6-8h, consumo adicional de combustível'
        },
        {
          id: '3',
          type: 'info',
          category: 'efficiency',
          title: 'Oportunidade de Otimização - Consumo de Combustível',
          description: 'IA identificou rota 12% mais eficiente para próxima viagem da MV Pacific Star.',
          vessel_id: '3',
          vessel_name: 'MV Pacific Star',
          priority: 'medium',
          status: 'new',
          created_at: '2024-01-20T10:45:00Z',
          ai_confidence: 91,
          recommended_actions: [
            'Implementar rota otimizada no sistema de navegação',
            'Ajustar velocidade para 14 nós durante o trajeto',
            'Monitorar consumo em tempo real'
          ],
          impact_assessment: 'Economia estimada de R$ 15.000 em combustível'
        },
        {
          id: '4',
          type: 'warning',
          category: 'crew',
          title: 'Fadiga da Tripulação Detectada - MS Baltic Wind',
          description: 'Padrões de trabalho indicam níveis elevados de fadiga em 60% da tripulação.',
          vessel_id: '4',
          vessel_name: 'MS Baltic Wind',
          priority: 'medium',
          status: 'in_progress',
          created_at: '2024-01-20T08:30:00Z',
          ai_confidence: 83,
          recommended_actions: [
            'Reorganizar escalas de trabalho',
            'Implementar pausas obrigatórias de 2h',
            'Considerar rotação de pessoal no próximo porto',
            'Monitorar sinais vitais da equipe'
          ],
          impact_assessment: 'Risco de acidentes aumentado em 35%'
        },
        {
          id: '5',
          type: 'success',
          category: 'compliance',
          title: 'Conformidade Certificações - Frota Completa',
          description: 'Todas as certificações da frota estão em conformidade. Próxima revisão em 30 dias.',
          priority: 'low',
          status: 'resolved',
          created_at: '2024-01-20T06:00:00Z',
          resolved_at: '2024-01-20T14:00:00Z',
          ai_confidence: 99,
          recommended_actions: [
            'Manter cronograma de renovações',
            'Agendar treinamentos de atualização'
          ],
          impact_assessment: 'Zero riscos de conformidade identificados'
        }
      ];

      const mockInsights: AIInsight[] = [
        {
          id: '1',
          insight_type: 'predictive',
          title: 'Previsão de Demanda de Combustível',
          description: 'Baseado em padrões históricos e condições meteorológicas, prevê-se aumento de 18% no consumo de combustível nos próximos 15 dias.',
          confidence_score: 89,
          business_impact: 'high',
          data_sources: ['Consumo histórico', 'Previsão meteorológica', 'Rotas planejadas'],
          recommendations: [
            'Negociar contratos de combustível com fornecedores',
            'Otimizar rotas para reduzir consumo',
            'Considerar compra antecipada com desconto'
          ],
          timeline: '15 dias',
          cost_benefit: {
            potential_savings: 45000,
            implementation_cost: 8000,
            roi_percentage: 462
          }
        },
        {
          id: '2',
          insight_type: 'prescriptive',
          title: 'Otimização de Escalas da Tripulação',
          description: 'Análise de produtividade sugere nova configuração de escalas que pode aumentar eficiência em 23%.',
          confidence_score: 92,
          business_impact: 'medium',
          data_sources: ['Dados de produtividade', 'Satisfação da tripulação', 'Incidentes de segurança'],
          recommendations: [
            'Implementar escalas de 6h com 2h de descanso',
            'Rotacionar funções críticas a cada 12h',
            'Adicionar período de recreação de 1h'
          ],
          timeline: '30 dias',
          cost_benefit: {
            potential_savings: 28000,
            implementation_cost: 5000,
            roi_percentage: 460
          }
        },
        {
          id: '3',
          insight_type: 'diagnostic',
          title: 'Análise de Padrões de Manutenção',
          description: 'Identificados padrões que sugerem manutenção preditiva pode reduzir custos de reparo em 35%.',
          confidence_score: 87,
          business_impact: 'high',
          data_sources: ['Histórico de manutenção', 'Sensores IoT', 'Relatórios de inspeção'],
          recommendations: [
            'Instalar sensores IoT adicionais',
            'Implementar algoritmo de manutenção preditiva',
            'Treinar equipe em novas práticas'
          ],
          timeline: '60 dias',
          cost_benefit: {
            potential_savings: 75000,
            implementation_cost: 25000,
            roi_percentage: 200
          }
        }
      ];

      const mockSystemHealth: SystemHealth = {
        overall_score: 87,
        fleet_efficiency: 89,
        safety_compliance: 96,
        crew_performance: 84,
        fuel_optimization: 91,
        maintenance_status: 78,
        weather_preparedness: 93,
        last_updated: new Date().toISOString()
      };

      setSmartAlerts(mockAlerts);
      setAiInsights(mockInsights);
      setSystemHealth(mockSystemHealth);
      
    } catch (error) {
      console.error('Error loading intelligent data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados inteligentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Set up real-time updates for critical alerts
    const interval = setInterval(() => {
      // In production, this would listen to Supabase real-time updates
      console.log('Checking for new intelligent alerts...');
    }, 30000);

    return () => clearInterval(interval);
  };

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return Bell;
      case 'info': return Activity;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getAlertColor = (type: SmartAlert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: SmartAlert['category']) => {
    switch (category) {
      case 'maintenance': return Ship;
      case 'safety': return Shield;
      case 'efficiency': return TrendingUp;
      case 'compliance': return CheckCircle;
      case 'crew': return Users;
      case 'weather': return Thermometer;
      default: return Activity;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAlerts = smartAlerts.filter(alert => 
    filterType === 'all' || alert.category === filterType
  );

  const criticalAlerts = smartAlerts.filter(alert => alert.type === 'critical').length;
  const warningAlerts = smartAlerts.filter(alert => alert.type === 'warning').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Alertas Inteligentes</h2>
          <p className="text-muted-foreground">
            IA avançada para monitoramento e otimização da frota
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            IA Ativa
          </Badge>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Otimizar Agora
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {criticalAlerts} alerta(s) crítico(s) e {warningAlerts} aviso(s) requerem ação imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getHealthColor(systemHealth.overall_score)}`}>
                  {systemHealth.overall_score}%
                </div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
                <Progress value={systemHealth.overall_score} className="h-2 mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(systemHealth.fleet_efficiency)}`}>
                  {systemHealth.fleet_efficiency}%
                </div>
                <div className="text-sm text-muted-foreground">Eficiência</div>
                <Progress value={systemHealth.fleet_efficiency} className="h-2 mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(systemHealth.safety_compliance)}`}>
                  {systemHealth.safety_compliance}%
                </div>
                <div className="text-sm text-muted-foreground">Segurança</div>
                <Progress value={systemHealth.safety_compliance} className="h-2 mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(systemHealth.fuel_optimization)}`}>
                  {systemHealth.fuel_optimization}%
                </div>
                <div className="text-sm text-muted-foreground">Combustível</div>
                <Progress value={systemHealth.fuel_optimization} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">Alertas Inteligentes</TabsTrigger>
          <TabsTrigger value="insights">Insights de IA</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alert Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button 
                  variant={filterType === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  Todos
                </Button>
                <Button 
                  variant={filterType === 'maintenance' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('maintenance')}
                >
                  Manutenção
                </Button>
                <Button 
                  variant={filterType === 'safety' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('safety')}
                >
                  Segurança
                </Button>
                <Button 
                  variant={filterType === 'efficiency' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('efficiency')}
                >
                  Eficiência
                </Button>
                <Button 
                  variant={filterType === 'crew' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('crew')}
                >
                  Tripulação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Smart Alerts */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              const CategoryIcon = getCategoryIcon(alert.category);
              
              return (
                <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <AlertIcon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">
                              IA: {alert.ai_confidence}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {alert.description}
                          </p>
                          
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Impacto Estimado:
                            </div>
                            <div className="text-sm">{alert.impact_assessment}</div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Ações Recomendadas:
                            </div>
                            <ul className="text-sm space-y-1">
                              {alert.recommended_actions.map((action, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-primary">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(alert.created_at).toLocaleString()}
                            </div>
                            {alert.vessel_name && (
                              <div className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {alert.vessel_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Reconhecer
                        </Button>
                        <Button size="sm">
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          {insight.insight_type}
                        </Badge>
                        <Badge className={
                          insight.business_impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.business_impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {insight.business_impact === 'high' ? 'Alto Impacto' :
                           insight.business_impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Economia Potencial</div>
                          <div className="text-lg font-bold text-green-600">
                            R$ {insight.cost_benefit.potential_savings.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Custo de Implementação</div>
                          <div className="text-lg font-bold">
                            R$ {insight.cost_benefit.implementation_cost.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">ROI</div>
                          <div className="text-lg font-bold text-green-600">
                            {insight.cost_benefit.roi_percentage}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Recomendações:
                        </div>
                        <ul className="text-sm space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Confiança: {insight.confidence_score}%
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Timeline: {insight.timeline}
                        </div>
                      </div>
                    </div>
                    
                    <Button>
                      Implementar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Recomendações Personalizadas</h3>
              <p className="text-muted-foreground">
                Sistema de recomendações baseado em IA em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};