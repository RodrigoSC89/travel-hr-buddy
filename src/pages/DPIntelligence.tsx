import React, { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, Shield, BarChart3, Anchor } from "lucide-react";

const DPAIAnalyzer = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPAIAnalyzer"));
const DPOverview = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPOverview"));
const DPRealtime = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPRealtime"));
const DPHistory = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPHistory"));
const DPAlerts = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPAlerts"));

export default function DPIntelligence() {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="DP Intelligence Center"
        description="Centro de inteligência artificial para sistemas de posicionamento dinâmico"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Integrada" },
          { icon: Activity, label: "Tempo Real" },
          { icon: Shield, label: "DP Class 2" },
        ]}
      />

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA Analyzer
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Telemetria
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading fullScreen={false} message="Carregando..." />}>
          <TabsContent value="ai">
            <DPAIAnalyzer />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <DPOverview />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <DPRealtime />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <DPHistory />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <DPAlerts />
          </TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
}
