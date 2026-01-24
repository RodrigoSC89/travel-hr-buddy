/**
 * AI Executive Dashboard - KPIs Resumidos
 * Dashboard compacto para visualização rápida dos principais indicadores de IA
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Zap, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Cpu,
  Shield,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Gauge
} from 'lucide-react';
import { useAIDecisionsSupabase } from '@/hooks/useAIDecisionsSupabase';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { subDays, format, isWithinInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  subtitle?: string;
  sparklineData?: number[];
}

const colorClasses = {
  green: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    fill: 'hsl(var(--success))',
    gradient: 'from-success/20 to-transparent'
  },
  blue: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    fill: 'hsl(var(--primary))',
    gradient: 'from-primary/20 to-transparent'
  },
  purple: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info',
    fill: 'hsl(var(--info))',
    gradient: 'from-info/20 to-transparent'
  },
  orange: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    fill: 'hsl(var(--warning))',
    gradient: 'from-warning/20 to-transparent'
  },
  red: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    fill: 'hsl(var(--destructive))',
    gradient: 'from-destructive/20 to-transparent'
  }
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  trend = 'neutral', 
  color, 
  subtitle,
  sparklineData 
}: KPICardProps) {
  const colors = colorClasses[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${colors.bg} ${colors.border} border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <div className={colors.text}>{icon}</div>
            </div>
            {change !== undefined && (
              <Badge 
                variant="outline" 
                className={`${trend === 'up' ? 'text-emerald-400 border-emerald-400/30' : trend === 'down' ? 'text-red-400 border-red-400/30' : 'text-gray-400 border-gray-400/30'}`}
              >
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {change > 0 ? '+' : ''}{change}%
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-3 -mx-2">
              <MiniSparkline data={sparklineData} color={colors.fill} />
            </div>
          )}
          
          {changeLabel && (
            <p className="text-xs text-gray-500 mt-2">{changeLabel}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusRing({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={36}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.1)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}

export function AIExecutiveDashboard() {
  const { decisions, metrics, loading } = useAIDecisionsSupabase();
  
  const kpiData = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last14Days = subDays(now, 14);
    
    // Filter decisions for different periods
    const recentDecisions = decisions.filter(d => 
      isWithinInterval(new Date(d.created_at), { start: last7Days, end: now })
    );
    
    const previousDecisions = decisions.filter(d => 
      isWithinInterval(new Date(d.created_at), { start: last14Days, end: last7Days })
    );
    
    // Calculate KPIs
    const totalDecisions = recentDecisions.length;
    const previousTotal = previousDecisions.length;
    const decisionsChange = previousTotal > 0 
      ? Math.round(((totalDecisions - previousTotal) / previousTotal) * 100) 
      : 0;
    
    // Accuracy
    const decisionsWithFeedback = recentDecisions.filter(d => d.feedback_was_correct !== null);
    const correctDecisions = decisionsWithFeedback.filter(d => d.feedback_was_correct === true);
    const accuracy = decisionsWithFeedback.length > 0 
      ? Math.round((correctDecisions.length / decisionsWithFeedback.length) * 100)
      : 0;
    
    const prevWithFeedback = previousDecisions.filter(d => d.feedback_was_correct !== null);
    const prevCorrect = prevWithFeedback.filter(d => d.feedback_was_correct === true);
    const prevAccuracy = prevWithFeedback.length > 0 
      ? Math.round((prevCorrect.length / prevWithFeedback.length) * 100)
      : 0;
    const accuracyChange = accuracy - prevAccuracy;
    
    // Average confidence
    const avgConfidence = recentDecisions.length > 0
      ? Math.round(recentDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / recentDecisions.length)
      : 0;
    
    const prevAvgConfidence = previousDecisions.length > 0
      ? Math.round(previousDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / previousDecisions.length)
      : 0;
    const confidenceChange = avgConfidence - prevAvgConfidence;
    
    // Execution rate
    const executedDecisions = recentDecisions.filter(d => d.status === 'executed');
    const executionRate = recentDecisions.length > 0
      ? Math.round((executedDecisions.length / recentDecisions.length) * 100)
      : 0;
    
    // Response time (simulated from metrics)
    const avgResponseTime = 245; // ms - would come from metrics
    
    // Critical alerts
    const criticalDecisions = recentDecisions.filter(d => d.impact === 'critical');
    
    // Sparkline data (last 7 days)
    const sparklineData: Record<string, number[]> = {
      decisions: [],
      accuracy: [],
      confidence: []
    };
    
    for (let i = 6; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayDecisions = recentDecisions.filter(d => 
        isWithinInterval(new Date(d.created_at), { start: dayStart, end: dayEnd })
      );
      
      sparklineData.decisions.push(dayDecisions.length);
      
      const dayWithFeedback = dayDecisions.filter(d => d.feedback_was_correct !== null);
      const dayCorrect = dayWithFeedback.filter(d => d.feedback_was_correct === true);
      sparklineData.accuracy.push(
        dayWithFeedback.length > 0 ? Math.round((dayCorrect.length / dayWithFeedback.length) * 100) : 0
      );
      
      sparklineData.confidence.push(
        dayDecisions.length > 0 
          ? Math.round(dayDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / dayDecisions.length)
          : 0
      );
    }
    
    // Decision types distribution
    const typeDistribution = recentDecisions.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalDecisions,
      decisionsChange,
      accuracy,
      accuracyChange,
      avgConfidence,
      confidenceChange,
      executionRate,
      avgResponseTime,
      criticalAlerts: criticalDecisions.length,
      pendingDecisions: recentDecisions.filter(d => d.status === 'pending').length,
      sparklineData,
      typeDistribution
    };
  }, [decisions, metrics]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
          <span className="text-gray-400">Carregando KPIs da IA...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard Executivo IA</h2>
            <p className="text-sm text-gray-400">Últimos 7 dias • Atualizado agora</p>
          </div>
        </div>
        <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
          <Activity className="w-3 h-3 mr-1" />
          Sistema Ativo
        </Badge>
      </div>
      
      {/* Main KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          title="Decisões IA"
          value={kpiData.totalDecisions}
          change={kpiData.decisionsChange}
          trend={kpiData.decisionsChange >= 0 ? 'up' : 'down'}
          icon={<Brain className="w-5 h-5" />}
          color="blue"
          subtitle="Esta semana"
          sparklineData={kpiData.sparklineData.decisions}
        />
        
        <KPICard
          title="Precisão"
          value={`${kpiData.accuracy}%`}
          change={kpiData.accuracyChange}
          trend={kpiData.accuracyChange >= 0 ? 'up' : 'down'}
          icon={<Target className="w-5 h-5" />}
          color="green"
          subtitle="Acertos confirmados"
          sparklineData={kpiData.sparklineData.accuracy}
        />
        
        <KPICard
          title="Confiança Média"
          value={`${kpiData.avgConfidence}%`}
          change={kpiData.confidenceChange}
          trend={kpiData.confidenceChange >= 0 ? 'up' : 'down'}
          icon={<Shield className="w-5 h-5" />}
          color="purple"
          subtitle="Score de confiança"
          sparklineData={kpiData.sparklineData.confidence}
        />
        
        <KPICard
          title="Taxa Execução"
          value={`${kpiData.executionRate}%`}
          icon={<Zap className="w-5 h-5" />}
          color="orange"
          subtitle="Decisões executadas"
        />
        
        <KPICard
          title="Tempo Resposta"
          value={`${kpiData.avgResponseTime}ms`}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
          subtitle="Latência média"
        />
      </div>
      
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Status */}
        <Card className="bg-[#12121a]/80 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" />
              Status Geral da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around py-4">
              <StatusRing 
                percentage={kpiData.accuracy} 
                label="Precisão" 
                color={colorClasses.green.fill} 
              />
              <StatusRing 
                percentage={kpiData.avgConfidence} 
                label="Confiança" 
                color={colorClasses.purple.fill} 
              />
              <StatusRing 
                percentage={kpiData.executionRate} 
                label="Execução" 
                color={colorClasses.orange.fill} 
              />
            </div>
            
            <Separator className="my-4 bg-gray-800" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-amber-500/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">{kpiData.criticalAlerts}</span>
                </div>
                <span className="text-xs text-gray-400">Alertas Críticos</span>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-lg font-bold text-blue-400">{kpiData.pendingDecisions}</span>
                </div>
                <span className="text-xs text-gray-400">Pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Decision Types */}
        <Card className="bg-[#12121a]/80 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Distribuição por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(kpiData.typeDistribution).slice(0, 5).map(([type, count], index) => {
                const total = Object.values(kpiData.typeDistribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const colors = ['blue', 'purple', 'green', 'orange', 'red'] as const;
                
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className={colorClasses[colors[index % colors.length]].text}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                );
              })}
              
              {Object.keys(kpiData.typeDistribution).length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sem dados de tipos ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">Insights da IA</p>
                <p className="text-xs text-gray-400">
                  {kpiData.accuracy >= 80 
                    ? 'Performance excelente! A IA está operando acima das expectativas.' 
                    : kpiData.accuracy >= 60
                    ? 'Performance boa. Considere revisar decisões de baixa confiança.'
                    : 'Atenção: Precisão abaixo do esperado. Revisão manual recomendada.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                Ver Detalhes
              </Button>
              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                <Brain className="w-3 h-3 mr-1" />
                Analisar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIExecutiveDashboard;
