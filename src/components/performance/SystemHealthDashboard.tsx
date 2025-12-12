/**
 * System Health Dashboard - PATCH 970
 * Visual display of system performance and health
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Battery, 
  RefreshCw,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { systemBenchmark, type BenchmarkResult } from "@/lib/performance/system-benchmark";
import { dataRetentionManager } from "@/lib/performance/data-retention";
import { smartSyncManager, type SyncStats } from "@/lib/performance/smart-sync";
import { useResourceManager } from "@/hooks/use-resource-manager";
import { useMemoryOptimizer } from "@/hooks/use-memory-optimizer";
import { useToast } from "@/hooks/use-toast";

const StatusBadge = memo(({ status }: { status: string }) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    excellent: { variant: "default", label: "Excelente" },
    good: { variant: "secondary", label: "Bom" },
    fair: { variant: "outline", label: "Regular" },
    critical: { variant: "destructive", label: "Crítico" },
  };
  
  const config = variants[status] || variants.fair;
  return <Badge variant={config.variant}>{config.label}</Badge>;
});

StatusBadge.displayName = "StatusBadge";

const ScoreCircle = memo(({ score, size = 80 }: { score: number; size?: number }) => {
  const color = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";
  const circumference = 2 * Math.PI * 35;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r="35"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r="35"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${color}`}>{score}</span>
      </div>
    </div>
  );
});

ScoreCircle.displayName = "ScoreCircle";

export const SystemHealthDashboard = memo(() => {
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { toast } = useToast();
  
  const resourceStatus = useResourceManager();
  const memoryStats = useMemoryOptimizer();
  const storageStats = dataRetentionManager.getStorageStats();
  const cleanupSuggestion = dataRetentionManager.suggestCleanup();

  useEffect(() => {
    const lastResult = systemBenchmark.getLastResult();
    if (lastResult) {
      setBenchmark(lastResult);
    }
    
    setSyncStats(smartSyncManager.getStats());
    const unsubscribe = smartSyncManager.subscribe(setSyncStats);
    
    return () => unsubscribe();
  }, []);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await systemBenchmark.runFullBenchmark();
      setBenchmark(result);
      toast({
        title: "Benchmark Concluído",
        description: `Score: ${result.score}/100 - ${result.status}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao executar benchmark",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  }, [toast]);

  const runCleanup = useCallback(async () => {
    setIsCleaning(true);
    try {
      const results = await dataRetentionManager.runCleanup();
      const totalFreed = results.reduce((acc, r) => acc + r.bytesFreed, 0);
      const totalItems = results.reduce((acc, r) => acc + r.itemsRemoved, 0);
      
      toast({
        title: "Limpeza Concluída",
        description: `${totalItems} itens removidos, ${(totalFreed / 1024).toFixed(1)}KB liberados`,
      });
      
      // Trigger memory cleanup too
      await memoryStats.performCleanup();
    } finally {
      setIsCleaning(false);
    }
  }, [toast, memoryStats]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saúde do Sistema</h2>
          <p className="text-muted-foreground">
            Diagnóstico e otimização de performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          {benchmark && <ScoreCircle score={benchmark.score} />}
          <Button onClick={runBenchmark} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Testando..." : "Executar Benchmark"}
          </Button>
        </div>
      </div>

      {/* Resource Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <div className="mt-2">
              <Badge variant={resourceStatus.cpu === "high" ? "destructive" : "secondary"}>
                {resourceStatus.cpu === "high" ? "Alto" : resourceStatus.cpu === "low" ? "Baixo" : "Normal"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Memória</span>
            </div>
            <div className="mt-2">
              <Badge variant={memoryStats.isCriticalMemory ? "destructive" : memoryStats.isHighMemory ? "outline" : "secondary"}>
                {Math.round(memoryStats.usage * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rede</span>
            </div>
            <div className="mt-2">
              <Badge variant={resourceStatus.network === "offline" ? "destructive" : resourceStatus.network === "slow" ? "outline" : "secondary"}>
                {resourceStatus.network === "offline" ? "Offline" : 
                  resourceStatus.network === "slow" ? "Lenta" : 
                    resourceStatus.network === "moderate" ? "Moderada" : "Rápida"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bateria</span>
            </div>
            <div className="mt-2">
              <Badge variant={resourceStatus.battery === "low" ? "destructive" : "secondary"}>
                {resourceStatus.battery === "charging" ? "Carregando" : 
                  resourceStatus.battery === "low" ? "Baixa" : "Normal"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Details */}
      {benchmark && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Resultado do Benchmark
                </CardTitle>
                <CardDescription>
                  Executado em {new Date(benchmark.timestamp).toLocaleString()}
                </CardDescription>
              </div>
              <StatusBadge status={benchmark.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(benchmark.details).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium">{value.score}/100</span>
                  </div>
                  <Progress value={value.score} className="h-2" />
                </div>
              ))}
            </div>
            
            {benchmark.recommendations.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Recomendações
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {benchmark.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage & Sync */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Armazenamento Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usado</span>
                <span>{formatBytes(storageStats.used)} / {formatBytes(storageStats.total)}</span>
              </div>
              <Progress value={(storageStats.used / storageStats.total) * 100} />
            </div>
            
            {cleanupSuggestion.shouldClean && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                cleanupSuggestion.urgency === "high" ? "bg-destructive/10 text-destructive" :
                  cleanupSuggestion.urgency === "medium" ? "bg-yellow-500/10 text-yellow-600" :
                    "bg-muted"
              }`}>
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{cleanupSuggestion.reason}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={runCleanup}
              disabled={isCleaning}
            >
              <Trash2 className={`h-4 w-4 mr-2 ${isCleaning ? "animate-pulse" : ""}`} />
              {isCleaning ? "Limpando..." : "Executar Limpeza"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStats && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Pendentes</span>
                    <p className="text-lg font-medium">{syncStats.pending}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Concluídos</span>
                    <p className="text-lg font-medium">{syncStats.completed}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Falhas</span>
                    <p className="text-lg font-medium text-destructive">{syncStats.failed}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Tempo Médio</span>
                    <p className="text-lg font-medium">{syncStats.avgTimeMs}ms</p>
                  </div>
                </div>
                
                {syncStats.lastSyncAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Última sync: {new Date(syncStats.lastSyncAt).toLocaleTimeString()}
                  </div>
                )}
                
                {syncStats.pending === 0 && syncStats.failed === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Tudo sincronizado
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

SystemHealthDashboard.displayName = "SystemHealthDashboard";

export default SystemHealthDashboard;
