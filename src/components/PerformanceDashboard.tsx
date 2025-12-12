// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, Zap, Clock, BarChart3, Wifi, HardDrive } from "lucide-react";
import { useWebVitals } from "@/hooks/useWebVitals";
import { getCacheSize } from "@/lib/service-worker-register";
import { staggerContainer, staggerItem } from "./PageTransition";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: "good" | "warning" | "poor";
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, unit, status, icon, description }: MetricCardProps) {
  const statusColors = {
    good: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    poor: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const statusLabels = {
    good: "Ótimo",
    warning: "Regular",
    poor: "Crítico"
  };

  return (
    <motion.div variants={staggerItem}>
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 opacity-5 ${status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PerformanceDashboard() {
  const { lcp, cls, inp, fcp, ttfb, score } = useWebVitals();
  const [cacheSize, setCacheSize] = useState(0);
  const [networkType, setNetworkType] = useState<string>("unknown");

  useEffect(() => {
    getCacheSize().then(setCacheSize);
    
    const connection = (navigator as any).connection;
    if (connection) {
      setNetworkType(connection.effectiveType || "unknown");
    }
  }, []);

  const getStatus = (rating: string): "good" | "warning" | "poor" => {
    if (rating === "good") return "good";
    if (rating === "needs-improvement") return "warning";
    return "poor";
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const scoreValue = score.score;
  const scoreRating = score.rating;

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={scoreValue >= 90 ? "text-green-500" : scoreValue >= 50 ? "text-yellow-500" : "text-red-500"}
                  initial={{ strokeDasharray: "0 251.2" }}
                  animate={{ strokeDasharray: `${(scoreValue / 100) * 251.2} 251.2` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{scoreValue}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                {scoreValue >= 90 ? "Excelente performance!" : scoreValue >= 50 ? "Performance aceitável, mas pode melhorar" : "Performance precisa de atenção"}
              </p>
              <Progress value={scoreValue} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <MetricCard
          title="LCP (Largest Contentful Paint)"
          value={lcp.value !== null ? (lcp.value / 1000).toFixed(2) : "—"}
          unit="s"
          status={getStatus(lcp.rating)}
          icon={<Zap className="h-4 w-4" />}
          description="Tempo até o maior elemento carregar"
        />
        <MetricCard
          title="INP (Interaction to Next Paint)"
          value={inp.value !== null ? Math.round(inp.value) : "—"}
          unit="ms"
          status={getStatus(inp.rating)}
          icon={<Clock className="h-4 w-4" />}
          description="Responsividade de interações"
        />
        <MetricCard
          title="CLS (Cumulative Layout Shift)"
          value={cls.value !== null ? cls.value.toFixed(3) : "—"}
          status={getStatus(cls.rating)}
          icon={<BarChart3 className="h-4 w-4" />}
          description="Estabilidade visual"
        />
        <MetricCard
          title="FCP (First Contentful Paint)"
          value={fcp.value !== null ? (fcp.value / 1000).toFixed(2) : "—"}
          unit="s"
          status={getStatus(fcp.rating)}
          icon={<Activity className="h-4 w-4" />}
          description="Primeiro conteúdo renderizado"
        />
        <MetricCard
          title="TTFB (Time to First Byte)"
          value={ttfb.value !== null ? Math.round(ttfb.value) : "—"}
          unit="ms"
          status={getStatus(ttfb.rating)}
          icon={<Wifi className="h-4 w-4" />}
          description="Tempo de resposta do servidor"
        />
        <MetricCard
          title="Cache Size"
          value={formatBytes(cacheSize)}
          status="good"
          icon={<HardDrive className="h-4 w-4" />}
          description={`Rede: ${networkType}`}
        />
      </motion.div>
    </div>
  );
}
