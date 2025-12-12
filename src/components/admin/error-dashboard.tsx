// @ts-nocheck
/**
 * PATCH 652 - Error Dashboard
 * Centralized error monitoring and tracking
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Trash2,
  TrendingUp,
  Activity,
  Wifi,
  Lock,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { useErrorTracker } from '@/hooks/use-error-tracker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ErrorCategory, ErrorSeverity } from '@/lib/error-tracker';

export const ErrorDashboard: React.FC = () => {
  const { stats, getErrors, getErrorsByCategory, getErrorsBySeverity, clear } = useErrorTracker();

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: ErrorSeverity) => {
    const variants = {
      critical: <Badge variant="destructive">Crítico</Badge>,
      high: <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Alto</Badge>,
      medium: <Badge className="bg-warning/20 text-warning border-warning/30">Médio</Badge>,
      low: <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Baixo</Badge>,
    };
    return variants[severity];
  };

  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'network':
        return <Wifi className="w-4 h-4" />;
      case 'authentication':
        return <Lock className="w-4 h-4" />;
      case 'runtime':
        return <Terminal className="w-4 h-4" />;
      case 'validation':
        return <AlertCircle className="w-4 h-4" />;
      case 'unknown':
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: ErrorCategory): string => {
    switch (category) {
      case 'network':
        return 'text-blue-500';
      case 'authentication':
        return 'text-red-500';
      case 'runtime':
        return 'text-purple-500';
      case 'validation':
        return 'text-yellow-500';
      case 'unknown':
        return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const hasErrors = stats.total > 0;
  const hasCriticalErrors = stats.bySeverity.critical > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-nautical/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Error Tracking
                </CardTitle>
                <CardDescription>
                  Monitoramento centralizado de erros e exceções do sistema
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clear}
                disabled={!hasErrors}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Tudo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Alert */}
      {hasCriticalErrors && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erros Críticos Detectados</AlertTitle>
          <AlertDescription>
            {stats.bySeverity.critical} erro(s) crítico(s) foram detectados. Requerem atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total de Erros</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 100 registros
            </p>
          </CardContent>
        </Card>

        <Card className={stats.bySeverity.critical > 0 ? "border-destructive/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Críticos</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {stats.bySeverity.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer ação imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">Alta Prioridade</span>
            </div>
            <div className="text-2xl font-bold text-warning">
              {stats.bySeverity.high}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Últimas 24h</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.recent.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Erros recentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Errors by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Erros por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(Object.entries(stats.byCategory) as [ErrorCategory, number][]).map(([category, count]) => (
              <div key={category} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={getCategoryColor(category)}>
                  {getCategoryIcon(category)}
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{category}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Erros</CardTitle>
          <CardDescription>
            Histórico detalhado dos últimos erros registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="critical">Críticos ({stats.bySeverity.critical})</TabsTrigger>
              <TabsTrigger value="high">Altos ({stats.bySeverity.high})</TabsTrigger>
              <TabsTrigger value="medium">Médios ({stats.bySeverity.medium})</TabsTrigger>
              <TabsTrigger value="low">Baixos ({stats.bySeverity.low})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[500px]">
                {hasErrors ? (
                  <div className="space-y-3">
                    {getErrors().reverse().map((error) => (
                      <div key={error.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(error.severity)}
                            <span className="font-medium">{error.message}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(error.severity)}
                            <Badge variant="outline" className="capitalize">
                              {getCategoryIcon(error.category)}
                              <span className="ml-1">{error.category}</span>
                            </Badge>
                          </div>
                        </div>
                        
                        {error.stack && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Stack trace
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimestamp(error.timestamp)}</span>
                          {error.url && <span className="truncate max-w-xs">{error.url}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum erro registrado</h3>
                    <p className="text-muted-foreground">
                      Sistema operando normalmente
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {(['critical', 'high', 'medium', 'low'] as ErrorSeverity[]).map(severity => (
              <TabsContent key={severity} value={severity}>
                <ScrollArea className="h-[500px]">
                  {getErrorsBySeverity(severity).length > 0 ? (
                    <div className="space-y-3">
                      {getErrorsBySeverity(severity).reverse().map((error) => (
                        <div key={error.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(error.severity)}
                              <span className="font-medium">{error.message}</span>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {getCategoryIcon(error.category)}
                              <span className="ml-1">{error.category}</span>
                            </Badge>
                          </div>
                          
                          {error.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Stack trace
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {error.stack}
                              </pre>
                            </details>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatTimestamp(error.timestamp)}</span>
                            {error.url && <span className="truncate max-w-xs">{error.url}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Nenhum erro {severity === 'critical' ? 'crítico' : severity === 'high' ? 'alto' : severity === 'medium' ? 'médio' : 'baixo'}
                      </h3>
                      <p className="text-muted-foreground">
                        Nenhum erro desta severidade foi registrado
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Debug Information</AlertTitle>
        <AlertDescription>
          <div className="space-y-2 text-sm mt-2">
            <p>💡 Use `window.__NAUTILUS_ERRORS__` no console para acessar todos os erros</p>
            <p>💡 Use `window.__NAUTILUS_ERROR_TRACKER__` para acessar o tracker completo</p>
            <p>💡 O sistema mantém os últimos 100 erros em memória</p>
            <p>💡 Handlers globais capturam erros não tratados automaticamente</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
