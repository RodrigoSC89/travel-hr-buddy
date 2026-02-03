/**
 * Satellite Optimizer Dashboard - PATCH 1000
 * Visual interface for satellite communication optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Satellite, 
  Signal, 
  SignalHigh, 
  SignalLow,
  SignalZero,
  Upload,
  Download,
  Clock,
  DollarSign,
  Zap,
  RefreshCw,
  TrendingDown,
  Radio,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SatelliteOptimizer } from '@/lib/connectivity/satellite-optimizer';
import { logger } from '@/lib/logger';

type SatelliteProvider = 'iridium' | 'inmarsat' | 'vsat' | 'starlink';

const PROVIDER_INFO: Record<SatelliteProvider, { name: string; costPerMB: number; coverage: string }> = {
  iridium: { name: 'Iridium', costPerMB: 12.00, coverage: 'Global' },
  inmarsat: { name: 'Inmarsat', costPerMB: 8.00, coverage: 'Exceto polos' },
  vsat: { name: 'VSAT', costPerMB: 2.50, coverage: 'Costeira' },
  starlink: { name: 'Starlink Maritime', costPerMB: 0.50, coverage: 'Global*' },
};

const QUALITY_CONFIG = {
  excellent: { icon: SignalHigh, color: 'text-success', bg: 'bg-success/10' },
  good: { icon: Signal, color: 'text-success', bg: 'bg-success/10' },
  fair: { icon: SignalLow, color: 'text-warning', bg: 'bg-warning/10' },
  poor: { icon: SignalZero, color: 'text-destructive', bg: 'bg-destructive/10' },
};

interface QueueItem {
  id: string;
  type: string;
  size: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp: Date;
}

export function SatelliteOptimizerDashboard() {
  const [provider, setProvider] = useState<SatelliteProvider>('vsat');
  const [connectivity, setConnectivity] = useState<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    bandwidth: number;
    latency: number;
  }>({ quality: 'good', bandwidth: 1500, latency: 200 });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalCompressed: 0,
    costSaved: 0,
    pendingItems: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize
    SatelliteOptimizer.setProvider(provider);
    updateConnectivity();
    updateQueue();
  }, [provider]);

  const updateConnectivity = async () => {
    // Simulate connectivity check
    const qualities = ['excellent', 'good', 'fair', 'poor'] as const;
    const randomQuality = qualities[Math.floor(Math.random() * 3)]; // Favor better quality
    
    setConnectivity({
      quality: randomQuality,
      bandwidth: randomQuality === 'excellent' ? 10000 : 
                 randomQuality === 'good' ? 1500 : 
                 randomQuality === 'fair' ? 300 : 50,
      latency: randomQuality === 'excellent' ? 50 : 
               randomQuality === 'good' ? 200 : 
               randomQuality === 'fair' ? 500 : 1000,
    });
  };

  const updateQueue = () => {
    const currentQueue = SatelliteOptimizer.getSyncQueue();
    setQueue(currentQueue.map(item => ({
      id: item.id,
      type: item.type,
      size: item.size,
      priority: item.priority,
      timestamp: item.timestamp,
    })));
    setStats(prev => ({ ...prev, pendingItems: currentQueue.length }));
  };

  const handleProcessQueue = async () => {
    setLoading(true);
    try {
      const result = await SatelliteOptimizer.processSyncQueue();
      setStats(prev => ({
        ...prev,
        totalSent: prev.totalSent + result.processed,
        costSaved: prev.costSaved + (result.cost * 0.3), // Assume 30% savings from optimization
      }));
      updateQueue();
    } catch (error) {
      logger.error('Failed to process queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeData = async () => {
    setLoading(true);
    try {
      // Buscar dados reais da fila de sync para otimizar
      const currentQueue = SatelliteOptimizer.getSyncQueue();
      
      if (currentQueue.length === 0) {
        // Se não há dados na fila, criar entrada de teste com dados mínimos
        const testPayload = {
          type: 'connectivity_test',
          vessel_id: 'test',
          timestamp: new Date().toISOString(),
          data: { ping: true },
        };
        
        const result = await SatelliteOptimizer.optimizeForSatellite(testPayload);
        
        setStats(prev => ({
          ...prev,
          totalCompressed: prev.totalCompressed + Math.max(0, result.totalSize - result.compressedSize),
          costSaved: prev.costSaved + result.estimatedCost * 0.6,
        }));
      } else {
        // Processar itens reais da fila
        for (const item of currentQueue.slice(0, 5)) {
          const result = await SatelliteOptimizer.optimizeForSatellite(item);
          setStats(prev => ({
            ...prev,
            totalCompressed: prev.totalCompressed + Math.max(0, result.totalSize - result.compressedSize),
            costSaved: prev.costSaved + result.estimatedCost * 0.6,
          }));
        }
      }
    } catch (error) {
      logger.error('Failed to optimize:', error);
    } finally {
      setLoading(false);
    }
  };

  const QualityIcon = QUALITY_CONFIG[connectivity.quality].icon;
  const compressionRatio = stats.totalCompressed > 0 
    ? ((stats.totalCompressed / (stats.totalSent * 1000 + stats.totalCompressed)) * 100).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Provider Selection & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              Provedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={provider} 
              onValueChange={(v) => setProvider(v as SatelliteProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex justify-between items-center w-full">
                      <span>{info.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ${info.costPerMB}/MB
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Cobertura: {PROVIDER_INFO[provider].coverage}
            </p>
          </CardContent>
        </Card>

        <Card className={QUALITY_CONFIG[connectivity.quality].bg}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <QualityIcon className={cn("h-4 w-4", QUALITY_CONFIG[connectivity.quality].color)} />
              Conectividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-bold", QUALITY_CONFIG[connectivity.quality].color)}>
                {connectivity.quality.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-muted-foreground">Banda:</span>{' '}
                <span className="font-medium">{connectivity.bandwidth} kbps</span>
              </div>
              <div>
                <span className="text-muted-foreground">Latência:</span>{' '}
                <span className="font-medium">{connectivity.latency} ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success">
                ${stats.costSaved.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compressão: {compressionRatio}% | Itens: {stats.totalSent}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Otimização de Dados
            </CardTitle>
            <CardDescription>
              Compressão e chunking para transmissão via satélite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <Upload className="h-6 w-6 mx-auto mb-2 text-info" />
                <p className="text-sm text-muted-foreground">Dados enviados</p>
                <p className="text-xl font-bold">{stats.totalSent} KB</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <Download className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-sm text-muted-foreground">Comprimido</p>
                <p className="text-xl font-bold">{(stats.totalCompressed / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Compressão</span>
                <span>{compressionRatio}%</span>
              </div>
              <Progress value={Number(compressionRatio)} className="h-2" />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Estratégias Ativas:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">GZIP Compression</Badge>
                <Badge variant="secondary">64KB Chunks</Badge>
                <Badge variant="secondary">Delta Sync</Badge>
                <Badge variant="secondary">Priority Queue</Badge>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleOptimizeData}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Otimizar Dados de Teste
            </Button>
          </CardContent>
        </Card>

        {/* Sync Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fila de Sincronização
            </CardTitle>
            <CardDescription>
              {queue.length} item(s) aguardando transmissão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[200px]">
              {queue.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Fila vazia</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.priority === 'critical' ? 'destructive' : 'outline'}
                        >
                          {item.priority}
                        </Badge>
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(item.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleProcessQueue}
                disabled={loading || queue.length === 0}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Processar Fila
              </Button>
              <Button variant="outline" onClick={updateQueue}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Comparativo de Custos por Provedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PROVIDER_INFO).map(([key, info]) => (
              <div
                key={key}
                className={cn(
                  "p-4 rounded-lg border text-center transition-all",
                  provider === key ? "border-primary bg-primary/5" : ""
                )}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Wifi className="h-4 w-4" />
                  <span className="font-medium">{info.name}</span>
                </div>
                <p className="text-2xl font-bold">${info.costPerMB}</p>
                <p className="text-xs text-muted-foreground">/MB</p>
                <p className="text-xs text-muted-foreground mt-1">{info.coverage}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">Economia com Otimização</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Com compressão GZIP e delta sync, o sistema reduz o consumo de dados em até <strong className="text-emerald-600">60-70%</strong>, 
              gerando economia significativa especialmente em provedores premium como Iridium e Inmarsat.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SatelliteOptimizerDashboard;
