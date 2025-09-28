import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

interface KPIMetric {
  id: string;
  name: string;
  category: 'safety' | 'operational' | 'financial' | 'environmental' | 'quality';
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

interface PerformanceData {
  period: string;
  metrics: {
    [key: string]: number;
  };
}

export const PeotramPerformanceKPI: React.FC = () => {
  const [metrics, setMetrics] = useState<KPIMetric[]>(getDemoMetrics());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  function getDemoMetrics(): KPIMetric[] {
    return [
      {
        id: 'SAFETY001',
        name: 'Taxa de Incidentes de Segurança',
        category: 'safety',
        current: 0.12,
        target: 0.05,
        unit: 'por 1000h',
        trend: 'down',
        trendValue: -15.2,
        status: 'warning',
        description: 'Número de incidentes de segurança por 1000 horas trabalhadas',
        lastUpdated: '2024-01-22T10:00:00Z'
      },
      {
        id: 'OPS001',
        name: 'Eficiência Operacional',
        category: 'operational',
        current: 94.5,
        target: 95.0,
        unit: '%',
        trend: 'up',
        trendValue: 2.1,
        status: 'good',
        description: 'Percentual de operações realizadas conforme planejado',
        lastUpdated: '2024-01-22T09:30:00Z'
      },
      {
        id: 'ENV001',
        name: 'Emissões de CO2',
        category: 'environmental',
        current: 285,
        target: 250,
        unit: 'ton/mês',
        trend: 'down',
        trendValue: -8.7,
        status: 'warning',
        description: 'Emissões mensais de dióxido de carbono',
        lastUpdated: '2024-01-22T08:15:00Z'
      },
      {
        id: 'QUAL001',
        name: 'Conformidade de Auditoria',
        category: 'quality',
        current: 98.2,
        target: 99.0,
        unit: '%',
        trend: 'up',
        trendValue: 1.5,
        status: 'excellent',
        description: 'Percentual de conformidade em auditorias PEOTRAM',
        lastUpdated: '2024-01-22T07:45:00Z'
      },
      {
        id: 'FIN001',
        name: 'Custo por Operação',
        category: 'financial',
        current: 15420,
        target: 14500,
        unit: 'R$',
        trend: 'up',
        trendValue: 3.2,
        status: 'warning',
        description: 'Custo médio por operação realizada',
        lastUpdated: '2024-01-22T06:30:00Z'
      },
      {
        id: 'OPS002',
        name: 'Tempo de Resposta',
        category: 'operational',
        current: 8.5,
        target: 10.0,
        unit: 'min',
        trend: 'down',
        trendValue: -12.5,
        status: 'excellent',
        description: 'Tempo médio de resposta a emergências',
        lastUpdated: '2024-01-22T05:20:00Z'
      }
    ];
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success/20 text-success border-success/30';
      case 'good': return 'bg-info/20 text-info border-info/30';
      case 'warning': return 'bg-warning/20 text-warning border-warning/30';
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-destructive/20 text-destructive';
      case 'operational': return 'bg-primary/20 text-primary';
      case 'financial': return 'bg-success/20 text-success';
      case 'environmental': return 'bg-info/20 text-info';
      case 'quality': return 'bg-warning/20 text-warning';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <AlertTriangle className="w-4 h-4" />;
      case 'operational': return <Activity className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'environmental': return <TrendingUp className="w-4 h-4" />;
      case 'quality': return <Award className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'up') {
      return <TrendingUp className={`w-4 h-4 ${value > 0 ? 'text-success' : 'text-destructive'}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`w-4 h-4 ${value < 0 ? 'text-success' : 'text-destructive'}`} />;
    }
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const filteredMetrics = metrics.filter(metric => 
    selectedCategory === 'all' || metric.category === selectedCategory
  );

  const categoryStats = {
    safety: metrics.filter(m => m.category === 'safety').length,
    operational: metrics.filter(m => m.category === 'operational').length,
    financial: metrics.filter(m => m.category === 'financial').length,
    environmental: metrics.filter(m => m.category === 'environmental').length,
    quality: metrics.filter(m => m.category === 'quality').length
  };

  const overallPerformance = Math.round(
    metrics.reduce((acc, metric) => acc + calculateProgress(metric.current, metric.target), 0) / metrics.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance e KPIs</h2>
          <p className="text-muted-foreground">
            Indicadores chave de performance e métricas operacionais
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Performance Geral</p>
                <p className="text-2xl font-bold text-primary">{overallPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas Atingidas</p>
                <p className="text-2xl font-bold text-success">
                  {metrics.filter(m => m.status === 'excellent' || m.status === 'good').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/20">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-warning">
                  {metrics.filter(m => m.status === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-info/20">
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total KPIs</p>
                <p className="text-2xl font-bold text-info">{metrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="safety">Segurança</SelectItem>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="environmental">Ambiental</SelectItem>
                <SelectItem value="quality">Qualidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(metric.category)}
                      <div>
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                        <CardDescription>{metric.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getCategoryColor(metric.category)}>
                        {metric.category}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Atual</p>
                      <p className="text-2xl font-bold text-primary">
                        {metric.current}{metric.unit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="text-xl font-semibold text-muted-foreground">
                        {metric.target}{metric.unit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tendência</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(metric.trend, metric.trendValue)}
                        <span className={`font-semibold ${
                          metric.trendValue > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {Math.abs(metric.trendValue)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da Meta</span>
                      <span>{Math.round(calculateProgress(metric.current, metric.target))}%</span>
                    </div>
                    <Progress value={calculateProgress(metric.current, metric.target)} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Atualizado: {new Date(metric.lastUpdated).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="text-center p-8">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Análise de Tendências</h3>
            <p className="text-muted-foreground mb-4">
              Gráficos de tendência histórica dos KPIs
            </p>
            <Button>
              <BarChart3 className="w-4 h-4 mr-2" />
              Visualizar Gráficos
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category)}>
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="font-semibold capitalize mb-2">{category}</h3>
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm text-muted-foreground">KPIs</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};