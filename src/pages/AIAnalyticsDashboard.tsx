/**
 * AI Analytics Dashboard - Usage monitoring for AI Hub
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
  PieChart,
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

interface ModuleStats {
  total: number;
  success: number;
  avgResponseTime: number;
  totalTokens: number;
}

interface AnalyticsData {
  period: string;
  totalRequests: number;
  successRate: number;
  moduleStats: Record<string, ModuleStats>;
  topModules: Array<{ module: string } & ModuleStats>;
}

// Mock data for demo (in production, fetch from ai-analytics edge function)
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
});

export default function AIAnalyticsDashboard() {
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // In production, fetch from edge function
      // const response = await supabase.functions.invoke('ai-analytics', { body: { action: 'stats', data: { period } } });
      // setAnalytics(response.data);
      
      // Mock data for demo
      await new Promise(r => setTimeout(r, 500));
      setAnalytics(getMockAnalytics());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const moduleColors: Record<string, string> = {
    command: 'from-purple-500 to-blue-500',
    peotram: 'from-emerald-500 to-teal-500',
    peodp: 'from-blue-500 to-cyan-500',
    safety: 'from-red-500 to-orange-500',
    bunker: 'from-amber-500 to-yellow-500',
    crew: 'from-pink-500 to-rose-500',
    weather: 'from-sky-500 to-blue-500',
    compliance: 'from-indigo-500 to-purple-500',
    fleet: 'from-cyan-500 to-teal-500',
    maintenance: 'from-orange-500 to-red-500',
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
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Analytics</h1>
              <p className="text-muted-foreground">
                Monitoramento de uso das IAs especializadas
              </p>
            </div>
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
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Volume2 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    HD
                    <Badge variant={voiceEnabled ? 'default' : 'secondary'} className="text-xs">
                      {voiceEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">ElevenLabs Voice</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules" className="gap-2">
            <Brain className="h-4 w-4" />
            Por Módulo
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Voice HD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Modules Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top IAs por Uso</CardTitle>
                <CardDescription>IAs mais utilizadas no período</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topModules.map((module, index) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  const percentage = Math.round((module.total / maxRequests) * 100);
                  
                  return (
                    <motion.div
                      key={module.module}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config?.icon || '🤖'}</span>
                          <span className="font-medium">{config?.name || module.module}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{module.total} req</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${moduleColors[module.module] || 'from-gray-500 to-gray-600'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* All Modules Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Todas as IAs</CardTitle>
                <CardDescription>Estatísticas detalhadas por módulo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(AI_MODULES).slice(0, 8).map(([key, config]) => {
                    const stats = analytics.moduleStats[key];
                    
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span>{config.icon}</span>
                          <span className="text-sm font-medium truncate">{config.name}</span>
                        </div>
                        <div className="text-lg font-bold">{stats?.total || 0}</div>
                        <div className="text-xs text-muted-foreground">requisições</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resposta</CardTitle>
                <CardDescription>Média por módulo (ms)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.topModules.map((module) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  return (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config?.icon || '🤖'}</span>
                        <span className="text-sm">{config?.name || module.module}</span>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {module.avgResponseTime}ms
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tokens Consumidos</CardTitle>
                <CardDescription>Total por módulo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.topModules.map((module) => {
                  const config = AI_MODULES[module.module as keyof typeof AI_MODULES];
                  return (
                    <div key={module.module} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config?.icon || '🤖'}</span>
                        <span className="text-sm">{config?.name || module.module}</span>
                      </div>
                      <Badge variant="secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        {(module.totalTokens / 1000).toFixed(1)}k
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
                <CardDescription>Por módulo</CardDescription>
              </CardHeader>
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

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                ElevenLabs HD Voice
              </CardTitle>
              <CardDescription>
                Voz HD natural para todas as 16 IAs especializadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(AI_MODULES).map(([key, config]) => (
                  <div
                    key={key}
                    className="p-4 rounded-lg border bg-gradient-to-br from-muted/50 to-muted/20 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        {config.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{config.name}</div>
                        <div className="text-xs text-muted-foreground">Voice HD</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Volume2 className="h-3 w-3 mr-1" />
                        ElevenLabs
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        PT-BR
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border">
                <h4 className="font-medium mb-2">🎙️ Recursos de Voz HD</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Vozes naturais com ElevenLabs Multilingual v2</li>
                  <li>✅ Voz personalizada para cada módulo de IA</li>
                  <li>✅ Suporte a PT-BR, EN e ES</li>
                  <li>✅ Síntese em tempo real com baixa latência</li>
                  <li>✅ Ajuste de velocidade e estabilidade</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
