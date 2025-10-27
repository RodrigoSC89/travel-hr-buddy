// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Ship, Users, AlertTriangle, TrendingUp, Gauge, Bell, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OperationalMetrics {
  total_vessels: number;
  active_vessels: number;
  crew_members: number;
  active_rotations: number;
  pending_checklists: number;
  active_alerts: number;
  avg_fuel_efficiency: number;
  total_voyages: number;
  system_health_status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
}

interface CriticalAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export function OperationsDashboard() {
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    total_vessels: 0,
    active_vessels: 0,
    crew_members: 0,
    active_rotations: 0,
    pending_checklists: 0,
    active_alerts: 0,
    avg_fuel_efficiency: 0,
    total_voyages: 0,
    system_health_status: 'healthy',
    last_updated: new Date().toISOString()
  });
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Memoized data loading function
  const loadOperationalData = useCallback(async () => {
    try {
      // Fetch all operational metrics in parallel from real Supabase sources
      const [
        vesselsRes,
        activeVesselsRes,
        crewRes,
        rotationsRes,
        checklistsRes,
        alertsRes,
        fuelRes,
        voyagesRes,
        performanceRes
      ] = await Promise.all([
        supabase.from('vessels').select('id', { count: 'exact', head: true }),
        supabase.from('vessel_status').select('id', { count: 'exact', head: true }).in('status', ['underway', 'at_anchor']),
        supabase.from('crew_assignments').select('id', { count: 'exact', head: true }).eq('assignment_status', 'active'),
        supabase.from('crew_rotations').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('checklist_records').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('maintenance_alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('fuel_usage').select('efficiency_rating').order('recorded_at', { ascending: false }).limit(10),
        supabase.from('voyage_plans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('performance_metrics').select('*').order('recorded_at', { ascending: false }).limit(5)
      ]);

      // Calculate average fuel efficiency from real data
      const avgEfficiency = fuelRes.data && fuelRes.data.length > 0
        ? fuelRes.data.reduce((sum: number, f: any) => sum + (f.efficiency_rating || 0), 0) / fuelRes.data.length
        : 0;

      // Determine system health from performance metrics
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (performanceRes.data && performanceRes.data.length > 0) {
        const avgStatus = performanceRes.data.filter((m: any) => m.status === 'critical').length;
        if (avgStatus > 2) systemHealth = 'critical';
        else if (avgStatus > 0) systemHealth = 'warning';
      }

      setMetrics({
        total_vessels: vesselsRes.count || 0,
        active_vessels: activeVesselsRes.count || 0,
        crew_members: crewRes.count || 0,
        active_rotations: rotationsRes.count || 0,
        pending_checklists: checklistsRes.count || 0,
        active_alerts: alertsRes.count || 0,
        avg_fuel_efficiency: avgEfficiency,
        total_voyages: voyagesRes.count || 0,
        system_health_status: systemHealth,
        last_updated: new Date().toISOString()
      });

      // Load critical alerts
      await loadCriticalAlerts();
    } catch (error) {
      console.error('Error loading operational data:', error);
      toast.error('Failed to load operational metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load critical alerts from real data
  const loadCriticalAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_alerts')
        .select('*')
        .eq('status', 'active')
        .gte('severity', 'high')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const alerts: CriticalAlert[] = (data || []).map((alert: any) => ({
        id: alert.id,
        type: alert.alert_type || 'system',
        message: alert.description || alert.title,
        severity: alert.severity || 'medium',
        timestamp: alert.created_at,
        acknowledged: alert.acknowledged || false
      }));

      setCriticalAlerts(alerts);
    } catch (error) {
      console.error('Error loading critical alerts:', error);
    }
  };

  useEffect(() => {
    loadOperationalData();
    generateAISuggestions();

    // Set up real-time updates with WebSocket support
    let channels: RealtimeChannel[] = [];

    const setupRealtimeSubscriptions = async () => {
      // Subscribe to operations status changes
      const operationsChannel = supabase
        .channel('operations_status_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'vessel_status' }, 
          () => {
            console.log('Vessel status updated');
            loadOperationalData();
          }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'crew_assignments' }, 
          () => {
            console.log('Crew assignments updated');
            loadOperationalData();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
            toast.success('Real-time updates active', { duration: 2000 });
          }
        });

      // Subscribe to critical alerts
      const alertsChannel = supabase
        .channel('critical_alerts')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'maintenance_alerts' }, 
          (payload) => {
            console.log('New alert received:', payload);
            const newAlert = payload.new as any;
            if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
              toast.error(`Critical Alert: ${newAlert.description || newAlert.title}`, {
                duration: 5000,
                action: {
                  label: 'View',
                  onClick: () => console.log('View alert:', newAlert.id)
                }
              });
              loadCriticalAlerts();
            }
          }
        )
        .subscribe();

      // Subscribe to performance metrics
      const metricsChannel = supabase
        .channel('performance_updates')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'performance_metrics' }, 
          () => {
            console.log('Performance metrics updated');
            loadOperationalData();
          }
        )
        .subscribe();

      channels = [operationsChannel, alertsChannel, metricsChannel];
    };

    setupRealtimeSubscriptions();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      setRealtimeConnected(false);
    };
  }, [loadOperationalData]);

  // Generate AI-powered operational suggestions based on real data
  const generateAISuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Data-driven suggestions
    if (metrics.avg_fuel_efficiency < 75) {
      suggestions.push(`Fuel efficiency at ${metrics.avg_fuel_efficiency.toFixed(1)}% - Review consumption patterns`);
    }
    
    if (metrics.active_alerts > 5) {
      suggestions.push(`${metrics.active_alerts} active alerts - Prioritize critical maintenance`);
    }
    
    if (metrics.pending_checklists > 10) {
      suggestions.push(`${metrics.pending_checklists} pending checklists - Complete before operations`);
    }
    
    if (metrics.active_rotations > 0) {
      suggestions.push(`${metrics.active_rotations} crew rotations scheduled - Confirm travel arrangements`);
    }
    
    // Add system health suggestions
    if (metrics.system_health_status === 'critical') {
      suggestions.push('Critical system health detected - Immediate attention required');
    } else if (metrics.system_health_status === 'warning') {
      suggestions.push('System health warnings detected - Review performance metrics');
    }
    
    // Generic operational suggestions
    if (suggestions.length === 0) {
      suggestions.push('All systems operating normally - Monitor for any changes');
      suggestions.push('Consider scheduling preventive maintenance during low activity periods');
    }

    setAiSuggestions(suggestions);
  }, [metrics]);

  // Acknowledge alert handler
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_alerts')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert acknowledged');
      loadCriticalAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  // Update AI suggestions when metrics change
  useEffect(() => {
    if (!loading) {
      generateAISuggestions();
    }
  }, [metrics, loading, generateAISuggestions]);

  const getSystemHealthBadge = () => {
    switch (metrics.system_health_status) {
      case 'healthy':
        return { variant: 'default' as const, label: 'Healthy', color: 'text-green-500' };
      case 'warning':
        return { variant: 'secondary' as const, label: 'Warning', color: 'text-yellow-500' };
      case 'critical':
        return { variant: 'destructive' as const, label: 'Critical', color: 'text-red-500' };
      default:
        return { variant: 'outline' as const, label: 'Unknown', color: 'text-gray-500' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getMetricColor = (value: number, threshold: number, reverse = false) => {
    if (reverse) {
      return value <= threshold ? 'text-green-500' : 'text-red-500';
    }
    return value >= threshold ? 'text-green-500' : 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading operations dashboard...</div>
      </div>
    );
  }

  const healthBadge = getSystemHealthBadge();

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Operations Dashboard</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Real-time operational metrics and AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            {realtimeConnected ? (
              <>
                <Zap className="h-3 w-3 animate-pulse text-green-500" />
                <span className="hidden sm:inline">WebSocket Active</span>
                <span className="sm:hidden">Live</span>
              </>
            ) : (
              <>
                <Activity className="h-3 w-3 text-gray-500" />
                <span className="hidden sm:inline">Connecting...</span>
                <span className="sm:hidden">...</span>
              </>
            )}
          </Badge>
          <Badge variant={healthBadge.variant} className="flex items-center gap-1">
            <Bell className={`h-3 w-3 ${healthBadge.color}`} />
            {healthBadge.label}
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {criticalAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  {!alert.acknowledged && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="w-full sm:w-auto"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {metrics.active_vessels} / {metrics.total_vessels}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics.active_vessels / metrics.total_vessels) * 100 || 0).toFixed(0)}% operational
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Crew Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{metrics.crew_members}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.active_rotations} rotations scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${getMetricColor(metrics.active_alerts, 5, true)}`}>
              {metrics.active_alerts}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.pending_checklists} pending checklists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avg_fuel_efficiency.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average rating across fleet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center text-base md:text-lg">
                <TrendingUp className="mr-2 h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                AI Operational Insights
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Intelligent recommendations based on current operations
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit">AI Powered</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 md:space-y-3">
            {aiSuggestions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No suggestions at this time. All systems operating normally.
              </div>
            ) : (
              aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs md:text-sm">{suggestion}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    Review
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(metrics.last_updated).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              View real-time vessel positions and status
            </p>
            <Button size="sm" variant="outline" className="w-full">
              View Fleet Map
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Crew Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              Manage crew assignments and rotations
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Manage Crew
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">Voyage Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">
              Plan routes with weather and fuel optimization
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Plan Voyage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
