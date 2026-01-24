/**
 * AI Learning Metrics Dashboard - PATCH 852
 * Visual dashboard with charts showing AI learning evolution
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAutonomousAI } from '@/hooks/useAutonomousAI';

const COLORS = {
  primary: 'hsl(217, 91%, 60%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 16%, 47%)'
};

export function AILearningMetricsDashboard() {
  const { decisions, learningMetrics, statistics } = useAutonomousAI();

  // Generate time-series data for accuracy evolution
  const accuracyEvolution = useMemo(() => {
    const data: { time: string; accuracy: number; confidence: number; decisions: number }[] = [];
    let runningCorrect = 0;
    let runningTotal = 0;
    
    const sortedDecisions = [...decisions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedDecisions.forEach((decision, index) => {
      runningTotal++;
      if (decision.feedback?.wasCorrect) {
        runningCorrect++;
      }
      
      // Sample every 5 decisions or at the end
      if ((index + 1) % 5 === 0 || index === sortedDecisions.length - 1) {
        const date = new Date(decision.createdAt);
        data.push({
          time: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          accuracy: runningTotal > 0 ? (runningCorrect / runningTotal) * 100 : 0,
          confidence: decision.confidence * 100,
          decisions: runningTotal
        });
      }
    });

    // Add current data point if no decisions
    if (data.length === 0) {
      data.push({
        time: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        accuracy: learningMetrics.accuracy * 100,
        confidence: statistics.averageConfidence * 100,
        decisions: 0
      });
    }

    return data;
  }, [decisions, learningMetrics.accuracy, statistics.averageConfidence]);

  // Decision type distribution
  const decisionTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    
    decisions.forEach(d => {
      typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      type
    }));
  }, [decisions]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => [
    { name: 'Executadas', value: statistics.executed, color: COLORS.success },
    { name: 'Pendentes', value: statistics.pending, color: COLORS.warning },
    { name: 'Rejeitadas', value: statistics.rejected, color: COLORS.destructive },
    { name: 'Falhas', value: statistics.failed, color: COLORS.muted }
  ].filter(d => d.value > 0), [statistics]);

  // Confidence distribution
  const confidenceDistribution = useMemo(() => {
    const ranges = { 'Alta (85%+)': 0, 'Média (60-84%)': 0, 'Baixa (<60%)': 0 };
    
    decisions.forEach(d => {
      if (d.confidence >= 0.85) ranges['Alta (85%+)']++;
      else if (d.confidence >= 0.6) ranges['Média (60-84%)']++;
      else ranges['Baixa (<60%)']++;
    });

    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [decisions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20">
            <BarChart3 className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Métricas de Aprendizado</h2>
            <p className="text-sm text-muted-foreground">
              Evolução do sistema de IA autônoma
            </p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3 animate-pulse text-success" />
          {learningMetrics.learningCycles} ciclos
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-success" />
              <TrendingUp className="h-4 w-4 text-success/80" />
            </div>
            <div className="text-3xl font-bold text-success">
              {(learningMetrics.accuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Taxa de Precisão</p>
            <Progress 
              value={learningMetrics.accuracy * 100} 
              className="mt-2 h-1 bg-success/20" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-info/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-xs text-primary/80">
                +{(learningMetrics.improvementRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {(statistics.averageConfidence * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confiança Média</p>
            <Progress
              value={statistics.averageConfidence * 100} 
              className="mt-2 h-1 bg-primary/20" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-accent/5 border-secondary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-secondary" />
              <span className="text-xs text-secondary/80">{statistics.pending} pendentes</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              {statistics.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de Decisões</p>
            <div className="flex gap-1 mt-2">
              <div className="h-1 bg-success rounded-full" style={{ width: `${(statistics.executed / Math.max(statistics.total, 1)) * 100}%` }} />
              <div className="h-1 bg-warning rounded-full" style={{ width: `${(statistics.pending / Math.max(statistics.total, 1)) * 100}%` }} />
              <div className="h-1 bg-destructive rounded-full" style={{ width: `${(statistics.rejected / Math.max(statistics.total, 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-warning" />
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-warning">
              {statistics.executed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Decisões Executadas</p>
            <p className="text-xs text-warning mt-2">
              {statistics.rejected} rejeitadas • {statistics.failed} falhas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accuracy Evolution Chart */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Evolução da Precisão
            </CardTitle>
            <CardDescription>Taxa de acerto ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyEvolution}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={COLORS.success}
                    fill="url(#accuracyGradient)"
                    strokeWidth={2}
                    name="Precisão %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Confiança %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Decision Status Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Distribuição por Status
            </CardTitle>
            <CardDescription>Proporção de decisões por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Decision Types Bar Chart */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" />
              Tipos de Decisões
            </CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decisionTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.primary}
                    radius={[0, 4, 4, 0]}
                    name="Quantidade"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-warning" />
              Distribuição de Confiança
            </CardTitle>
            <CardDescription>Níveis de confiança das decisões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Decisões" radius={[4, 4, 0, 0]}>
                    <Cell fill={COLORS.success} />
                    <Cell fill={COLORS.warning} />
                    <Cell fill={COLORS.destructive} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Summary */}
      <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
              <div>
                <p className="font-semibold">Sistema de Aprendizado Ativo</p>
                <p className="text-sm text-muted-foreground">
                  {learningMetrics.totalDecisions} decisões processadas • 
                  {learningMetrics.correctDecisions} corretas • 
                  Taxa de melhoria: +{(learningMetrics.improvementRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Ciclo #{learningMetrics.learningCycles}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
