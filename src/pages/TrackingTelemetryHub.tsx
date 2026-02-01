/**
 * Tracking & Telemetry Hub
 * Unified hub for monitoring modules
 * 
 * FUSION GROUP G - PROMPT MASTER V4.1
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Satellite, 
  Activity,
  Radio,
  AlertTriangle,
  History,
  Loader2
} from "lucide-react";

const Telemetria360 = lazy(() => import("@/pages/Telemetria360"));
const PredictiveTelemetry = lazy(() => import("@/pages/PredictiveTelemetry"));
const DGNSSTracking = lazy(() => import("@/pages/DGNSSTracking"));
const TrackingAlerts = lazy(() => import("@/pages/tracking/TrackingAlerts"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando telemetria...</span>
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Visão Geral", icon: Satellite },
  { id: "realtime", label: "Tempo Real", icon: Activity },
  { id: "predictive", label: "Preditiva", icon: Radio },
  { id: "alerts", label: "Alertas", icon: AlertTriangle },
  { id: "history", label: "Histórico", icon: History },
];

export default function TrackingTelemetryHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="h-8 w-8 text-primary" />
            Tracking & Telemetry
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento e rastreamento em tempo real
          </p>
        </div>
        <Badge variant="outline">5 módulos</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <Telemetria360 />
          </Suspense>
        </TabsContent>

        <TabsContent value="realtime" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <DGNSSTracking />
          </Suspense>
        </TabsContent>

        <TabsContent value="predictive" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <PredictiveTelemetry />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <TrackingAlerts />
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <Telemetria360 />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
