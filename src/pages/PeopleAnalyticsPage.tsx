/**
 * People Analytics - Dashboard Preditivo com IA
 * Análises avançadas, predição de turnover, clima organizacional
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, TrendingUp, TrendingDown, Users, AlertTriangle,
  Target, BarChart3, PieChart, Activity, Zap, 
  ArrowUpRight, ArrowDownRight, Filter, Download,
  Calendar, Building2, Smile, Frown, Meh
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function PeopleAnalyticsPage() {
  const [period, setPeriod] = useState('6m');
  const [department, setDepartment] = useState('all');

  // Mock data
  const kpis = {
    headcount: { value: 347, change: 5.2, trend: 'up' },
    turnover: { value: 1.8, change: -12, trend: 'down' },
    avgTenure: { value: 2.4, change: 8, trend: 'up' },
    nps: { value: 72, change: 15, trend: 'up' },
    costPerEmployee: { value: 8500, change: 3, trend: 'up' },
    trainingHours: { value: 24, change: 20, trend: 'up' },
  };

  const turnoverData = [
    { month: 'Ago', turnover: 2.1, hired: 8, left: 5 },
    { month: 'Set', turnover: 1.9, hired: 10, left: 4 },
    { month: 'Out', turnover: 2.3, hired: 6, left: 6 },
    { month: 'Nov', turnover: 1.5, hired: 12, left: 3 },
    { month: 'Dez', turnover: 1.2, hired: 8, left: 2 },
    { month: 'Jan', turnover: 1.8, hired: 14, left: 4 },
  ];

  const departmentData = [
    { name: 'Tecnologia', value: 120, color: '#3b82f6' },
    { name: 'Operações', value: 85, color: '#22c55e' },
    { name: 'Comercial', value: 60, color: '#f59e0b' },
    { name: 'Financeiro', value: 42, color: '#8b5cf6' },
    { name: 'RH', value: 25, color: '#ec4899' },
    { name: 'Outros', value: 15, color: '#6b7280' },
  ];

  const riskEmployees = [
    { name: 'Maria Silva', position: 'Analista Sr', risk: 87, factors: ['Salário abaixo mercado', 'Sem promoção 24m'] },
    { name: 'Carlos Oliveira', position: 'Dev Full-Stack', risk: 75, factors: ['Alta carga de trabalho', 'Gestor NPS baixo'] },
    { name: 'Ana Santos', position: 'Designer', risk: 68, factors: ['Férias próximas de vencer', 'Estagnação carreira'] },
    { name: 'João Costa', position: 'Coordenador', risk: 62, factors: ['Conflitos com equipe'] },
  ];

  const climateData = [
    { dimension: 'Liderança', score: 78 },
    { dimension: 'Cultura', score: 82 },
    { dimension: 'Comunicação', score: 71 },
    { dimension: 'Crescimento', score: 65 },
    { dimension: 'Benefícios', score: 85 },
    { dimension: 'Ambiente', score: 79 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            People Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights preditivos e análises avançadas de RH com IA
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Headcount', value: kpis.headcount.value, change: kpis.headcount.change, icon: Users, format: 'number' },
          { label: 'Turnover', value: kpis.turnover.value, change: kpis.turnover.change, icon: TrendingDown, format: 'percent', invertColor: true },
          { label: 'Tempo Médio', value: kpis.avgTenure.value, change: kpis.avgTenure.change, icon: Calendar, format: 'years' },
          { label: 'eNPS', value: kpis.nps.value, change: kpis.nps.change, icon: Smile, format: 'number' },
          { label: 'Custo/Pessoa', value: kpis.costPerEmployee.value, change: kpis.costPerEmployee.change, icon: BarChart3, format: 'currency' },
          { label: 'Horas Treinamento', value: kpis.trainingHours.value, change: kpis.trainingHours.change, icon: Target, format: 'hours' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <Badge 
                  variant={kpi.change > 0 ? (kpi.invertColor ? 'destructive' : 'default') : (kpi.invertColor ? 'default' : 'destructive')}
                  className="text-xs"
                >
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">
                {kpi.format === 'currency' && 'R$ '}
                {kpi.value.toLocaleString('pt-BR')}
                {kpi.format === 'percent' && '%'}
                {kpi.format === 'years' && ' anos'}
                {kpi.format === 'hours' && 'h'}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Turnover Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Evolução do Turnover
            </CardTitle>
            <CardDescription>Taxa mensal e movimentações</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="turnover" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary)/0.2)" 
                  name="Turnover %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Distribuição por Departamento
            </CardTitle>
            <CardDescription>Headcount atual por área</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Turnover Prediction & Climate */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* High Risk Employees */}
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Risco de Turnover - IA
            </CardTitle>
            <CardDescription>Colaboradores com maior probabilidade de saída</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskEmployees.map((emp, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{emp.name}</p>
                    <Badge variant="destructive">{emp.risk}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{emp.position}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {emp.factors.map((f, j) => (
                      <Badge key={j} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Progress 
                  value={emp.risk} 
                  className="w-20 h-2"
                />
              </div>
            ))}
            <Button variant="outline" className="w-full gap-2">
              <Brain className="h-4 w-4" />
              Ver Análise Completa
            </Button>
          </CardContent>
        </Card>

        {/* Climate Survey */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-green-500" />
              Clima Organizacional
            </CardTitle>
            <CardDescription>Última pesquisa: Janeiro 2026 (82% participação)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {climateData.map((item) => (
                <div key={item.dimension}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.dimension}</span>
                    <span className="text-sm font-medium">{item.score}/100</span>
                  </div>
                  <Progress 
                    value={item.score} 
                    className={`h-2 ${
                      item.score >= 80 ? '[&>div]:bg-green-500' : 
                      item.score >= 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Insight da IA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A dimensão "Crescimento" está 15 pontos abaixo da média. 
                Recomendação: implementar programa de PDI estruturado e 
                comunicar planos de carreira mais claramente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions Panel */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Predições da IA - Próximos 3 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Turnover Previsto</p>
              <p className="text-3xl font-bold">2.1%</p>
              <p className="text-sm text-amber-500 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +0.3% vs atual
              </p>
              <p className="text-xs text-muted-foreground">
                ~7 saídas esperadas
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Headcount Projetado</p>
              <p className="text-3xl font-bold">362</p>
              <p className="text-sm text-green-500 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +15 (net)
              </p>
              <p className="text-xs text-muted-foreground">
                22 admissões - 7 saídas
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Custo Total RH</p>
              <p className="text-3xl font-bold">R$ 3.1M</p>
              <p className="text-sm text-amber-500 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +5% vs atual
              </p>
              <p className="text-xs text-muted-foreground">
                Dentro do orçamento aprovado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
