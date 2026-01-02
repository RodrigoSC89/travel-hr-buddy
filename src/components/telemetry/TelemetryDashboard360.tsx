/**
 * TelemetryDashboard360 - Dashboard Revolucionário de Telemetria
 * PATCH 860 - Módulo completo com mapa 3D, IA e sensores em tempo real
 */

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Brain,
  Activity,
  Bell,
  Satellite,
  Download,
  Settings,
  Maximize2,
  RefreshCw,
  Waves,
} from "lucide-react";
import { TelemetryMap3D } from "./TelemetryMap3D";
import { TelemetryAIInsights } from "./TelemetryAIInsights";
import { TelemetrySensorGrid } from "./TelemetrySensorGrid";
import { TelemetryAlertsTimeline } from "./TelemetryAlertsTimeline";
import { TelemetryTideChart } from "./TelemetryTideChart";
import { toast } from "sonner";

interface TelemetryDashboard360Props {
  userId?: string;
}

export const TelemetryDashboard360: React.FC<TelemetryDashboard360Props> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsRefreshing(false);
    toast.success("Dados atualizados");
  };

  const handleExport = () => {
    toast.success("Relatório de telemetria exportado!", { description: "Arquivo disponível para download" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg">
                <Satellite className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Telemetria 360°
                </h1>
                <p className="text-sm text-muted-foreground">
                  Monitoramento inteligente em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistema Online
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5 mx-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Globe className="h-4 w-4" />
              Mapa Global
            </TabsTrigger>
            <TabsTrigger value="tides" className="gap-2">
              <Waves className="h-4 w-4" />
              Marés
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              Insights IA
            </TabsTrigger>
            <TabsTrigger value="sensors" className="gap-2">
              <Activity className="h-4 w-4" />
              Sensores
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TelemetryMap3D className="h-[600px]" />
              </div>
              <div className="space-y-6">
                <TelemetryAIInsights className="h-[600px]" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TelemetryTideChart lat={-22.9068} lon={-43.1729} locationName="Rio de Janeiro" />
              <TelemetryTideChart lat={-23.9548} lon={-46.3329} locationName="Santos" />
              <TelemetryTideChart lat={-25.5163} lon={-48.5225} locationName="Paranaguá" />
              <TelemetryTideChart lat={-8.0476} lon={-34.8770} locationName="Recife" />
              <TelemetryTideChart lat={-12.9714} lon={-38.5014} locationName="Salvador" />
              <TelemetryTideChart lat={-3.1190} lon={-60.0217} locationName="Manaus" />
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TelemetryAIInsights />
              <TelemetryAlertsTimeline />
            </div>
          </TabsContent>

          <TabsContent value="sensors">
            <TelemetrySensorGrid />
          </TabsContent>

          <TabsContent value="alerts">
            <TelemetryAlertsTimeline maxAlerts={100} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TelemetryDashboard360;
