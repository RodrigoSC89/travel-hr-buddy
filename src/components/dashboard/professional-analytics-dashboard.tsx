/**
 * Professional Analytics Dashboard
 * Dashboard de analytics com métricas avançadas e visualizações de BI
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  Activity,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const revenueData = [
  { month: 'Jan', revenue: 45000, costs: 28000, profit: 17000, transactions: 450 },
  { month: 'Fev', revenue: 52000, costs: 30000, profit: 22000, transactions: 520 },
  { month: 'Mar', revenue: 48000, costs: 29000, profit: 19000, transactions: 480 },
  { month: 'Abr', revenue: 61000, costs: 35000, profit: 26000, transactions: 610 },
  { month: 'Mai', revenue: 55000, costs: 32000, profit: 23000, transactions: 550 },
  { month: 'Jun', revenue: 70000, costs: 38000, profit: 32000, transactions: 700 }
];

const userGrowth = [
  { month: 'Jan', active: 1200, new: 150, churned: 45 },
  { month: 'Fev', active: 1305, new: 180, churned: 75 },
  { month: 'Mar', active: 1410, new: 165, churned: 60 },
  { month: 'Abr', active: 1515, new: 195, churned: 90 },
  { month: 'Mai', active: 1620, new: 170, churned: 65 },
  { month: 'Jun', active: 1725, new: 210, churned: 105 }
];

const performanceMetrics = [
  { category: 'Vendas', value: 850, benchmark: 800 },
  { category: 'Conversão', value: 920, benchmark: 850 },
  { category: 'Satisfação', value: 890, benchmark: 900 },
  { category: 'Retenção', value: 950, benchmark: 920 }
];

const scatterData = [
  { x: 100, y: 200, z: 200, category: 'A' },
  { x: 120, y: 100, z: 260, category: 'A' },
  { x: 170, y: 300, z: 400, category: 'B' },
  { x: 140, y: 250, z: 280, category: 'B' },
  { x: 150, y: 400, z: 500, category: 'C' },
  { x: 110, y: 280, z: 200, category: 'C' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-12 -mt-12" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-playfair">{value}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              {trend}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function ProfessionalAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-playfair bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics Avançado
          </h1>
          <p className="text-muted-foreground mt-1">
            Inteligência de negócios e insights orientados por dados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Últimos 30 dias
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita Total"
          value="R$ 331K"
          change={15.3}
          icon={DollarSign}
          trend="vs mês anterior"
        />
        <MetricCard
          title="Usuários Ativos"
          value="1,725"
          change={8.7}
          icon={Users}
          trend="crescimento mensal"
        />
        <MetricCard
          title="Taxa de Conversão"
          value="24.8%"
          change={3.2}
          icon={Target}
          trend="vs período anterior"
        />
        <MetricCard
          title="Performance Score"
          value="92.5"
          change={5.1}
          icon={Zap}
          trend="índice geral"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Financeiro</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Multidimensional de Performance
              </CardTitle>
              <CardDescription>
                Receita, custos e lucro com volume de transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Receita" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="left" dataKey="costs" fill="#ef4444" name="Custos" radius={[8, 8, 0, 0]} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="profit" 
                    fill="url(#colorProfit)" 
                    stroke="#10b981"
                    name="Lucro"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Transações"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Benchmarking de Performance
                </CardTitle>
                <CardDescription>
                  Comparação com benchmarks de mercado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, idx) => {
                    const percentage = (metric.value / metric.benchmark) * 100;
                    const isAbove = percentage >= 100;
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono">{metric.value}</span>
                            <Badge variant={isAbove ? "default" : "secondary"} className="text-xs">
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`absolute top-0 left-0 h-full rounded-full ${
                              isAbove ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Análise de Correlação
                </CardTitle>
                <CardDescription>
                  Relação entre métricas de negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="Investimento" />
                    <YAxis type="number" dataKey="y" name="Retorno" />
                    <ZAxis type="number" dataKey="z" range={[100, 500]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={scatterData} fill="#3b82f6">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento Financeiro</CardTitle>
              <CardDescription>
                Análise aprofundada de receitas e custos operacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" stackId="a" fill="#3b82f6" name="Receita" />
                  <Bar dataKey="costs" stackId="a" fill="#ef4444" name="Custos" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Lucro Líquido" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crescimento de Base de Usuários
              </CardTitle>
              <CardDescription>
                Análise de aquisição, retenção e churn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={userGrowth}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    fill="url(#colorActive)" 
                    stroke="#3b82f6"
                    name="Usuários Ativos"
                  />
                  <Bar dataKey="new" fill="#10b981" name="Novos" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="churned" fill="#ef4444" name="Churn" radius={[8, 8, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Tendência Positiva Detectada</p>
                    <p className="text-xs text-muted-foreground">
                      Receita cresceu 15.3% com redução de 3% nos custos operacionais
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Projeção de Crescimento</p>
                    <p className="text-xs text-muted-foreground">
                      Com a taxa atual, esperamos atingir R$ 420K até fim do trimestre
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Oportunidade de Otimização</p>
                    <p className="text-xs text-muted-foreground">
                      Taxa de conversão pode aumentar 5-8% com ajustes no funil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações Estratégicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Aumentar investimento em Marketing</p>
                    <Badge>Alta prioridade</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ROI de 3.2x identificado em campanhas digitais
                  </p>
                </div>

                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Otimizar processo de onboarding</p>
                    <Badge variant="secondary">Média prioridade</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reduzir churn inicial em até 15%
                  </p>
                </div>

                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Expandir base de clientes B2B</p>
                    <Badge variant="outline">Longo prazo</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Potencial de 40% aumento de receita
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
