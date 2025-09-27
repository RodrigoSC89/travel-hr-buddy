import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  Wifi, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const SystemOverview = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    server: { status: 'operational', load: 45, response: 120 },
    database: { status: 'optimal', connections: 24, queries: 1250 },
    network: { status: 'stable', latency: 35, bandwidth: 85 },
    security: { status: 'secure', threats: 0, lastScan: '2h ago' },
    users: { active: 42, peak: 67, sessions: 156 },
    performance: { score: 95, memory: 68, cpu: 34 }
  });

  const [realTimeData, setRealTimeData] = useState([
    { time: '00:00', cpu: 25, memory: 45, users: 15 },
    { time: '04:00', cpu: 18, memory: 42, users: 8 },
    { time: '08:00', cpu: 45, memory: 65, users: 35 },
    { time: '12:00', cpu: 65, memory: 78, users: 45 },
    { time: '16:00', cpu: 55, memory: 72, users: 38 },
    { time: '20:00', cpu: 35, memory: 58, users: 25 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'optimal':
      case 'stable':
      case 'secure':
        return 'text-success-foreground bg-success/20 border-success/30';
      case 'warning':
        return 'text-warning-foreground bg-warning/20 border-warning/30';
      case 'critical':
        return 'text-destructive-foreground bg-destructive/20 border-destructive/30';
      default:
        return 'text-muted-foreground bg-muted/20 border-muted/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'optimal':
      case 'stable':
      case 'secure':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          score: Math.max(90, Math.min(100, prev.performance.score + Math.random() * 2 - 1)),
          memory: Math.max(50, Math.min(85, prev.performance.memory + Math.random() * 4 - 2)),
          cpu: Math.max(20, Math.min(80, prev.performance.cpu + Math.random() * 6 - 3))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Server Status */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servidor</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusColor(systemMetrics.server.status)}>
                  {getStatusIcon(systemMetrics.server.status)}
                  <span className="ml-1 capitalize">{systemMetrics.server.status}</span>
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Carga CPU</span>
                  <span>{systemMetrics.performance.cpu}%</span>
                </div>
                <Progress value={systemMetrics.performance.cpu} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground">
                Tempo resposta: {systemMetrics.server.response}ms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Dados</CardTitle>
            <Database className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className={getStatusColor(systemMetrics.database.status)}>
                {getStatusIcon(systemMetrics.database.status)}
                <span className="ml-1 capitalize">{systemMetrics.database.status}</span>
              </Badge>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Conexões</div>
                  <div className="font-medium">{systemMetrics.database.connections}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Consultas/h</div>
                  <div className="font-medium">{systemMetrics.database.queries}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rede</CardTitle>
            <Wifi className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className={getStatusColor(systemMetrics.network.status)}>
                {getStatusIcon(systemMetrics.network.status)}
                <span className="ml-1 capitalize">{systemMetrics.network.status}</span>
              </Badge>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Latência</div>
                  <div className="font-medium">{systemMetrics.network.latency}ms</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Largura banda</div>
                  <div className="font-medium">{systemMetrics.network.bandwidth}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segurança</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className={getStatusColor(systemMetrics.security.status)}>
                {getStatusIcon(systemMetrics.security.status)}
                <span className="ml-1 capitalize">{systemMetrics.security.status}</span>
              </Badge>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Ameaças</div>
                  <div className="font-medium text-green-600">{systemMetrics.security.threats}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Última varredura</div>
                  <div className="font-medium">{systemMetrics.security.lastScan}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{systemMetrics.users.active}</div>
              <div className="text-xs text-muted-foreground">Usuários ativos</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Pico</div>
                  <div className="font-medium">{systemMetrics.users.peak}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sessões</div>
                  <div className="font-medium">{systemMetrics.users.sessions}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold">{systemMetrics.performance.score}%</div>
              <div className="text-xs text-muted-foreground">Score geral</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Memória</span>
                  <span>{systemMetrics.performance.memory}%</span>
                </div>
                <Progress value={systemMetrics.performance.memory} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Monitoramento em Tempo Real
          </CardTitle>
          <CardDescription>Performance do sistema nas últimas 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name]}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="cpu" 
                stackId="1" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6} 
                name="CPU" 
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stackId="2" 
                stroke="hsl(var(--secondary))" 
                fill="hsl(var(--secondary))" 
                fillOpacity={0.6} 
                name="Memória" 
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2} 
                name="Usuários" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;