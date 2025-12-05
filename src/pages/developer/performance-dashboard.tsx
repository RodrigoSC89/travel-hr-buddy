/**
 * Performance Dashboard for Developers
 * Comprehensive view of system performance metrics
 */

import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalHeader } from "@/components/dashboard/professional-header";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Cpu, 
  HardDrive, 
  Gauge,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database
} from "lucide-react";
import { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
import { getPerformanceReport } from "@/lib/performance/init";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "good" | "warning" | "critical";
  description?: string;
}

const MetricCard = ({ title, value, unit, icon: Icon, status = "good", description }: MetricCardProps) => {
  const statusColors = {
    good: "text-green-500 bg-green-500/10",
    warning: "text-yellow-500 bg-yellow-500/10",
    critical: "text-red-500 bg-red-500/10",
  };

  return (
    <Card className="border-primary/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", statusColors[status])}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant={status === "good" ? "default" : status === "warning" ? "secondary" : "destructive"}>
            {status === "good" ? "OK" : status === "warning" ? "Atenção" : "Crítico"}
          </Badge>
        </div>
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceDashboard = () => {
  const bandwidth = useBandwidthOptimizer();
  const [perfReport, setPerfReport] = useState<ReturnType<typeof getPerformanceReport> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPerfReport(getPerformanceReport());
  }, [refreshKey]);

  const memoryUsage = useMemo(() => {
    if ((performance as any).memory) {
      const used = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      const total = (performance as any).memory.jsHeapSizeLimit / 1024 / 1024;
      return { used: Math.round(used), total: Math.round(total), percent: Math.round((used / total) * 100) };
    }
    return { used: 0, total: 0, percent: 0 };
  }, [refreshKey]);

  const connectionStatus = useMemo(() => {
    const type = bandwidth.connectionType;
    if (type === "4g") return { label: "4G/Wi-Fi", status: "good" as const };
    if (type === "3g") return { label: "3G", status: "warning" as const };
    if (type === "2g" || type === "slow-2g") return { label: type.toUpperCase(), status: "critical" as const };
    return { label: "Offline", status: "critical" as const };
  }, [bandwidth.connectionType]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>Performance Dashboard | Nautilus One</title>
      </Helmet>

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <ProfessionalHeader
            title="Performance Dashboard"
            subtitle="Métricas de performance para desenvolvedores"
            showLogo={false}
          />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Conexão"
            value={connectionStatus.label}
            icon={bandwidth.connectionType === "offline" ? WifiOff : Wifi}
            status={connectionStatus.status}
            description={bandwidth.isLowBandwidth ? "Modo otimizado ativo" : "Conexão estável"}
          />
          <MetricCard
            title="Memória"
            value={memoryUsage.used}
            unit="MB"
            icon={HardDrive}
            status={memoryUsage.percent > 80 ? "critical" : memoryUsage.percent > 60 ? "warning" : "good"}
            description={`${memoryUsage.percent}% utilizado`}
          />
          <MetricCard
            title="Tempo de Carga"
            value={perfReport?.loadTime.toFixed(0) || "—"}
            unit="ms"
            icon={Clock}
            status={(perfReport?.loadTime || 0) > 3000 ? "critical" : (perfReport?.loadTime || 0) > 1500 ? "warning" : "good"}
          />
          <MetricCard
            title="Qualidade Imagem"
            value={bandwidth.imageQuality}
            unit="%"
            icon={Gauge}
            status={bandwidth.imageQuality < 50 ? "warning" : "good"}
            description="Compressão adaptativa"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Init</span>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bandwidth Optimizer</span>
                    <Badge variant={bandwidth.isLowBandwidth ? "secondary" : "default"}>
                      {bandwidth.isLowBandwidth ? "Modo Leve" : "Normal"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animações</span>
                    <Badge variant={bandwidth.shouldAnimate ? "default" : "secondary"}>
                      {bandwidth.shouldAnimate ? "Ativas" : "Desativadas"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prefetch</span>
                    <Badge variant={bandwidth.shouldPrefetch ? "default" : "secondary"}>
                      {bandwidth.shouldPrefetch ? "Ativo" : "Desativado"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Cache Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Worker</span>
                    <Badge variant={"serviceWorker" in navigator ? "default" : "secondary"}>
                      {"serviceWorker" in navigator ? "Registrado" : "Não Disponível"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Batch Size</span>
                    <span className="text-sm font-mono">{bandwidth.batchSize} requisições</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timeout</span>
                    <span className="text-sm font-mono">{(bandwidth.timeout / 1000).toFixed(0)}s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Milestones de Carregamento</CardTitle>
                <CardDescription>Tempo de cada fase do carregamento</CardDescription>
              </CardHeader>
              <CardContent>
                {perfReport?.milestones && Object.keys(perfReport.milestones).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(perfReport.milestones).map(([name, time]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-mono">{name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, (time / 3000) * 100)} className="w-32 h-2" />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {time.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum milestone registrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bandwidth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações de Bandwidth</CardTitle>
                <CardDescription>Otimizações ativas baseadas na conexão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Tipo de Conexão</span>
                      <Badge>{bandwidth.connectionType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Qualidade de Imagem</span>
                      <span className="text-sm font-mono">{bandwidth.imageQuality}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tamanho do Batch</span>
                      <span className="text-sm font-mono">{bandwidth.batchSize}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Timeout</span>
                      <span className="text-sm font-mono">{bandwidth.timeout}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Carregar Imagens</span>
                      <Badge variant={bandwidth.shouldLoadImages ? "default" : "secondary"}>
                        {bandwidth.shouldLoadImages ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prefetch</span>
                      <Badge variant={bandwidth.shouldPrefetch ? "default" : "secondary"}>
                        {bandwidth.shouldPrefetch ? "Ativo" : "Desativado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Recomendações de Otimização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bandwidth.isLowBandwidth && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Conexão Lenta Detectada</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          O sistema está operando em modo otimizado. Algumas funcionalidades visuais foram simplificadas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Lazy Loading Ativo</p>
                      <p className="text-xs text-muted-foreground">
                        Componentes são carregados sob demanda para reduzir o bundle inicial.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Cache Inteligente</p>
                      <p className="text-xs text-muted-foreground">
                        Service Worker caching para recursos estáticos e APIs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Compressão de Imagens</p>
                      <p className="text-xs text-muted-foreground">
                        Imagens são comprimidas dinamicamente baseado na qualidade da conexão.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Code Splitting</p>
                      <p className="text-xs text-muted-foreground">
                        Módulos são divididos em chunks menores para carregamento mais rápido.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PerformanceDashboard;
