import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Database,
  Cpu,
  Network,
  Gauge,
  Eye,
  ChevronRight,
  Calendar,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Users,
  Wrench,
  Ship,
  Fuel,
  Compass
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface Prediction {
  id: string;
  type: 'maintenance' | 'compliance' | 'efficiency' | 'risk' | 'fuel' | 'weather';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate: Date;
  impact: string;
  module: string;
  status: 'active' | 'resolved' | 'monitoring';
  actions: string[];
  metadata: any;
}

interface MLModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'inactive';
  predictions: number;
  dataPoints: number;
}

const PredictiveAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [predictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'maintenance',
      title: 'Manutenção Preventiva Motor Principal',
      description: 'Motor principal da embarcação A-001 apresentará desgaste crítico em 7 dias baseado em padrões de vibração e temperatura',
      confidence: 94.2,
      priority: 'high',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      impact: 'Possível parada operacional de 8-12 horas',
      module: 'Frota',
      status: 'active',
      actions: ['Agendar manutenção', 'Verificar estoque de peças', 'Alocar técnico especializado'],
      metadata: { vessel: 'A-001', component: 'Motor Principal' }
    },
    {
      id: '2',
      type: 'compliance',
      title: 'Vencimento de Certificações STCW',
      description: '12 certificados STCW de tripulantes vencem nos próximos 30 dias, podendo impactar operações',
      confidence: 100,
      priority: 'critical',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      impact: 'Impedimento legal para operação',
      module: 'Certificações',
      status: 'active',
      actions: ['Agendar renovações', 'Contatar centro de treinamento', 'Verificar substitutos'],
      metadata: { certificates: 12, type: 'STCW' }
    },
    {
      id: '3',
      type: 'efficiency',
      title: 'Otimização de Rota Santos-Rio',
      description: 'IA identifica oportunidade de economia de 15% no consumo de combustível alterando rota baseado em condições meteorológicas',
      confidence: 87.5,
      priority: 'medium',
      targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      impact: 'Economia estimada: R$ 45.000',
      module: 'Navegação',
      status: 'active',
      actions: ['Aplicar nova rota', 'Validar com capitão', 'Monitorar consumo'],
      metadata: { route: 'Santos-Rio', savings: '15%' }
    },
    {
      id: '4',
      type: 'risk',
      title: 'Condições Meteorológicas Adversas',
      description: 'Tempestade severa prevista na rota planejada em 48h com ventos acima de 35 nós',
      confidence: 91.8,
      priority: 'high',
      targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      impact: 'Risco à segurança da tripulação',
      module: 'Meteorologia',
      status: 'monitoring',
      actions: ['Alterar rota', 'Adiar partida', 'Acompanhar previsão'],
      metadata: { windSpeed: '35+ nós', area: 'Costa Sudeste' }
    }
  ]);

  const [mlModels] = useState<MLModel[]>([
    {
      id: '1',
      name: 'Preditor de Manutenção',
      type: 'Regressão Temporal',
      accuracy: 94.2,
      lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      predictions: 1247,
      dataPoints: 58420
    },
    {
      id: '2',
      name: 'Otimizador de Rotas',
      type: 'Rede Neural',
      accuracy: 87.5,
      lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'active',
      predictions: 892,
      dataPoints: 34210
    },
    {
      id: '3',
      name: 'Detector de Anomalias',
      type: 'Isolation Forest',
      accuracy: 91.8,
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'training',
      predictions: 2156,
      dataPoints: 78650
    }
  ]);

  // Dados simulados para gráficos
  const predictionAccuracyData = [
    { month: 'Jan', maintenance: 92, compliance: 98, efficiency: 85, risk: 88 },
    { month: 'Fev', maintenance: 93, compliance: 97, efficiency: 87, risk: 90 },
    { month: 'Mar', maintenance: 94, compliance: 99, efficiency: 86, risk: 91 },
    { month: 'Abr', maintenance: 95, compliance: 98, efficiency: 88, risk: 92 },
    { month: 'Mai', maintenance: 94, compliance: 99, efficiency: 89, risk: 90 },
    { month: 'Jun', maintenance: 96, compliance: 100, efficiency: 87, risk: 93 }
  ];

  const costSavingsData = [
    { month: 'Jan', maintenance: 85000, fuel: 120000, compliance: 25000 },
    { month: 'Fev', maintenance: 92000, fuel: 135000, compliance: 18000 },
    { month: 'Mar', maintenance: 78000, fuel: 145000, compliance: 30000 },
    { month: 'Abr', maintenance: 105000, fuel: 125000, compliance: 22000 },
    { month: 'Mai', maintenance: 88000, fuel: 140000, compliance: 35000 },
    { month: 'Jun', maintenance: 95000, fuel: 155000, compliance: 28000 }
  ];

  const predictionTypeDistribution = [
    { name: 'Manutenção', value: 35, color: '#8B5CF6' },
    { name: 'Compliance', value: 25, color: '#06B6D4' },
    { name: 'Eficiência', value: 20, color: '#10B981' },
    { name: 'Riscos', value: 20, color: '#F59E0B' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular atualização de dados
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast({
      title: "Dados Atualizados",
      description: "Predições e modelos atualizados com sucesso",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="h-5 w-5" />;
      case 'compliance': return <Shield className="h-5 w-5" />;
      case 'efficiency': return <Gauge className="h-5 w-5" />;
      case 'risk': return <AlertTriangle className="h-5 w-5" />;
      case 'fuel': return <Fuel className="h-5 w-5" />;
      case 'weather': return <Compass className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'training': return 'text-blue-600 bg-blue-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/20">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Análise Preditiva Avançada
            </h1>
            <p className="text-muted-foreground">
              Inteligência artificial para predições estratégicas e otimização operacional
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-w-32"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{predictions.length}</div>
                <div className="text-sm text-muted-foreground">Predições Ativas</div>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">92.8%</div>
                <div className="text-sm text-muted-foreground">Precisão Média</div>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">R$ 2.8M</div>
                <div className="text-sm text-muted-foreground">Economia Projetada</div>
              </div>
              <div className="p-2 rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mlModels.length}</div>
                <div className="text-sm text-muted-foreground">Modelos Ativos</div>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="models">Modelos ML</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Precisão dos Modelos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictionAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="compliance" stackId="1" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="risk" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Prediction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Distribuição de Predições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={predictionTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {predictionTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Economia Gerada por Categoria (R$)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costSavingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Economia']} />
                  <Legend />
                  <Bar dataKey="maintenance" fill="#8B5CF6" name="Manutenção" />
                  <Bar dataKey="fuel" fill="#10B981" name="Combustível" />
                  <Bar dataKey="compliance" fill="#06B6D4" name="Compliance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getTypeIcon(prediction.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{prediction.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{prediction.module}</Badge>
                          <span>•</span>
                          <span>Confiança: {prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(prediction.priority)}>
                        {prediction.priority === 'critical' ? 'Crítico' :
                         prediction.priority === 'high' ? 'Alto' :
                         prediction.priority === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                      <Badge variant="outline">
                        {prediction.status === 'active' ? 'Ativo' :
                         prediction.status === 'resolved' ? 'Resolvido' : 'Monitorando'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{prediction.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Data Prevista</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{prediction.targetDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Impacto</div>
                      <div className="font-medium">{prediction.impact}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Confiança</div>
                      <div className="flex items-center gap-2">
                        <Progress value={prediction.confidence} className="flex-1" />
                        <span className="font-medium">{prediction.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Ações Recomendadas</div>
                    <div className="flex flex-wrap gap-2">
                      {prediction.actions.map((action, index) => (
                        <Button key={index} variant="outline" size="sm">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mlModels.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {model.name}
                    </CardTitle>
                    <Badge className={getStatusColor(model.status)}>
                      {model.status === 'active' ? 'Ativo' :
                       model.status === 'training' ? 'Treinando' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Tipo</div>
                    <div className="font-medium">{model.type}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                    <div className="flex items-center gap-2">
                      <Progress value={model.accuracy} className="flex-1" />
                      <span className="font-medium">{model.accuracy}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Predições</div>
                      <div className="font-medium">{model.predictions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Dados</div>
                      <div className="font-medium">{model.dataPoints.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Último Treinamento</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{model.lastTrained.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Monitorar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Modelos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mlModels.map((model) => (
                    <div key={model.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{model.name}</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">2,856</div>
                      <div className="text-sm text-muted-foreground">Predições Hoje</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">98.7%</div>
                      <div className="text-sm text-muted-foreground">Disponibilidade</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">1.2TB</div>
                      <div className="text-sm text-muted-foreground">Dados Processados</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">24ms</div>
                      <div className="text-sm text-muted-foreground">Latência Média</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Padrão Identificado</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Embarcações com manutenção preventiva regular têm 34% menos falhas não programadas
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Tendência Detectada</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Consumo de combustível 8% menor em rotas otimizadas por IA nos últimos 30 dias
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Anomalia Detectada</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aumento de 15% em alertas de vibração no setor de motores principais
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recomendações Estratégicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800 mb-2">Otimização de Frota</div>
                    <p className="text-sm text-blue-700">
                      Implementar rotinas de manutenção preditiva pode reduzir custos operacionais em até 25%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 mb-2">Eficiência Energética</div>
                    <p className="text-sm text-green-700">
                      Adotar rotas inteligentes pode economizar R$ 180.000 em combustível por mês
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="font-medium text-purple-800 mb-2">Gestão de Riscos</div>
                    <p className="text-sm text-purple-700">
                      Sistema de alertas avançados pode prevenir 90% dos incidentes operacionais
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;