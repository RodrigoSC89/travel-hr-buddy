/**
 * Comms & Alerts Hub
 * Unified hub for communication and alerts
 * 
 * FUSION GROUP I - PROMPT MASTER V4.1
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bell,
  Briefcase,
  Radio,
  Loader2
} from "lucide-react";

const CommunicationCommand = lazy(() => import("@/pages/CommunicationCommandCenter"));
const AlertsCommand = lazy(() => import("@/pages/AlertsCommandPage"));
const RealTimeWorkspace = lazy(() => import("@/modules/workspace/real-time-workspace/RealTimeWorkspaceProfessional"));
const MaritimeConnectivity = lazy(() => import("@/pages/MaritimeConnectivityPage"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando...</span>
    </div>
  );
}

const TABS = [
  { id: "comms", label: "Comunicação", icon: MessageSquare },
  { id: "alerts", label: "Alertas", icon: Bell },
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "connectivity", label: "Conectividade", icon: Radio },
];

export default function CommsAlertsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "comms";
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
            <Bell className="h-8 w-8 text-primary" />
            Comms & Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Comunicação e alertas em tempo real
          </p>
        </div>
        <Badge variant="outline">4 módulos</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-3">
              <tab.icon className="h-4 w-4" />
              <span className="text-sm">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="comms" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <CommunicationCommand />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <AlertsCommand />
          </Suspense>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <RealTimeWorkspace />
          </Suspense>
        </TabsContent>

        <TabsContent value="connectivity" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <MaritimeConnectivity />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
