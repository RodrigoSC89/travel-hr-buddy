import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Clock,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  target: number;
  period: string;
  category: string;
}

interface BusinessMetrics {
  revenue: {
    current: number;
    target: number;
    growth: number;
  };
  users: {
    active: number;
    new: number;
    retention: number;
  };
  performance: {
    efficiency: number;
    quality: number;
    satisfaction: number;
  };
  operational: {
    costs: number;
    savings: number;
    optimization: number;
  };
}

export const BusinessKPIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadKPIData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: BusinessMetrics = {
        revenue: {
          current: 2450000,
          target: 3000000,
          growth: 15.3
        },
        users: {
          active: 1847,
          new: 234,
          retention: 89.2
        },
        performance: {
          efficiency: 94.5,
          quality: 91.8,
          satisfaction: 4.7
        },
        operational: {
          costs: 1450000,
          savings: 320000,
          optimization: 22.1
        }
      };

      const mockKPIs: KPIMetric[] = [
        {
          id: '1',
          title: 'Receita Total',
          value: 'R$ 2.45M',
          change: 15.3,
          changeType: 'increase',
          target: 80,
          period: 'vs mês anterior',
          category: 'financial'
        },
        {
          id: '2',
          title: 'Usuários Ativos',
          value: '1,847',
          change: 12.7,
          changeType: 'increase',
          target: 92,
          period: 'últimos 30 dias',
          category: 'users'
        },
        {
          id: '3',
          title: 'Eficiência Operacional',
          value: '94.5%',
          change: 8.2,
          changeType: 'increase',
          target: 95,
          period: 'vs trimestre anterior',
          category: 'operational'
        },
        {
          id: '4',
          title: 'Satisfação do Cliente',
          value: '4.7/5.0',
          change: 3.1,
          changeType: 'increase',
          target: 94,
          period: 'média mensal',
          category: 'quality'
        },
        {
          id: '5',
          title: 'Economia de Custos',
          value: 'R$ 320K',
          change: 28.4,
          changeType: 'increase',
          target: 85,
          period: 'este trimestre',
          category: 'financial'
        },
        {
          id: '6',
          title: 'Taxa de Retenção',
          value: '89.2%',
          change: -2.1,
          changeType: 'decrease',
          target: 89,
          period: 'últimos 6 meses',
          category: 'users'
        }
      ];

      setMetrics(mockMetrics);
      setKpis(mockKPIs);
      setLastUpdated(new Date());
      
      toast({
        title: "KPIs Atualizados",
        description: "Indicadores de performance carregados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar KPIs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKPIData();
  }, []);

  const getChangeIcon = (type: 'increase' | 'decrease') => {
    return type === 'increase' ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getChangeColor = (type: 'increase' | 'decrease') => {
    return type === 'increase' ? 'text-green-600' : 'text-red-600';
  };

  const getCategoryKPIs = (category: string) => {
    return kpis.filter(kpi => kpi.category === category);
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Carregando KPIs de negócio...</p>
            <Button onClick={loadKPIData} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Carregar KPIs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KPIs de Negócio</h2>
          <p className="text-muted-foreground">
            Indicadores-chave de performance e métricas estratégicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <Button onClick={loadKPIData} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4 text-green-600" />
              Receita Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {(metrics.revenue.current / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Meta:</span>
              <span>R$ {(metrics.revenue.target / 1000000).toFixed(1)}M</span>
            </div>
            <Progress 
              value={(metrics.revenue.current / metrics.revenue.target) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-blue-600" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.users.active.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>+{metrics.users.new} novos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-purple-600" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.performance.efficiency}%
            </div>
            <Progress value={metrics.performance.efficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.performance.satisfaction}/5.0
            </div>
            <Progress value={metrics.performance.satisfaction * 20} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed KPIs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os KPIs</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    
                    <div className="flex items-center gap-2">
                      {getChangeIcon(kpi.changeType)}
                      <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                        {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {kpi.period}
                      </span>
                    </div>
                    
                    <Progress value={kpi.target} className="mt-3" />
                    <span className="text-xs text-muted-foreground">
                      Meta: {kpi.target}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getCategoryKPIs('financial').map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getChangeIcon(kpi.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                      {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {kpi.period}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getCategoryKPIs('users').map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getChangeIcon(kpi.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                      {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {kpi.period}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getCategoryKPIs('operational').map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {getChangeIcon(kpi.changeType)}
                    <span className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                      {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {kpi.period}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessKPIDashboard;