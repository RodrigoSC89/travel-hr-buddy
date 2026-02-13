/**
 * AI Performance Comparison - PATCH 854
 * Compare AI performance between periods with evolution charts
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  AlertTriangle,
  Bell,
  BellOff,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAIDecisionsSupabase, type AIDecisionDB } from '@/hooks/useAIDecisionsSupabase';
import { useToast } from '@/hooks/use-toast';

type PeriodType = '7d' | '14d' | '30d' | '90d';

interface PeriodMetrics {
  label: string;
  total: number;
  executed: number;
  rejected: number;
  accuracy: number;
  avgConfidence: number;
  byType: Record<string, number>;
}

interface DailyMetric {
  date: string;
  total: number;
  executed: number;
  accuracy: number;
  confidence: number;
}

export function AIPerformanceComparison() {
  const { decisions, configurations, getConfiguration, loading } = useAIDecisionsSupabase();
  const { toast } = useToast();
  
  const [period1, setPeriod1] = useState<PeriodType>('7d');
  const [period2, setPeriod2] = useState<PeriodType>('14d');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [accuracyThreshold, setAccuracyThreshold] = useState(70);
  const [showAlert, setShowAlert] = useState(false);

  // Load threshold from config
  useEffect(() => {
    const thresholdConfig = getConfiguration('accuracy_alert_threshold');
    if (thresholdConfig && typeof thresholdConfig === 'object' && 'value' in thresholdConfig) {
      setAccuracyThreshold((thresholdConfig as { value: number }).value);
    }
  }, [configurations, getConfiguration]);

  // Calculate metrics for a period
  const calculatePeriodMetrics = (days: number, label: string): PeriodMetrics => {
    const startDate = subDays(new Date(), days);
    const periodDecisions = decisions.filter(d => 
      new Date(d.created_at) >= startDate
    );

    const total = periodDecisions.length;
    const executed = periodDecisions.filter(d => d.status === 'executed').length;
    const rejected = periodDecisions.filter(d => d.status === 'rejected').length;
    
    const withFeedback = periodDecisions.filter(d => d.feedback_was_correct !== null);
    const correct = withFeedback.filter(d => d.feedback_was_correct === true).length;
    const accuracy = withFeedback.length > 0 ? Math.round((correct / withFeedback.length) * 100) : 0;
    
    const avgConfidence = total > 0 
      ? Math.round(periodDecisions.reduce((sum, d) => sum + Number(d.confidence), 0) / total)
      : 0;

    const byType: Record<string, number> = {};
    periodDecisions.forEach(d => {
      byType[d.type] = (byType[d.type] || 0) + 1;
    });

    return { label, total, executed, rejected, accuracy, avgConfidence, byType };
  };

  // Get period days from type
  const getPeriodDays = (p: PeriodType): number => {
    switch (p) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  // Calculate metrics for both periods
  const metrics1 = useMemo(() => 
    calculatePeriodMetrics(getPeriodDays(period1), `Últimos ${getPeriodDays(period1)} dias`),
    [decisions, period1]
  );

  const metrics2 = useMemo(() => 
    calculatePeriodMetrics(getPeriodDays(period2), `Últimos ${getPeriodDays(period2)} dias`),
    [decisions, period2]
  );

  // Calculate daily evolution data
  const dailyEvolution = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayDecisions = decisions.filter(d => {
        const date = new Date(d.created_at);
        return date >= dayStart && date <= dayEnd;
      });

      const total = dayDecisions.length;
      const executed = dayDecisions.filter(d => d.status === 'executed').length;
      const withFeedback = dayDecisions.filter(d => d.feedback_was_correct !== null);
      const correct = withFeedback.filter(d => d.feedback_was_correct === true).length;
      const accuracy = withFeedback.length > 0 ? Math.round((correct / withFeedback.length) * 100) : null;
      const avgConfidence = total > 0 
        ? Math.round(dayDecisions.reduce((sum, d) => sum + Number(d.confidence), 0) / total)
        : null;

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        fullDate: format(day, 'dd/MM/yyyy', { locale: ptBR }),
        total,
        executed,
        accuracy,
        confidence: avgConfidence
      };
    });
  }, [decisions]);

  // Check for accuracy alerts
  useEffect(() => {
    if (!alertsEnabled) return;

    const recentDecisions = decisions.filter(d => 
      new Date(d.created_at) >= subDays(new Date(), 7) &&
      d.feedback_was_correct !== null
    );

    if (recentDecisions.length >= 5) {
      const correct = recentDecisions.filter(d => d.feedback_was_correct === true).length;
      const currentAccuracy = Math.round((correct / recentDecisions.length) * 100);

      if (currentAccuracy < accuracyThreshold) {
        setShowAlert(true);
        toast({
          title: "⚠️ Alerta de Precisão da IA",
          description: `A precisão caiu para ${currentAccuracy}% (abaixo do threshold de ${accuracyThreshold}%)`,
          variant: "destructive"
        });
      } else {
        setShowAlert(false);
      }
    }
  }, [decisions, alertsEnabled, accuracyThreshold, toast]);

  // Calculate trend
  const getTrend = (current: number, previous: number) => {
    if (current === previous) return { icon: Minus, color: 'text-muted-foreground', label: 'Estável' };
    if (current > previous) return { icon: TrendingUp, color: 'text-green-400', label: 'Subindo' };
    return { icon: TrendingDown, color: 'text-red-400', label: 'Caindo' };
  };

  // Calculate type distribution for chart
  const typeDistribution = useMemo(() => {
    const types = ['optimization', 'correction', 'prevention', 'automation'];
    return types.map(type => ({
      type: type === 'optimization' ? 'Otimização' :
            type === 'correction' ? 'Correção' :
            type === 'prevention' ? 'Prevenção' : 'Automação',
      period1: metrics1.byType[type] || 0,
      period2: metrics2.byType[type] || 0
    }));
  }, [metrics1, metrics2]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const accuracyTrend = getTrend(metrics1.accuracy, metrics2.accuracy);
  const TrendIcon = accuracyTrend.icon;

  return (
    <div className="space-y-6">
      {/* Header with Alert Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Comparação de Performance</h2>
            <p className="text-sm text-muted-foreground">Análise evolutiva da IA</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={alertsEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            {alertsEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            Alertas {alertsEnabled ? 'ON' : 'OFF'}
          </Button>
          <Select value={String(accuracyThreshold)} onValueChange={(v) => setAccuracyThreshold(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <Target className="h-4 w-4 mr-2" />
              {accuracyThreshold}%
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="60">60%</SelectItem>
              <SelectItem value="70">70%</SelectItem>
              <SelectItem value="80">80%</SelectItem>
              <SelectItem value="90">90%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Accuracy Alert */}
      {showAlert && alertsEnabled && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Precisão Abaixo do Threshold</AlertTitle>
          <AlertDescription>
            A taxa de precisão da IA nos últimos 7 dias está abaixo de {accuracyThreshold}%. 
            Revise as decisões recentes e considere ajustar os parâmetros de aprendizado.
          </AlertDescription>
        </Alert>
      )}

      {/* Period Selectors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Comparar:</span>
        </div>
        <Select value={period1} onValueChange={(v) => setPeriod1(v as PeriodType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="14d">Últimos 14 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">vs</span>
        <Select value={period2} onValueChange={(v) => setPeriod2(v as PeriodType)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="14d">Últimos 14 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Period 1 */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary">{metrics1.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold">{metrics1.total}</div>
                <div className="text-xs text-muted-foreground">Decisões</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{metrics1.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Precisão</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{metrics1.executed}</div>
                <div className="text-xs text-muted-foreground">Executadas</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{metrics1.avgConfidence}%</div>
                <div className="text-xs text-muted-foreground">Confiança Média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period 2 */}
        <Card className="bg-card/50 border-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline">{metrics2.label}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold">{metrics2.total}</div>
                <div className="text-xs text-muted-foreground">Decisões</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{metrics2.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Precisão</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{metrics2.executed}</div>
                <div className="text-xs text-muted-foreground">Executadas</div>
              </div>
              <div className="text-center p-3 bg-muted/10 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{metrics2.avgConfidence}%</div>
                <div className="text-xs text-muted-foreground">Confiança Média</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Summary */}
      <Card className="bg-card/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <TrendIcon className={`h-5 w-5 ${accuracyTrend.color}`} />
              <span className="text-sm">
                Precisão: <span className={accuracyTrend.color}>{accuracyTrend.label}</span>
                {metrics1.accuracy !== metrics2.accuracy && (
                  <span className="ml-1">
                    ({metrics1.accuracy > metrics2.accuracy ? '+' : ''}{metrics1.accuracy - metrics2.accuracy}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              {getTrend(metrics1.total, metrics2.total).icon === TrendingUp ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : getTrend(metrics1.total, metrics2.total).icon === TrendingDown ? (
                <TrendingDown className="h-5 w-5 text-red-400" />
              ) : (
                <Minus className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm">
                Volume: {metrics1.total > metrics2.total ? '+' : ''}{metrics1.total - metrics2.total} decisões
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Evolution */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Evolução da Precisão
            </CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#22c55e" 
                  fill="url(#accuracyGradient)"
                  name="Precisão %"
                  connectNulls
                />
                {/* Threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => accuracyThreshold}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  name="Threshold"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Evolution */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Volume de Decisões
            </CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="executed" fill="#22c55e" name="Executadas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution Comparison */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Distribuição por Tipo</CardTitle>
          <CardDescription>Comparação entre os períodos selecionados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#666" fontSize={12} />
              <YAxis type="category" dataKey="type" stroke="#666" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="period1" fill="#8b5cf6" name={metrics1.label} radius={[0, 4, 4, 0]} />
              <Bar dataKey="period2" fill="#6366f1" name={metrics2.label} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence Evolution */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            Evolução da Confiança Média
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="#a855f7" 
                strokeWidth={2}
                name="Confiança %"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
