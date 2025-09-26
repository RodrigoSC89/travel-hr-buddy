import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Area
} from 'recharts';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Globe,
  Download,
  Upload,
  Monitor,
  Thermometer,
  Battery,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: number;
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  service: string;
  message: string;
}

const AdvancedSystemMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // System metrics state
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU',
      value: 35,
      unit: '%',
      status: 'normal',
      threshold: 80,
      icon: <Cpu className="w-4 h-4" />
    },
    {
      name: 'Memória',
      value: 68,
      unit: '%',
      status: 'normal',
      threshold: 85,
      icon: <HardDrive className="w-4 h-4" />
    },
    {
      name: 'Disco',
      value: 45,
      unit: '%',
      status: 'normal',
      threshold: 90,
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Rede',
      value: 12,
      unit: 'Mbps',
      status: 'normal',
      threshold: 100,
      icon: <Wifi className="w-4 h-4" />
    }
  ]);

  // Alerts state
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Alta utilização de CPU',
      message: 'CPU atingiu 85% por mais de 5 minutos',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Backup concluído',
      message: 'Backup automático realizado com sucesso',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: true
    }
  ]);

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: 'info',
      service: 'API Gateway',
      message: 'Requisição processada com sucesso'
    },
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      level: 'warning',
      service: 'Database',
      message: 'Consulta lenta detectada - 2.3s'
    },
    {
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      level: 'error',
      service: 'Auth Service',
      message: 'Falha na autenticação do usuário'
    }
  ]);

  // Performance data for charts
  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', cpu: 30, memory: 65, network: 10 },
    { time: '01:00', cpu: 35, memory: 68, network: 12 },
    { time: '02:00', cpu: 40, memory: 70, network: 15 },
    { time: '03:00', cpu: 45, memory: 72, network: 18 },
    { time: '04:00', cpu: 38, memory: 69, network: 14 },
    { time: '05:00', cpu: 42, memory: 71, network: 16 }
  ]);

  // Simulate real-time monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Update metrics with realistic variations
      setMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, metric.value + variation));
        const status = newValue > metric.threshold ? 'critical' : 
                      newValue > metric.threshold * 0.8 ? 'warning' : 'normal';
        
        return { ...metric, value: Number(newValue.toFixed(1)), status };
      }));

      // Add new performance data point
      setPerformanceData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          cpu: 30 + Math.random() * 20,
          memory: 60 + Math.random() * 15,
          network: 8 + Math.random() * 12
        };
        
        return [...prev.slice(-5), newPoint];
      });

      // Randomly add new logs
      if (Math.random() < 0.3) {
        const services = ['API Gateway', 'Database', 'Auth Service', 'Cache', 'Queue'];
        const messages = [
          'Requisição processada',
          'Conexão estabelecida',
          'Cache invalidado',
          'Job processado'
        ];
        
        const newLog: LogEntry = {
          timestamp: new Date(),
          level: Math.random() > 0.8 ? 'warning' : 'info',
          service: services[Math.floor(Math.random() * services.length)],
          message: messages[Math.floor(Math.random() * messages.length)]
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: "Alerta resolvido",
      description: "O alerta foi marcado como resolvido"
    });
  };

  const restartService = (service: string) => {
    toast({
      title: "Reiniciando serviço",
      description: `${service} está sendo reiniciado...`
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitor Avançado do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da infraestrutura
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'MONITORANDO' : 'PAUSADO'}
            </span>
          </div>
          
          <Badge variant="outline" className="gap-2">
            <Clock className="w-3 h-3" />
            {lastUpdate.toLocaleTimeString()}
          </Badge>
          
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
            {isMonitoring ? 'Pausar' : 'Iniciar'}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {metric.icon}
                {getStatusIcon(metric.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {metric.value}{metric.unit}
              </div>
              <Progress 
                value={metric.value} 
                className={`h-2 ${metric.status === 'critical' ? 'bg-red-100' : 
                  metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`} 
              />
              <p className={`text-xs mt-1 ${getStatusColor(metric.status)}`}>
                Limite: {metric.threshold}{metric.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      {alerts.some(alert => !alert.resolved) && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.filter(alert => !alert.resolved).map((alert) => (
              <Alert key={alert.id} className={`${
                alert.type === 'error' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolver
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance em Tempo Real</CardTitle>
              <CardDescription>
                Utilização de recursos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="network" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'API Gateway', status: 'running', uptime: '99.9%', requests: '1.2M' },
              { name: 'Database', status: 'running', uptime: '99.8%', requests: '856K' },
              { name: 'Cache Redis', status: 'running', uptime: '100%', requests: '2.1M' },
              { name: 'Queue Worker', status: 'warning', uptime: '98.5%', requests: '450K' },
              { name: 'Auth Service', status: 'running', uptime: '99.7%', requests: '320K' },
              { name: 'File Storage', status: 'running', uptime: '99.9%', requests: '180K' }
            ].map((service, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                      <Badge variant={service.status === 'running' ? 'default' : 'destructive'}>
                        {service.status === 'running' ? 'Online' : 'Atenção'}
                      </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime:</span>
                      <span className="font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Requisições:</span>
                      <span className="font-medium">{service.requests}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => restartService(service.name)}
                    >
                      Reiniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>
                Eventos recentes dos serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className={`w-2 h-2 rounded-full ${
                        log.level === 'error' ? 'bg-red-500' :
                        log.level === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.service}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Tráfego de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125.4 MB/s</div>
                <Progress value={35} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  35% da capacidade máxima
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Tráfego de Saída
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.2 MB/s</div>
                <Progress value={28} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  28% da capacidade máxima
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSystemMonitor;