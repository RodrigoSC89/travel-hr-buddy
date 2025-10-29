/**
 * PATCH 511: Telemetry Dashboard
 * Real-time metrics aggregation with historical trends and alerting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Server, 
  Cpu, 
  HardDrive, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TelemetryMetric {
  system: string;
  metric: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold?: number;
  trend: 'up' | 'down' | 'stable';
}

interface HistoricalData {
  timestamp: string;
  fleet: number;
  ai: number;
  infrastructure: number;
  missions: number;
}

const TelemetryDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<TelemetryMetric[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize mock data
  useEffect(() => {
    generateMockData();
    
    // Auto-refresh every 5 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateMockData();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateMockData = () => {
    // Generate current metrics
    const newMetrics: TelemetryMetric[] = [
      {
        system: 'Fleet',
        metric: 'Active Vessels',
        value: Math.floor(Math.random() * 5) + 15,
        unit: 'vessels',
        status: 'normal',
        threshold: 10,
        trend: Math.random() > 0.5 ? 'up' : 'stable',
      },
      {
        system: 'Fleet',
        metric: 'Average Speed',
        value: Math.random() * 5 + 10,
        unit: 'knots',
        status: 'normal',
        trend: 'stable',
      },
      {
        system: 'AI',
        metric: 'Active Agents',
        value: Math.floor(Math.random() * 3) + 8,
        unit: 'agents',
        status: 'normal',
        threshold: 5,
        trend: 'up',
      },
      {
        system: 'AI',
        metric: 'Decision Accuracy',
        value: Math.random() * 10 + 85,
        unit: '%',
        status: Math.random() > 0.7 ? 'warning' : 'normal',
        threshold: 80,
        trend: 'up',
      },
      {
        system: 'Infrastructure',
        metric: 'CPU Usage',
        value: Math.random() * 30 + 50,
        unit: '%',
        status: Math.random() > 0.8 ? 'warning' : 'normal',
        threshold: 85,
        trend: Math.random() > 0.6 ? 'up' : 'down',
      },
      {
        system: 'Infrastructure',
        metric: 'Memory Usage',
        value: Math.random() * 20 + 60,
        unit: '%',
        status: 'normal',
        threshold: 90,
        trend: 'stable',
      },
      {
        system: 'Infrastructure',
        metric: 'Disk I/O',
        value: Math.random() * 100 + 200,
        unit: 'MB/s',
        status: 'normal',
        trend: 'down',
      },
      {
        system: 'Missions',
        metric: 'Active Missions',
        value: Math.floor(Math.random() * 5) + 12,
        unit: 'missions',
        status: 'normal',
        threshold: 20,
        trend: 'stable',
      },
      {
        system: 'Missions',
        metric: 'Success Rate',
        value: Math.random() * 5 + 94,
        unit: '%',
        status: 'normal',
        threshold: 90,
        trend: 'up',
      },
    ];

    setMetrics(newMetrics);
    setLastUpdate(new Date());

    // Generate historical data
    const now = Date.now();
    const historical: HistoricalData[] = [];
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000); // 5-minute intervals
      historical.push({
        timestamp: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        fleet: Math.random() * 20 + 70,
        ai: Math.random() * 15 + 80,
        infrastructure: Math.random() * 30 + 60,
        missions: Math.random() * 10 + 85,
      });
    }
    setHistoricalData(historical);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'Fleet': return <Server className="h-5 w-5" />;
      case 'AI': return <Zap className="h-5 w-5" />;
      case 'Infrastructure': return <Cpu className="h-5 w-5" />;
      case 'Missions': return <Activity className="h-5 w-5" />;
      default: return <HardDrive className="h-5 w-5" />;
    }
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.system]) {
      acc[metric.system] = [];
    }
    acc[metric.system].push(metric);
    return acc;
  }, {} as Record<string, TelemetryMetric[]>);

  const alertCount = metrics.filter(m => m.status === 'warning' || m.status === 'critical').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Telemetry Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time system metrics and monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={alertCount > 0 ? "destructive" : "secondary"}>
            {alertCount} Active Alerts
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <span className="text-sm text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Trends</CardTitle>
          <CardDescription>System performance over time (5-min intervals)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="fleet" stackId="1" stroke="#8884d8" fill="#8884d8" name="Fleet" />
              <Area type="monotone" dataKey="ai" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="AI" />
              <Area type="monotone" dataKey="infrastructure" stackId="1" stroke="#ffc658" fill="#ffc658" name="Infrastructure" />
              <Area type="monotone" dataKey="missions" stackId="1" stroke="#ff8042" fill="#ff8042" name="Missions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics by System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedMetrics).map(([system, systemMetrics]) => (
          <Card key={system}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getSystemIcon(system)}
                  {system}
                </CardTitle>
                <Badge variant="outline">
                  {systemMetrics.length} metrics
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
                      <span className="text-sm font-medium">{metric.metric}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold">
                        {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    {metric.threshold && (
                      <span className="text-xs text-muted-foreground">
                        Threshold: {metric.threshold} {metric.unit}
                      </span>
                    )}
                  </div>
                  <div>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(groupedMetrics).map(([system, systemMetrics]) => {
              const hasWarnings = systemMetrics.some(m => m.status === 'warning' || m.status === 'critical');
              return (
                <div key={system} className="flex items-center gap-3 p-4 border rounded-lg">
                  {getSystemIcon(system)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{system}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hasWarnings ? 'Requires Attention' : 'Operational'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${hasWarnings ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelemetryDashboard;
