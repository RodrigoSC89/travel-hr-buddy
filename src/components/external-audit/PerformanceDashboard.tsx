import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Download, TrendingUp, TrendingDown, Activity, Users, Clock, AlertCircle } from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { VesselPerformanceMetrics, RISK_LEVEL_COLORS } from '@/types/external-audit';

export const PerformanceDashboard: React.FC = () => {
  const [vesselId, setVesselId] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<VesselPerformanceMetrics[]>([]);

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const handleFetchMetrics = async () => {
    if (!vesselId || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Call the PostgreSQL function
      const { data, error } = await supabase
        .rpc('calculate_vessel_performance_metrics', {
          p_vessel_id: vesselId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;

      // Also fetch stored metrics
      const { data: storedMetrics, error: metricsError } = await supabase
        .from('vessel_performance_metrics')
        .select('*')
        .eq('vessel_id', vesselId)
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: true });

      if (metricsError) throw metricsError;

      if (data && data.length > 0) {
        setVesselName(data[0].vessel_name);
        // Combine calculated and stored metrics
        setMetrics(storedMetrics || []);
      } else {
        setMetrics(storedMetrics || []);
      }

      toast.success('Performance metrics loaded successfully');
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error(`Failed to fetch metrics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (metrics.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Vessel',
      'Compliance %',
      'Failures',
      'MTTR (hours)',
      'AI Actions',
      'Human Actions',
      'Training Completions',
      'Performance Score',
      'Risk Level'
    ];

    const rows = metrics.map(m => [
      m.metric_date,
      m.vessel_name,
      m.compliance_percentage?.toFixed(2) || '0',
      m.failure_frequency || '0',
      m.mttr_hours?.toFixed(2) || '0',
      m.ai_actions || '0',
      m.human_actions || '0',
      m.training_completions || '0',
      m.performance_score?.toFixed(2) || '0',
      m.risk_level || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance-metrics-${vesselName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV export completed');
  };

  // Calculate aggregate metrics
  const aggregateMetrics = metrics.length > 0 ? {
    avgCompliance: metrics.reduce((sum, m) => sum + (m.compliance_percentage || 0), 0) / metrics.length,
    totalFailures: metrics.reduce((sum, m) => sum + (m.failure_frequency || 0), 0),
    avgMTTR: metrics.reduce((sum, m) => sum + (m.mttr_hours || 0), 0) / metrics.length,
    totalAIActions: metrics.reduce((sum, m) => sum + (m.ai_actions || 0), 0),
    totalHumanActions: metrics.reduce((sum, m) => sum + (m.human_actions || 0), 0),
    totalTrainings: metrics.reduce((sum, m) => sum + (m.training_completions || 0), 0)
  } : null;

  // Prepare radar chart data
  const radarData = aggregateMetrics ? [
    { subject: 'Compliance', value: aggregateMetrics.avgCompliance, fullMark: 100 },
    { subject: 'Response Time', value: Math.max(0, 100 - (aggregateMetrics.avgMTTR / 24 * 100)), fullMark: 100 },
    { subject: 'Training', value: Math.min(100, aggregateMetrics.totalTrainings * 10), fullMark: 100 },
    { subject: 'AI Efficiency', value: Math.min(100, (aggregateMetrics.totalAIActions / Math.max(1, aggregateMetrics.totalAIActions + aggregateMetrics.totalHumanActions)) * 100), fullMark: 100 },
    { subject: 'Reliability', value: Math.max(0, 100 - (aggregateMetrics.totalFailures / metrics.length)), fullMark: 100 }
  ] : [];

  // Prepare bar chart data for failures by system
  const failuresBySystemData = metrics.length > 0 ? 
    Object.entries(metrics[0]?.failures_by_system || {}).map(([system, count]) => ({
      system,
      failures: count
    })) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Technical Performance Dashboard
          </CardTitle>
          <CardDescription>
            Monitor vessel performance metrics with real-time analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselId">Vessel ID *</Label>
              <Input
                id="vesselId"
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                placeholder="Enter vessel ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleFetchMetrics} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Metrics'
                )}
              </Button>
            </div>
          </div>

          {metrics.length > 0 && (
            <Button onClick={handleExportCSV} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </CardContent>
      </Card>

      {aggregateMetrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Compliance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aggregateMetrics.avgCompliance.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Over {metrics.length} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Failures
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aggregateMetrics.totalFailures}</div>
                <p className="text-xs text-muted-foreground">
                  {(aggregateMetrics.totalFailures / metrics.length).toFixed(1)} per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg MTTR
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aggregateMetrics.avgMTTR.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground">
                  Mean Time To Repair
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI vs Human Actions
                </CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aggregateMetrics.totalAIActions} / {aggregateMetrics.totalHumanActions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((aggregateMetrics.totalAIActions / Math.max(1, aggregateMetrics.totalAIActions + aggregateMetrics.totalHumanActions)) * 100).toFixed(0)}% AI automated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Training Completions
                </CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aggregateMetrics.totalTrainings}</div>
                <p className="text-xs text-muted-foreground">
                  Completed trainings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Level
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <Badge variant={metrics[metrics.length - 1]?.risk_level === 'low' ? 'default' : 'destructive'}>
                  {metrics[metrics.length - 1]?.risk_level || 'N/A'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Current assessment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Radar view of key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart - Failures by System */}
          {failuresBySystemData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Failures by System</CardTitle>
                <CardDescription>System-specific failure analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failuresBySystemData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="system" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="failures" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
