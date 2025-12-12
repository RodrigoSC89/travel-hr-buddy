/**
 * Performance Dashboard
 * Displays real-time performance metrics for debugging
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { memoryManager, getMemoryAwareSettings } from "@/lib/performance/memory-manager";
import { getQueueStats } from "@/lib/offline/sync-queue";
import { 
  Wifi, WifiOff, Zap, HardDrive, Clock, 
  RefreshCw, Trash2, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  memory: { usage: number; recommendation: string };
  network: { quality: string; online: boolean };
  cache: { pending: number; cached: number };
  timing: { fcp: number | null; lcp: number | null; fid: number | null };
}

export function PerformanceDashboard() {
  const network = useNetworkStatus();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { usage: 0, recommendation: "normal" },
    network: { quality: "medium", online: true },
    cache: { pending: 0, cached: 0 },
    timing: { fcp: null, lcp: null, fid: null },
  });

  useEffect(() => {
    const updateMetrics = async () => {
      // Memory
      const memStatus = memoryManager.getStatus();
      
      // Cache stats
      let cacheStats = { pendingCount: 0, cacheSize: 0 };
      try {
        cacheStats = await getQueueStats();
      } catch (e) {
        // IndexedDB not available
      }

      // Web Vitals
      const timing = { fcp: null as number | null, lcp: null as number | null, fid: null as number | null };
      if ("performance" in window) {
        const entries = performance.getEntriesByType("paint");
        const fcp = entries.find(e => e.name === "first-contentful-paint");
        if (fcp) timing.fcp = fcp.startTime;
      }

      setMetrics({
        memory: { usage: memStatus.usage, recommendation: memStatus.recommendation },
        network: { quality: network.quality, online: network.online },
        cache: { pending: cacheStats.pendingCount, cached: cacheStats.cacheSize },
        timing,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [network.quality, network.online]);

  const handleClearCache = async () => {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    memoryManager.cleanup();
  };

  const qualityColor = {
    fast: "bg-green-500",
    medium: "bg-yellow-500",
    slow: "bg-orange-500",
    offline: "bg-destructive",
  };

  const memoryColor = {
    normal: "bg-green-500",
    reduce: "bg-yellow-500",
    critical: "bg-destructive",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Network Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Rede</CardTitle>
          {network.online ? (
            <Wifi className="h-4 w-4 text-muted-foreground" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", qualityColor[network.quality])} />
            <span className="text-2xl font-bold capitalize">{network.quality}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {network.effectiveType?.toUpperCase() || "N/A"} • {network.downlink || "?"} Mbps
          </p>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Memória</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {metrics.memory.usage > 0 ? `${metrics.memory.usage.toFixed(0)}%` : "N/A"}
            </span>
            <Badge 
              variant={metrics.memory.recommendation === "normal" ? "default" : "destructive"}
              className="text-xs"
            >
              {metrics.memory.recommendation}
            </Badge>
          </div>
          {metrics.memory.usage > 0 && (
            <Progress 
              value={metrics.memory.usage} 
              className="mt-2 h-1"
            />
          )}
        </CardContent>
      </Card>

      {/* Cache Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cache</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold">{metrics.cache.cached}</span>
              <p className="text-xs text-muted-foreground">itens em cache</p>
            </div>
            <div>
              <span className="text-2xl font-bold">{metrics.cache.pending}</span>
              <p className="text-xs text-muted-foreground">pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Timing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Timing</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">FCP</span>
              <span>{metrics.timing.fcp ? `${metrics.timing.fcp.toFixed(0)}ms` : "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">LCP</span>
              <span>{metrics.timing.lcp ? `${metrics.timing.lcp.toFixed(0)}ms` : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cache
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceDashboard;
