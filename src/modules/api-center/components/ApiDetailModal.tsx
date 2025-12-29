/**
 * API Detail Modal Component
 * PATCH 659: Detailed view of API logs and metrics
 */

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, BarChart3 
} from 'lucide-react';
import { API_REGISTRY, type ApiIntegration, type ApiLog, type ApiQuota } from '../types';
import { cn } from '@/lib/utils';

interface ApiDetailModalProps {
  api: ApiIntegration | null;
  logs: ApiLog[];
  quota: ApiQuota | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApiDetailModal({ api, logs, quota, isOpen, onClose }: ApiDetailModalProps) {
  if (!api) return null;

  const registry = API_REGISTRY[api.api_name];
  
  const metrics = useMemo(() => {
    if (logs.length === 0) return null;
    
    const successLogs = logs.filter(l => l.status_code && l.status_code < 400);
    const avgResponseTime = logs
      .filter(l => l.response_time_ms)
      .reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length;
    
    return {
      totalCalls: logs.length,
      successRate: Math.round((successLogs.length / logs.length) * 100),
      avgResponseTime: Math.round(avgResponseTime),
      errorCount: logs.length - successLogs.length
    };
  }, [logs]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {registry?.name || api.api_name}
          </DialogTitle>
          <DialogDescription>
            {registry?.description || 'Detalhes da integração externa'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Total de Chamadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.totalCalls}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Taxa de Sucesso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.successRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tempo Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.avgResponseTime}ms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Erros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{metrics.errorCount}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma métrica disponível ainda</p>
              </div>
            )}

            {quota && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Quota de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            quota.quota_limit && (quota.quota_used / quota.quota_limit) > 0.8 
                              ? "bg-destructive" 
                              : "bg-primary"
                          )}
                          style={{ 
                            width: quota.quota_limit 
                              ? `${Math.min((quota.quota_used / quota.quota_limit) * 100, 100)}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      {quota.quota_used} / {quota.quota_limit || '∞'}
                    </p>
                  </div>
                  {quota.reset_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reset em: {new Date(quota.reset_at).toLocaleString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <ScrollArea className="h-[300px]">
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.slice(0, 20).map((log) => (
                    <div 
                      key={log.id}
                      className={cn(
                        "p-3 rounded-lg border text-sm",
                        log.status_code && log.status_code >= 400 
                          ? "bg-destructive/5 border-destructive/20" 
                          : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.status_code && log.status_code < 400 ? "default" : "destructive"}>
                            {log.status_code || 'N/A'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {log.method} {log.endpoint}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {log.response_time_ms}ms
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {log.error_message && (
                        <p className="text-xs text-destructive mt-1">
                          {log.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log disponível</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardContent className="pt-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant={api.status === 'active' ? 'default' : 'secondary'}>
                        {api.status}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Categoria</dt>
                    <dd>{api.api_category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Última Verificação</dt>
                    <dd>
                      {api.last_checked 
                        ? new Date(api.last_checked).toLocaleString('pt-BR')
                        : 'Nunca'
                      }
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Contagem de Erros</dt>
                    <dd>{api.error_count}</dd>
                  </div>
                  {registry?.docsUrl && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Documentação</dt>
                      <dd>
                        <a 
                          href={registry.docsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Ver docs
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
