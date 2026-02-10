/**
 * Analytics Dashboard Premium - Business Intelligence Marítimo
 * Dashboard avançado de analytics e KPIs operacionais
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ship,
  Users,
  Fuel,
  Wrench,
  Shield,
  FileCheck,
  Activity,
  Target,
  Sparkles,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Anchor,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface KPICard {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trend: number;
  trendDirection: 'up' | 'down';
  isPositive: boolean;
  icon: React.ElementType;
  category: string;
}

interface ChartData {
  label: string;
  value: number;
  previousValue?: number;
}

// Analytics KPIs - aggregated operational data (read from multiple tables in future)
const fallbackKPIs: KPICard[] = [
  { id: '1', title: 'Receita Operacional', value: '12.5M', unit: 'USD', trend: 8.5, trendDirection: 'up', isPositive: true, icon: DollarSign, category: 'financial' },
  { id: '2', title: 'OPEX Total', value: '8.2M', unit: 'USD', trend: -3.2, trendDirection: 'down', isPositive: true, icon: TrendingDown, category: 'financial' },
  { id: '3', title: 'Margem Operacional', value: '34.4', unit: '%', trend: 5.1, trendDirection: 'up', isPositive: true, icon: Target, category: 'financial' },
  { id: '4', title: 'Utilização da Frota', value: '87.5', unit: '%', trend: 2.3, trendDirection: 'up', isPositive: true, icon: Ship, category: 'operations' },
  { id: '5', title: 'Dias Operacionais', value: '342', unit: 'dias', trend: 4.5, trendDirection: 'up', isPositive: true, icon: Calendar, category: 'operations' },
  { id: '6', title: 'Consumo Combustível', value: '2,450', unit: 'MT', trend: -5.2, trendDirection: 'down', isPositive: true, icon: Fuel, category: 'operations' },
  { id: '7', title: 'LTIF', value: '0.45', unit: '', trend: -12.5, trendDirection: 'down', isPositive: true, icon: Shield, category: 'safety' },
  { id: '8', title: 'Compliance Score', value: '94.2', unit: '%', trend: 3.1, trendDirection: 'up', isPositive: true, icon: FileCheck, category: 'compliance' },
  { id: '9', title: 'Tripulação Ativa', value: '156', unit: '', trend: 0, trendDirection: 'up', isPositive: true, icon: Users, category: 'crew' },
  { id: '10', title: 'Disponibilidade Técnica', value: '96.8', unit: '%', trend: 1.2, trendDirection: 'up', isPositive: true, icon: Wrench, category: 'maintenance' }
];

// Chart data - aggregated from operational records
const revenueData: ChartData[] = [
  { label: 'Jan', value: 1850000, previousValue: 1720000 },
  { label: 'Fev', value: 2100000, previousValue: 1890000 },
  { label: 'Mar', value: 1950000, previousValue: 2010000 },
  { label: 'Abr', value: 2300000, previousValue: 2150000 },
  { label: 'Mai', value: 2450000, previousValue: 2280000 },
  { label: 'Jun', value: 2600000, previousValue: 2420000 }
];

const vesselPerformance = [
  { vessel: 'MV Atlantic Pioneer', utilization: 92, revenue: 3200000, opex: 1850000, margin: 42.2 },
  { vessel: 'MV Pacific Star', utilization: 88, revenue: 2800000, opex: 1620000, margin: 42.1 },
  { vessel: 'MV Ocean Voyager', utilization: 78, revenue: 2100000, opex: 1450000, margin: 31.0 },
  { vessel: 'MV Northern Spirit', utilization: 45, revenue: 850000, opex: 720000, margin: 15.3 }
];

const departmentMetrics = [
  { department: 'Operações', budget: 5000000, spent: 4200000, compliance: 84 },
  { department: 'Manutenção', budget: 2500000, spent: 2150000, compliance: 86 },
  { department: 'Tripulação', budget: 3500000, spent: 3100000, compliance: 88.5 },
  { department: 'Segurança', budget: 800000, spent: 650000, compliance: 81.2 },
  { department: 'Administrativo', budget: 1200000, spent: 980000, compliance: 81.6 }
];

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return fallbackKPIs;
    return fallbackKPIs.filter(kpi => kpi.category === selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'financial', label: 'Financeiro' },
    { value: 'operations', label: 'Operações' },
    { value: 'safety', label: 'Segurança' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'crew', label: 'Tripulação' },
    { value: 'maintenance', label: 'Manutenção' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Análise de performance operacional e financeira</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredKPIs.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className={`flex items-center gap-1 text-xs ${kpi.isPositive ? 'text-success' : 'text-destructive'}`}>
                      {kpi.trendDirection === 'up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(kpi.trend)}%
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{kpi.value}</span>
                      {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="vessels" className="gap-2">
            <Ship className="h-4 w-4" />
            Por Embarcação
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Users className="h-4 w-4" />
            Por Departamento
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução da Receita
                </CardTitle>
                <CardDescription>Comparativo com período anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, idx) => {
                    const maxValue = Math.max(...revenueData.map(d => d.value));
                    const percentage = (data.value / maxValue) * 100;
                    const prevPercentage = ((data.previousValue || 0) / maxValue) * 100;
                    const growth = data.previousValue ? ((data.value - data.previousValue) / data.previousValue * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={data.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{data.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">${(data.value / 1000000).toFixed(2)}M</span>
                            <Badge variant={Number(growth) >= 0 ? 'default' : 'destructive'} className="text-xs">
                              {Number(growth) >= 0 ? '+' : ''}{growth}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-muted-foreground/30 rounded-full"
                            style={{ width: `${prevPercentage}%` }}
                          />
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Resumo Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-success">+8.5%</p>
                    <p className="text-sm text-muted-foreground">Crescimento Receita</p>
                  </div>
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-success">-3.2%</p>
                    <p className="text-sm text-muted-foreground">Redução OPEX</p>
                  </div>
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">87.5%</p>
                    <p className="text-sm text-muted-foreground">Utilização Frota</p>
                  </div>
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-warning">94.2%</p>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Destaques do Período</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Melhor margem operacional dos últimos 6 meses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Redução de 5.2% no consumo de combustível
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      MV Northern Spirit com utilização abaixo da meta
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vessels Tab */}
        <TabsContent value="vessels" className="mt-6">
          <div className="space-y-4">
            {vesselPerformance.map(vessel => (
              <motion.div
                key={vessel.vessel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Ship className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">{vessel.vessel}</h3>
                          <p className="text-sm text-muted-foreground">
                            Utilização: {vessel.utilization}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={vessel.margin > 35 ? 'default' : vessel.margin > 20 ? 'secondary' : 'destructive'}>
                        Margem: {vessel.margin}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-lg font-bold">${(vessel.revenue / 1000000).toFixed(2)}M</p>
                        <p className="text-xs text-muted-foreground">Receita</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-lg font-bold">${(vessel.opex / 1000000).toFixed(2)}M</p>
                        <p className="text-xs text-muted-foreground">OPEX</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-lg font-bold">{vessel.utilization}%</p>
                        <p className="text-xs text-muted-foreground">Utilização</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-lg font-bold text-success">{vessel.margin}%</p>
                        <p className="text-xs text-muted-foreground">Margem</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Performance Geral</span>
                        <span className="font-medium">{vessel.utilization}%</span>
                      </div>
                      <Progress value={vessel.utilization} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentMetrics.map(dept => {
              const spentPercentage = (dept.spent / dept.budget) * 100;
              const remaining = dept.budget - dept.spent;
              
              return (
                <motion.div
                  key={dept.department}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-4">{dept.department}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Orçamento Utilizado</span>
                            <span className={spentPercentage > 90 ? 'text-destructive font-medium' : 'font-medium'}>
                              {spentPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={spentPercentage} 
                            className={`h-3 ${spentPercentage > 90 ? '[&>div]:bg-destructive' : ''}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-lg font-bold">${(dept.budget / 1000000).toFixed(1)}M</p>
                            <p className="text-xs text-muted-foreground">Orçamento</p>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <p className="text-lg font-bold">${(dept.spent / 1000000).toFixed(1)}M</p>
                            <p className="text-xs text-muted-foreground">Gasto</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-muted-foreground">Disponível</span>
                          <span className="font-bold text-success">${(remaining / 1000000).toFixed(2)}M</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <span className="font-medium">Oportunidade de Receita</span>
                    </div>
                    <p className="text-sm">
                      Análise de mercado indica demanda crescente para rotas Ásia-América. 
                      Potencial de +15% na receita do Q3 com reposicionamento estratégico.
                    </p>
                    <Button size="sm" className="mt-3">Ver Análise Completa</Button>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <span className="font-medium">Alerta de Custo</span>
                    </div>
                    <p className="text-sm">
                      Departamento de Manutenção atingiu 86% do orçamento com 4 meses restantes. 
                      Recomenda-se revisão de prioridades.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">Revisar Orçamento</Button>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="font-medium">Otimização Detectada</span>
                    </div>
                    <p className="text-sm">
                      MV Pacific Star operando 8% acima da eficiência média. 
                      Padrões podem ser replicados para outras embarcações.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">Ver Best Practices</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Previsões & Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Preço do Combustível', prediction: 'Aumento de 8-12% previsto para Q3', action: 'Hedge', priority: 'high' },
                    { title: 'Demanda de Frete', prediction: 'Crescimento de 15% no segmento bulk', action: 'Expandir', priority: 'medium' },
                    { title: 'Custos de Tripulação', prediction: 'Estável nos próximos 6 meses', action: 'Manter', priority: 'low' },
                    { title: 'Manutenção Preditiva', prediction: '3 intervenções críticas previstas em 90 dias', action: 'Planejar', priority: 'high' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.priority === 'high' ? 'bg-destructive' : 
                          item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.prediction}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">{item.action}</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing import
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default AnalyticsDashboard;
