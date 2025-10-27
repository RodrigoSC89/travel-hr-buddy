import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { PerformanceMonitor } from '../PerformanceMonitor';

interface BehaviorEvolution {
  timestamp: string;
  module_name: string;
  behavior_type: string;
  evolution_score: number;
  strategic_alignment: number;
}

interface SystemStatus {
  total_modules: number;
  active_alerts: number;
  avg_strategic_alignment: number;
  evolution_trend: 'improving' | 'stable' | 'degrading';
}

export function BehavioralEvolutionDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    total_modules: 0,
    active_alerts: 0,
    avg_strategic_alignment: 0,
    evolution_trend: 'stable',
  });
  const [recentEvolutions, setRecentEvolutions] = useState<BehaviorEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
    
    // Set up real-time subscription for watchdog alerts
    const channel = supabase
      .channel('behavioral_evolution_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'watchdog_behavior_alerts' },
        () => {
          fetchSystemStatus();
          toast.info('System Watchdog: New behavioral event detected');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      // Fetch active alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('watchdog_behavior_alerts')
        .select('*')
        .eq('resolved', false);

      if (alertsError) throw alertsError;

      // Fetch performance data
      const { data: perfData, error: perfError } = await supabase
        .from('ia_performance_log')
        .select('module_name, precision_score, recall_score')
        .order('created_at', { ascending: false })
        .limit(100);

      if (perfError) throw perfError;

      // Calculate system status
      const modules = new Set(perfData?.map(d => d.module_name) || []);
      const avgAlignment = calculateAverageAlignment(perfData || []);
      const trend = determineEvolutionTrend(perfData || []);

      setSystemStatus({
        total_modules: modules.size,
        active_alerts: alerts?.length || 0,
        avg_strategic_alignment: avgAlignment,
        evolution_trend: trend,
      });

      // Generate recent evolution data
      const evolutions = generateEvolutionData(perfData || []);
      setRecentEvolutions(evolutions);

    } catch (error) {
      console.error('Error fetching system status:', error);
      toast.error('Failed to load behavioral evolution data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageAlignment = (data: any[]): number => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, d) => {
      const precision = d.precision_score || 0;
      const recall = d.recall_score || 0;
      return acc + ((precision + recall) / 2);
    }, 0);
    return (sum / data.length) * 100;
  };

  const determineEvolutionTrend = (data: any[]): 'improving' | 'stable' | 'degrading' => {
    if (data.length < 10) return 'stable';
    
    const recent = data.slice(0, 5);
    const older = data.slice(5, 10);
    
    const recentAvg = recent.reduce((acc, d) => 
      acc + ((d.precision_score || 0) + (d.recall_score || 0)) / 2, 0) / recent.length;
    const olderAvg = older.reduce((acc, d) => 
      acc + ((d.precision_score || 0) + (d.recall_score || 0)) / 2, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'degrading';
    return 'stable';
  };

  const generateEvolutionData = (data: any[]): BehaviorEvolution[] => {
    const moduleData = new Map<string, any[]>();
    
    data.forEach(d => {
      if (!moduleData.has(d.module_name)) {
        moduleData.set(d.module_name, []);
      }
      moduleData.get(d.module_name)?.push(d);
    });

    const evolutions: BehaviorEvolution[] = [];
    moduleData.forEach((records, moduleName) => {
      if (records.length > 0) {
        const latest = records[0];
        const score = ((latest.precision_score || 0) + (latest.recall_score || 0)) / 2;
        evolutions.push({
          timestamp: new Date().toISOString(),
          module_name: moduleName,
          behavior_type: 'tactical_optimization',
          evolution_score: score * 100,
          strategic_alignment: score * 100,
        });
      }
    });

    return evolutions.slice(0, 10);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'degrading': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5" />;
      case 'degrading': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Brain className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Behavioral Evolution Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time AI behavior tracking with System Watchdog integration
          </p>
        </div>
        <Button
          variant={showPerformanceMonitor ? "default" : "outline"}
          onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
        >
          <Shield className="h-4 w-4 mr-2" />
          {showPerformanceMonitor ? 'Hide' : 'Show'} Performance Monitor
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.total_modules}</div>
            <p className="text-xs text-muted-foreground">AI systems monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus.active_alerts}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.active_alerts === 0 ? 'All systems normal' : 'Require attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Alignment</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus.avg_strategic_alignment.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Average across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evolution Trend</CardTitle>
            <div className={getTrendColor(systemStatus.evolution_trend)}>
              {getTrendIcon(systemStatus.evolution_trend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getTrendColor(systemStatus.evolution_trend)}`}>
              {systemStatus.evolution_trend}
            </div>
            <p className="text-xs text-muted-foreground">Based on recent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* System Watchdog Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Watchdog Integration
          </CardTitle>
          <CardDescription>
            Real-time monitoring of behavioral mutations and tactical deviations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Mutation Detection</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Tactical Monitoring</p>
                <p className="text-sm text-muted-foreground">Enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Fallback System</p>
                <p className="text-sm text-muted-foreground">Autonomous</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Behavioral Evolutions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Behavioral Evolutions</CardTitle>
          <CardDescription>Latest AI behavior updates and adaptations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvolutions.map((evolution, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{evolution.module_name}</Badge>
                  <div>
                    <p className="text-sm font-medium">{evolution.behavior_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Evolution Score: {evolution.evolution_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {evolution.strategic_alignment.toFixed(1)}%
                  </span>
                  {evolution.strategic_alignment >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : evolution.strategic_alignment >= 60 ? (
                    <Activity className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Monitor Integration */}
      {showPerformanceMonitor && (
        <div className="border-t pt-6">
          <PerformanceMonitor />
        </div>
      )}
    </div>
  );
}
