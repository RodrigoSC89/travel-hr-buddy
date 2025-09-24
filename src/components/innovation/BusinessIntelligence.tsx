import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Target,
  Zap,
  Brain,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
  category: 'financial' | 'operational' | 'people' | 'customer';
  status: 'good' | 'warning' | 'critical';
}

interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timeframe: string;
  recommendation: string;
  category: 'revenue' | 'cost' | 'efficiency' | 'risk';
}

export const BusinessIntelligence = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([
    {
      id: 'revenue',
      name: 'Receita Mensal',
      value: 285000,
      target: 300000,
      trend: 'up',
      change: 12.5,
      unit: 'R$',
      category: 'financial',
      status: 'good'
    },
    {
      id: 'productivity',
      name: 'Produtividade da Equipe',
      value: 87,
      target: 90,
      trend: 'up',
      change: 5.2,
      unit: '%',
      category: 'operational',
      status: 'good'
    },
    {
      id: 'satisfaction',
      name: 'Satisfação do Cliente',
      value: 94,
      target: 95,
      trend: 'stable',
      change: 0.8,
      unit: '%',
      category: 'customer',
      status: 'good'
    },
    {
      id: 'efficiency',
      name: 'Eficiência Operacional',
      value: 78,
      target: 85,
      trend: 'down',
      change: -2.1,
      unit: '%',
      category: 'operational',
      status: 'warning'
    },
    {
      id: 'retention',
      name: 'Retenção de Funcionários',
      value: 92,
      target: 95,
      trend: 'down',
      change: -3.2,
      unit: '%',
      category: 'people',
      status: 'warning'
    },
    {
      id: 'costs',
      name: 'Custos Operacionais',
      value: 145000,
      target: 140000,
      trend: 'up',
      change: 8.7,
      unit: 'R$',
      category: 'financial',
      status: 'critical'
    }
  ]);

  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([
    {
      id: '1',
      title: 'Oportunidade de Receita',
      description: 'Com base nos padrões atuais, há potencial para aumentar a receita em 23% implementando upselling automatizado.',
      impact: 'high',
      confidence: 89,
      timeframe: 'Próximos 3 meses',
      recommendation: 'Implementar sistema de recomendações inteligentes',
      category: 'revenue'
    },
    {
      id: '2',
      title: 'Risco de Rotatividade',
      description: 'Modelo preditivo indica 15% de chance de saída de funcionários-chave nos próximos 6 meses.',
      impact: 'high',
      confidence: 76,
      timeframe: 'Próximos 6 meses',
      recommendation: 'Revisar política de benefícios e desenvolvimento',
      category: 'risk'
    },
    {
      id: '3',
      title: 'Otimização de Custos',
      description: 'IA identificou oportunidade de reduzir custos operacionais em R$ 25.000 mensais através de automação.',
      impact: 'medium',
      confidence: 92,
      timeframe: 'Próximos 2 meses',
      recommendation: 'Automatizar processos administrativos repetitivos',
      category: 'cost'
    },
    {
      id: '4',
      title: 'Melhoria de Eficiência',
      description: 'Implementando workflows inteligentes, podemos aumentar a eficiência operacional em 18%.',
      impact: 'medium',
      confidence: 84,
      timeframe: 'Próximos 4 meses',
      recommendation: 'Expandir uso de workflows automatizados',
      category: 'efficiency'
    }
  ]);

  // Dados para gráficos
  const revenueData = [
    { month: 'Jan', revenue: 245000, target: 250000, costs: 120000 },
    { month: 'Fev', revenue: 268000, target: 260000, costs: 125000 },
    { month: 'Mar', revenue: 285000, target: 270000, costs: 130000 },
    { month: 'Abr', revenue: 301000, target: 280000, costs: 135000 },
    { month: 'Mai', revenue: 295000, target: 290000, costs: 140000 },
    { month: 'Jun', revenue: 285000, target: 300000, costs: 145000 }
  ];

  const productivityData = [
    { department: 'Vendas', productivity: 92, target: 90 },
    { department: 'Marketing', productivity: 87, target: 85 },
    { department: 'RH', productivity: 94, target: 95 },
    { department: 'TI', productivity: 89, target: 90 },
    { department: 'Financeiro', productivity: 96, target: 95 }
  ];

  const channelData = [
    { name: 'Digital', value: 45, color: '#8884d8' },
    { name: 'Presencial', value: 30, color: '#82ca9d' },
    { name: 'Telefone', value: 15, color: '#ffc658' },
    { name: 'Outros', value: 10, color: '#ff7300' }
  ];

  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const exportReport = () => {
    toast({
      title: "Relatório Exportado",
      description: "Relatório de BI exportado com sucesso para PDF",
    });
  };

  const shareInsights = () => {
    toast({
      title: "Insights Compartilhados",
      description: "Insights enviados para a equipe executiva",
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="financial">Financeiro</SelectItem>
              <SelectItem value="operational">Operacional</SelectItem>
              <SelectItem value="people">Pessoas</SelectItem>
              <SelectItem value="customer">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={shareInsights}>
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric) => (
          <Card key={metric.id} className="bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.unit === 'R$' ? 
                      `${metric.unit} ${metric.value.toLocaleString()}` : 
                      `${metric.value}${metric.unit}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {getTrendIcon(metric.trend)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta: {metric.unit === 'R$' ? 
                    `${metric.unit} ${metric.target.toLocaleString()}` : 
                    `${metric.target}${metric.unit}`
                  }</span>
                  <span className={metric.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <Progress value={(metric.value / metric.target) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendência de Receita vs Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Receita" />
                <Area type="monotone" dataKey="costs" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Custos" />
                <Line type="monotone" dataKey="target" stroke="#ff7300" strokeDasharray="5 5" name="Meta" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Produtividade por Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="productivity" fill="#8884d8" name="Atual" />
                <Bar dataKey="target" fill="#82ca9d" name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Distribuição por Canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Predictive Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Insights Preditivos de IA
            </CardTitle>
            <CardDescription>
              Análises e previsões baseadas em machine learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {predictiveInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{insight.timeframe}</span>
                      <span>Confiança: {insight.confidence}%</span>
                    </div>
                    
                    <Progress value={insight.confidence} className="h-1 mb-3" />
                    
                    <div className="bg-muted/50 p-2 rounded text-xs">
                      <strong>Recomendação:</strong> {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};