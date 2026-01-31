/**
 * AI Analytics Dashboard - Usage monitoring with Line Charts
 * PATCH AI-REVOLUTION
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_MODULES } from '@/lib/ai-prompts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { logger } from '@/lib/logger';

interface ModuleStats {
  total: number;
  success: number;
  avgResponseTime: number;
  totalTokens: number;
}

interface DailyUsage {
  date: string;
  command: number;
  peotram: number;
  peodp: number;
  safety: number;
  bunker: number;
  crew: number;
  weather: number;
  total: number;
}

interface AnalyticsData {
  period: string;
  totalRequests: number;
  successRate: number;
  moduleStats: Record<string, ModuleStats>;
  topModules: Array<{ module: string } & ModuleStats>;
  dailyUsage: DailyUsage[];
}

// Mock data for demo
const getMockAnalytics = (): AnalyticsData => ({
  period: '7d',
  totalRequests: 1247,
  successRate: 98.2,
  moduleStats: {
    command: { total: 312, success: 308, avgResponseTime: 1250, totalTokens: 45000 },
    peotram: { total: 245, success: 243, avgResponseTime: 1800, totalTokens: 62000 },
    peodp: { total: 198, success: 195, avgResponseTime: 1650, totalTokens: 48000 },
    safety: { total: 156, success: 154, avgResponseTime: 1100, totalTokens: 32000 },
    bunker: { total: 142, success: 140, avgResponseTime: 1350, totalTokens: 38000 },
    crew: { total: 98, success: 97, avgResponseTime: 1200, totalTokens: 28000 },
    weather: { total: 96, success: 95, avgResponseTime: 980, totalTokens: 22000 },
  },
  topModules: [
    { module: 'command', total: 312, success: 308, avgResponseTime: 1250, totalTokens: 45000 },
    { module: 'peotram', total: 245, success: 243, avgResponseTime: 1800, totalTokens: 62000 },
    { module: 'peodp', total: 198, success: 195, avgResponseTime: 1650, totalTokens: 48000 },
    { module: 'safety', total: 156, success: 154, avgResponseTime: 1100, totalTokens: 32000 },
    { module: 'bunker', total: 142, success: 140, avgResponseTime: 1350, totalTokens: 38000 },
  ],
  dailyUsage: [
    { date: '25 Dez', command: 42, peotram: 35, peodp: 28, safety: 22, bunker: 20, crew: 14, weather: 13, total: 174 },
    { date: '26 Dez', command: 48, peotram: 38, peodp: 30, safety: 24, bunker: 22, crew: 15, weather: 14, total: 191 },
    { date: '27 Dez', command: 38, peotram: 32, peodp: 25, safety: 20, bunker: 18, crew: 12, weather: 11, total: 156 },
    { date: '28 Dez', command: 52, peotram: 40, peodp: 32, safety: 26, bunker: 24, crew: 16, weather: 15, total: 205 },
    { date: '29 Dez', command: 45, peotram: 36, peodp: 29, safety: 23, bunker: 21, crew: 14, weather: 14, total: 182 },
    { date: '30 Dez', command: 40, peotram: 34, peodp: 27, safety: 21, bunker: 19, crew: 13, weather: 15, total: 169 },
    { date: '31 Dez', command: 47, peotram: 30, peodp: 27, safety: 20, bunker: 18, crew: 14, weather: 14, total: 170 },
  ],
});

export default function AIAnalyticsDashboard() {
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceEnabled] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setAnalytics(getMockAnalytics());
    } catch (error) {
      logger.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const moduleColors: Record<string, string> = {
    command: '#8b5cf6',
    peotram: '#10b981',
    peodp: '#3b82f6',
    safety: '#ef4444',
    bunker: '#f59e0b',
    crew: '#ec4899',
    weather: '#0ea5e9',
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const maxRequests = Math.max(...analytics.topModules.map(m => m.total));

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Analytics</h1>
            <p className="text-muted-foreground">Monitoramento de uso das IAs especializadas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último dia</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Requisições</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.successRate}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(analytics.moduleStats).length}</div>
                <div className="text-sm text-muted-foreground">IAs Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  HD <Badge variant={voiceEnabled ? 'default' : 'secondary'} className="text-xs">{voiceEnabled ? 'ON' : 'OFF'}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">ElevenLabs Voice</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Charts - Daily Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Uso por Dia
          </CardTitle>
          <CardDescription>Uso das IAs especializadas nos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyUsage}>
                <defs>
                  {Object.entries(moduleColors).map(([key, color]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Area type="monotone" dataKey="command" name="Command AI" stroke="#8b5cf6" fill="url(#gradient-command)" />
                <Area type="monotone" dataKey="peotram" name="PEOTRAM" stroke="#10b981" fill="url(#gradient-peotram)" />
                <Area type="monotone" dataKey="peodp" name="PEO-DP" stroke="#3b82f6" fill="url(#gradient-peodp)" />
                <Area type="monotone" dataKey="safety" name="Safety AI" stroke="#ef4444" fill="url(#gradient-safety)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules" className="gap-2"><Brain className="h-4 w-4" />Por Módulo</TabsTrigger>
          <TabsTrigger value="performance" className="gap-2"><Activity className="h-4 w-4" />Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top IAs por Uso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topModules.map((module, index) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  const percentage = Math.round((module.total / maxRequests) * 100);
                  return (
                    <motion.div key={module.module} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config?.icon || '🤖'}</span>
                          <span className="font-medium">{config?.name || module.module}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{module.total} req</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo - Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="total" name="Total Requisições" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Tempo de Resposta</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics.topModules.map((module) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  return (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config?.icon || '🤖'}</span>
                        <span className="text-sm">{config?.name || module.module}</span>
                      </div>
                      <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{module.avgResponseTime}ms</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tokens Consumidos</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics.topModules.map((module) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  return (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config?.icon || '🤖'}</span>
                        <span className="text-sm">{config?.name || module.module}</span>
                      </div>
                      <Badge variant="secondary"><Zap className="h-3 w-3 mr-1" />{(module.totalTokens / 1000).toFixed(1)}k</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Taxa de Sucesso</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analytics.topModules.map((module) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  const rate = module.total > 0 ? Math.round((module.success / module.total) * 100) : 100;
                  return (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config?.icon || '🤖'}</span>
                        <span className="text-sm">{config?.name || module.module}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="w-16 h-2" />
                        <span className="text-sm font-medium">{rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
