import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { controlHub } from './hub_core';
import { HubState, HealthStatus } from './types';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';

export const ControlHubUI: React.FC = () => {
  const [state, setState] = useState<HubState | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Inicializa o Control Hub
    controlHub.iniciar();

    // Atualiza estado inicial
    updateState();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      updateState();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateState = async () => {
    try {
      const currentState = controlHub.getState();
      const currentHealth = await controlHub.getHealth();
      setState(currentState);
      setHealth(currentHealth);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao atualizar estado:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await controlHub.forceSyncronizar();
      await updateState();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OK': 'bg-green-500',
      'Online': 'bg-green-500',
      'Auditoria OK': 'bg-green-500',
      'Em verificação': 'bg-yellow-500',
      'Desvio detectado': 'bg-orange-500',
      'Offline': 'bg-red-500',
      'Error': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getHealthIcon = () => {
    if (!health) return <Activity className="h-5 w-5" />;
    
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getQualityLabel = (quality: string) => {
    const labels: Record<string, string> = {
      'excellent': 'Excelente',
      'good': 'Boa',
      'fair': 'Regular',
      'poor': 'Fraca',
      'offline': 'Offline',
    };
    return labels[quality] || quality;
  };

  if (!state || !health) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando Control Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🔱 Nautilus Control Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Painel de controle centralizado - Atualizado às {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </div>

      {/* System Health Alert */}
      {health.status !== 'healthy' && (
        <Alert variant={health.status === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {health.status === 'critical' 
              ? 'Sistema em estado crítico! Verifique os módulos abaixo.'
              : 'Alguns módulos requerem atenção.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {getHealthIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{health.status}</div>
            <p className="text-xs text-muted-foreground">
              {health.modules.length} módulos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectividade</CardTitle>
            {state.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.isOnline ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              Qualidade: {getQualityLabel(health.connectivity.quality)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Offline</CardTitle>
            <Database className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.pendingRecords}</div>
            <p className="text-xs text-muted-foreground">
              Registros pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sync</CardTitle>
            <RefreshCw className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.lastSync ? state.lastSync.toLocaleTimeString() : 'Nunca'}
            </div>
            <p className="text-xs text-muted-foreground">
              Automática a cada 5 min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Status Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Status dos Módulos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(state.modules).map(([key, module]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{module.name}</CardTitle>
                  <Badge className={getStatusColor(module.status)}>
                    {module.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {module.uptime !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-medium">{Math.floor(module.uptime / 60)} min</span>
                    </div>
                  )}
                  {module.errors !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Erros:</span>
                      <span className="font-medium">{module.errors}</span>
                    </div>
                  )}
                  {module.performance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Performance:</span>
                      <span className="font-medium">{module.performance}%</span>
                    </div>
                  )}
                  {module.lastCheck && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última verificação:</span>
                      <span className="font-medium text-xs">
                        {new Date(module.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cache</CardTitle>
          <CardDescription>
            Armazenamento local para operação offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Capacidade:</span>
              <span className="font-medium">
                {(health.cache.size / 1024 / 1024).toFixed(2)} MB / 
                {(health.cache.capacity / 1024 / 1024).toFixed(0)} MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(health.cache.size / health.cache.capacity * 100).toFixed(0)}%` 
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="ml-2 font-medium">{health.cache.pending}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-medium">
                  {health.cache.pending} entradas
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlHubUI;
