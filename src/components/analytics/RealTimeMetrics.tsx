/**
 * Real-Time Metrics Dashboard - PATCH 837
 * Live analytics and performance metrics
 */

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  Server,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePresence } from "@/lib/collaboration/realtime-presence";
import { useNetworkStatus } from "@/lib/performance/network-monitor";
import { useWebVitals } from "@/lib/performance/web-vitals-monitor";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color?: string;
  subtext?: string;
}

function MetricCard({ title, value, change, icon: Icon, color = "primary", subtext }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    green: "text-green-500 bg-green-500/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
    red: "text-red-500 bg-red-500/10",
    blue: "text-blue-500 bg-blue-500/10",
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {change >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={cn(
              "text-xs font-medium",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? "+" : ""}{change}%
            </span>
            <span className="text-xs text-muted-foreground">vs ontem</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PerformanceGaugeProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  thresholds?: { good: number; warning: number };
}

function PerformanceGauge({ label, value, max, unit = "ms", thresholds }: PerformanceGaugeProps) {
  const percent = Math.min((value / max) * 100, 100);
  
  let color = "bg-green-500";
  if (thresholds) {
    if (value > thresholds.warning) color = "bg-red-500";
    else if (value > thresholds.good) color = "bg-yellow-500";
  }
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(0)}{unit}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function RealTimeMetrics() {
  const { users } = usePresence();
  const networkStatus = useNetworkStatus();
  const webVitals = useWebVitals();
  
  // Extract metrics from webVitals
  const getMetricValue = (name: string): number => {
    const metric = webVitals.metrics.find(m => m.name === name);
    return metric?.value || 0;
  };
  
  const lcp = getMetricValue("LCP");
  const fid = getMetricValue("FID");
  const cls = getMetricValue("CLS");
  const ttfb = getMetricValue("TTFB");
  
  const [sessionDuration, setSessionDuration] = useState(0);
  const [pageViews, setPageViews] = useState(1);
  
  // Track session duration
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Track page views
  useEffect(() => {
    const handleNavigation = () => setPageViews(p => p + 1);
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const getNetworkColor = () => {
    switch (networkStatus.quality) {
    case "excellent": return "green";
    case "good": return "blue";
    case "fair": return "yellow";
    case "poor": return "red";
    default: return "primary";
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Usuários Online"
          value={users.length + 1}
          icon={Users}
          color="green"
          change={12}
        />
        <MetricCard
          title="Tempo de Sessão"
          value={formatDuration(sessionDuration)}
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Páginas Visitadas"
          value={pageViews}
          icon={Globe}
          color="primary"
        />
        <MetricCard
          title="Qualidade de Rede"
          value={networkStatus.quality}
          icon={Wifi}
          color={getNetworkColor()}
          subtext={`${networkStatus.downlink.toFixed(1)} Mbps`}
        />
      </div>
      
      {/* Web Vitals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PerformanceGauge
            label="LCP (Largest Contentful Paint)"
            value={lcp}
            max={4000}
            thresholds={{ good: 2500, warning: 4000 }}
          />
          <PerformanceGauge
            label="FID (First Input Delay)"
            value={fid}
            max={300}
            thresholds={{ good: 100, warning: 300 }}
          />
          <PerformanceGauge
            label="CLS (Cumulative Layout Shift)"
            value={cls * 1000}
            max={250}
            unit=""
            thresholds={{ good: 100, warning: 250 }}
          />
          <PerformanceGauge
            label="TTFB (Time to First Byte)"
            value={ttfb}
            max={1800}
            thresholds={{ good: 800, warning: 1800 }}
          />
        </CardContent>
      </Card>
      
      {/* System Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">RTT (Latência)</p>
              <p className="text-lg font-semibold">{networkStatus.rtt}ms</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tipo de Conexão</p>
              <p className="text-lg font-semibold uppercase">{networkStatus.effectiveType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Economia de Dados</p>
              <p className="text-lg font-semibold">{networkStatus.saveData ? "Ativo" : "Inativo"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  networkStatus.online ? "bg-green-500" : "bg-red-500"
                )} />
                <p className="text-lg font-semibold">
                  {networkStatus.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RealTimeMetrics;
