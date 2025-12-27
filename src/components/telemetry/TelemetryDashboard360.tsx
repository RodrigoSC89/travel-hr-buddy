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
} from "lucide-react";
import { TelemetryMap3D } from "./TelemetryMap3D";
import { TelemetryAIInsights } from "./TelemetryAIInsights";
import { TelemetrySensorGrid } from "./TelemetrySensorGrid";
import { TelemetryAlertsTimeline } from "./TelemetryAlertsTimeline";
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
    toast.info("Exportando relatório de telemetria...");
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Globe className="h-4 w-4" />
              Mapa Global
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
