/**
 * PATCH 85.0 - System Watchdog Monitor
 * Dashboard para monitorar o watchdog autocorretivo
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Activity, AlertTriangle, CheckCircle2, Bug, BarChart3 } from 'lucide-react';
import { systemWatchdog } from '@/ai/watchdog';
import { toast } from 'sonner';

export default function WatchdogMonitor() {
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState({
    isActive: false,
    totalErrors: 0,
    criticalErrors: 0,
    errorsByType: {} as Record<string, number>,
  });

  useEffect(() => {
    // Atualizar stats a cada 5 segundos
    const interval = setInterval(() => {
      const currentStats = systemWatchdog.getStats();
      setStats(currentStats);
      setIsActive(currentStats.isActive);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startWatchdog = () => {
    systemWatchdog.start();
    setIsActive(true);
    toast.success('System Watchdog ativado!');
  };

  const stopWatchdog = () => {
    systemWatchdog.stop();
    setIsActive(false);
    toast.info('System Watchdog desativado');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Watchdog Monitor</h1>
          <p className="text-muted-foreground">
            PATCH 85.0 - IA autocorretiva em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/developer/ai-modules-status">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              AI Modules Status
            </Button>
          </Link>
          {isActive ? (
            <Button onClick={stopWatchdog} variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              Parar Watchdog
            </Button>
          ) : (
            <Button onClick={startWatchdog}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Watchdog
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isActive ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento {isActive ? 'em execução' : 'pausado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Rastreados</CardTitle>
            <Bug className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Erros únicos detectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Requerem intervenção automática
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Erros por Tipo</CardTitle>
          <CardDescription>
            Distribuição dos erros detectados pelo watchdog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.errorsByType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.errorsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{type}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum erro detectado ainda
            </p>
          )}
        </CardContent>
      </Card>

      {isActive && stats.criticalErrors === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Sistema operando normalmente. O watchdog está monitorando ativamente.
          </AlertDescription>
        </Alert>
      )}

      {stats.criticalErrors > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.criticalErrors} erro(s) crítico(s) detectado(s). 
            O watchdog tentará correção automática.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recursos do Watchdog v2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Monitoramento de Logs</div>
              <div className="text-sm text-muted-foreground">
                Rastreia erros globais e promessas rejeitadas
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Correção de Imports Dinâmicos</div>
              <div className="text-sm text-muted-foreground">
                Tenta carregar módulos ausentes automaticamente
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Recuperação de Tela Branca</div>
              <div className="text-sm text-muted-foreground">
                Detecta e corrige screens em branco com reload forçado
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Sugestão de PRs</div>
              <div className="text-sm text-muted-foreground">
                Gera issues no GitHub para erros de lógica complexos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
