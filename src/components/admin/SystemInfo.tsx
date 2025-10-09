import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Activity, 
  Server, 
  Database,
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export const SystemInfo: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [uptime, setUptime] = useState('0d 0h 0m');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Calculate uptime (simulated from component mount)
    const startTime = Date.now();
    const uptimeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      setUptime(`${days}d ${hours}h ${minutes}m`);
    }, 60000); // Update every minute

    return () => {
      clearInterval(clockInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const systemHealth = {
    status: 'healthy',
    cpu: 45,
    memory: 62,
    activeUsers: 87,
    requestsPerMin: 324
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real do Nautilus One
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Data e Hora Atual</p>
              <p className="text-lg font-semibold">
                {currentTime.toLocaleString('pt-BR', { 
                  dateStyle: 'short', 
                  timeStyle: 'medium' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Server className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">System Uptime</p>
              <p className="text-lg font-semibold">{uptime}</p>
            </div>
          </div>
        </div>

        {/* System Health Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            Status do Sistema
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-card border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">CPU</span>
                <Badge 
                  variant="outline" 
                  className={systemHealth.cpu > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                >
                  {systemHealth.cpu}%
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-card border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Memória</span>
                <Badge 
                  variant="outline" 
                  className={systemHealth.memory > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                >
                  {systemHealth.memory}%
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-card border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Usuários</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {systemHealth.activeUsers}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-card border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Req/min</span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                  {systemHealth.requestsPerMin}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-success rounded-full animate-pulse" />
            <span className="font-medium text-success">Sistema Operacional</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
