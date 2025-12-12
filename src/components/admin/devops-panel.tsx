import { useCallback, useEffect, useState } from "react";;

/**
 * DevOps Panel - PATCH 960
 * Painel técnico local para monitoramento e controle em campo
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  Wifi, WifiOff, Database, Cpu, HardDrive, RefreshCw, 
  AlertTriangle, CheckCircle, Clock, Zap, Server, Activity,
  Download, Upload, Trash2, Settings, Bug, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { indexedDBSync } from "@/lib/offline/indexeddb-sync";
import { networkQualityMonitor, useNetworkQuality } from "@/lib/performance/network-quality-monitor";
import { offlineSyncManager } from "@/lib/offline/sync-manager";
import { circuitBreakerRegistry } from "@/lib/offline/circuit-breaker";
import { bandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { cn } from "@/lib/utils";

interface SystemMetrics {
  memory: { used: number; total: number };
  storage: { used: number; quota: number };
  syncQueue: { pending: number; failed: number; completed: number };
  circuits: Record<string, { state: string; failures: number }>;
  uptime: number;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error";
  module: string;
  message: string;
}

export const DevOpsPanel = memo(function() {
  const { toast } = useToast();
  const networkQuality = useNetworkQuality();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Collect system metrics
  const collectMetrics = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Memory (if available)
      const memory = (performance as unknown).memory;
      const memoryInfo = memory ? {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
      } : { used: 0, total: 0 };

      // Storage quota
      const storageEstimate = await navigator.storage?.estimate() || { usage: 0, quota: 0 };

      // Sync queue stats
      const queueStats = await indexedDBSync.getQueueStats();

      // Circuit breaker status
      const circuitStats = circuitBreakerRegistry.getAllStats();
      const circuits: Record<string, { state: string; failures: number }> = {};
      for (const [name, stats] of Object.entries(circuitStats)) {
        circuits[name] = { state: stats.state, failures: stats.failures };
      }

      setMetrics({
        memory: memoryInfo,
        storage: { used: storageEstimate.usage || 0, quota: storageEstimate.quota || 0 },
        syncQueue: {
          pending: queueStats.pending,
          failed: queueStats.failed,
          completed: queueStats.completed,
        },
        circuits,
        uptime: performance.now(),
      });

      // Add log entry
      addLog("info", "DevOps", "Métricas coletadas com sucesso");
    } catch (error) {
      addLog("error", "DevOps", `Erro ao coletar métricas: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const addLog = (level: LogEntry["level"], module: string, message: string) => {
    setLogs(prev => [{
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date(),
      level,
      module,
      message,
    }, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Force sync
  const forceSync = async () => {
    addLog("info", "Sync", "Forçando sincronização...");
    try {
      const stats = await offlineSyncManager.syncAll();
      addLog("info", "Sync", `Sincronização concluída: ${stats.completed} sucesso, ${stats.failed} falhas`);
      toast({
        title: "Sincronização concluída",
        description: `${stats.completed} operações sincronizadas`,
      });
      await collectMetrics();
    } catch (error) {
      addLog("error", "Sync", `Erro na sincronização: ${error}`);
      toast({
        title: "Erro na sincronização",
        description: "Verifique os logs para mais detalhes",
        variant: "destructive",
      });
    }
  };

  // Clear completed operations
  const clearCompleted = async () => {
    try {
      const cleared = await indexedDBSync.clearCompletedOperations();
      addLog("info", "Sync", `${cleared} operações concluídas removidas da fila`);
      await collectMetrics();
    } catch (error) {
      addLog("error", "Sync", `Erro ao limpar fila: ${error}`);
    }
  };

  // Reset circuits
  const resetCircuits = () => {
    circuitBreakerRegistry.resetAll();
    addLog("info", "Circuit", "Todos os circuit breakers resetados");
    collectMetrics();
  };

  // Clear all caches
  const clearAllCaches = async () => {
    try {
      await caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
      await indexedDBSync.clearAll();
      addLog("warn", "Cache", "Todos os caches foram limpos");
      toast({
        title: "Caches limpos",
        description: "Todos os dados em cache foram removidos",
      });
      await collectMetrics();
    } catch (error) {
      addLog("error", "Cache", `Erro ao limpar caches: ${error}`);
    }
  };

  // Export logs
  const exportLogs = () => {
    const logData = logs.map(l => 
      `[${l.timestamp.toISOString()}] [${l.level.toUpperCase()}] [${l.module}] ${l.message}`
    ).join("\n");
    
    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nautilus-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog("info", "DevOps", "Logs exportados");
  };

  // Auto refresh
  useEffect(() => {
    collectMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(collectMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, collectMetrics]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  });

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel DevOps</h1>
          <p className="text-muted-foreground">Monitoramento e controle técnico local</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="auto-refresh" 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh} 
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={collectMetrics}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {networkQuality.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              Rede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkQuality.type.toUpperCase()}
            </div>
            <div className="text-xs text-muted-foreground">
              {networkQuality.downlink.toFixed(1)} Mbps • {networkQuality.rtt.toFixed(0)}ms
            </div>
            {networkQuality.isLowBandwidth && (
              <Badge variant="secondary" className="mt-2">Modo otimizado</Badge>
            )}
          </CardContent>
        </Card>

        {/* Sync Queue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Fila de Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.syncQueue.pending || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              pendentes • {metrics?.syncQueue.failed || 0} falhas
            </div>
            {(metrics?.syncQueue.pending || 0) > 10 && (
              <Badge variant="destructive" className="mt-2">Acumulando</Badge>
            )}
          </CardContent>
        </Card>

        {/* Memory */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.memory.total ? 
                `${((metrics.memory.used / metrics.memory.total) * 100).toFixed(0)}%` : 
                "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.storage.quota ? 
                `${((metrics.storage.used / metrics.storage.quota) * 100).toFixed(0)}%` : 
                "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatBytes(metrics?.storage.used || 0)} usado
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="controls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="controls">Controles</TabsTrigger>
          <TabsTrigger value="circuits">Circuit Breakers</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sincronização</CardTitle>
                <CardDescription>Controle da fila de sync offline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={forceSync} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Forçar Sincronização
                </Button>
                <Button variant="outline" onClick={clearCompleted} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Concluídos
                </Button>
                <div className="text-xs text-muted-foreground">
                  Uptime: {formatUptime(metrics?.uptime || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache & Reset</CardTitle>
                <CardDescription>Gerenciamento de cache local</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={resetCircuits} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resetar Circuit Breakers
                </Button>
                <Button variant="destructive" onClick={clearAllCaches} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todos os Caches
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* LLM Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Status da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Modo</div>
                  <div className="font-medium">
                    {networkQuality.isOnline ? "Híbrido (API + Local)" : "Local Only"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fallback</div>
                  <Badge variant="outline" className="text-green-500">Ativo</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Cache de Respostas</div>
                  <div className="font-medium">Habilitado</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Compressão</div>
                  <div className="font-medium">LZ (Ativa)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Circuit Breakers Tab */}
        <TabsContent value="circuits">
          <Card>
            <CardHeader>
              <CardTitle>Circuit Breakers</CardTitle>
              <CardDescription>Status dos circuit breakers de serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.circuits && Object.entries(metrics.circuits).map(([name, { state, failures }]) => (
                  <div key={name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        state === "closed" && "bg-green-500",
                        state === "open" && "bg-red-500",
                        state === "half-open" && "bg-yellow-500",
                      )} />
                      <div>
                        <div className="font-medium capitalize">{name}</div>
                        <div className="text-xs text-muted-foreground">
                          {failures} falhas recentes
                        </div>
                      </div>
                    </div>
                    <Badge variant={state === "closed" ? "default" : "destructive"}>
                      {state}
                    </Badge>
                  </div>
                ))}
                {(!metrics?.circuits || Object.keys(metrics.circuits).length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum circuit breaker registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>Últimos 100 eventos</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {logs.map(log => (
                    <div 
                      key={log.id} 
                      className={cn(
                        "text-xs font-mono p-2 rounded",
                        log.level === "error" && "bg-destructive/10 text-destructive",
                        log.level === "warn" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                        log.level === "info" && "bg-muted",
                      )}
                    >
                      <span className="text-muted-foreground">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span>
                      {" "}
                      <span className="font-semibold">[{log.module}]</span>
                      {" "}
                      {log.message}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum log registrado
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debug Tab */}
        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Modo Debug
              </CardTitle>
              <CardDescription>Ferramentas avançadas para desenvolvedores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Modo Debug Ativo</Label>
                <Switch checked={debugMode} onCheckedChange={setDebugMode} />
              </div>
              
              {debugMode && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium mb-2">Configurações de Rede</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify({
                        connectionType: bandwidthOptimizer.getConnectionType(),
                        isLowBandwidth: bandwidthOptimizer.isLowBandwidth(),
                        config: bandwidthOptimizer.getConfig(),
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Sync Status</h4>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(offlineSyncManager.getNetworkStatus(), null, 2)}
                    </pre>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => networkQualityMonitor.runTest()}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Executar Teste de Rede
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DevOpsPanel;
