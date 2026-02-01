/**
 * Operations Command Hub
 * Unified hub for: Maritime, Fleet, Voyage, Mission, Logistics
 * 
 * FUSION GROUP A - PROMPT MASTER V4.1
 * 
 * Consolidates 15 modules into 1 hub with tabs:
 * - Maritime Command (+ Bridge Link)
 * - Fleet Command Center (+ Drydock, Histórico, Digital Twin)
 * - Voyage Command (+ Route Optimization)
 * - Mission Command
 * - Logistics Command
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Anchor, 
  Ship, 
  Map, 
  Target, 
  Package,
  Compass,
  Settings,
  Loader2
} from "lucide-react";

// Lazy load original components (preserving all functionality)
const MaritimeCommandCenter = lazy(() => import("@/pages/MaritimeCommandCenter"));
const FleetCommandCenter = lazy(() => import("@/pages/FleetCommandCenter"));
const VoyageCommandCenter = lazy(() => import("@/pages/VoyageCommandCenter"));
const MissionCommandCenter = lazy(() => import("@/pages/MissionCommandCenter"));
const LogisticsCommandPage = lazy(() => import("@/pages/LogisticsCommandPage"));

// Loading skeleton for tabs
function TabLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando módulo...</span>
      </div>
    </div>
  );
}

// Tab configuration
const TABS = [
  {
    id: "maritime",
    label: "Maritime",
    icon: Anchor,
    emoji: "⚓",
    description: "Tripulação, certificações, checklists",
    badge: null,
  },
  {
    id: "fleet",
    label: "Fleet",
    icon: Ship,
    emoji: "🚢",
    description: "Embarcações, missões, manutenção",
    badge: null,
  },
  {
    id: "voyage",
    label: "Voyage",
    icon: Map,
    emoji: "🗺️",
    description: "Planejamento de viagens, rotas",
    badge: "AI",
  },
  {
    id: "mission",
    label: "Mission",
    icon: Target,
    emoji: "🎯",
    description: "Controle de missões, logs",
    badge: null,
  },
  {
    id: "logistics",
    label: "Logistics",
    icon: Package,
    emoji: "📦",
    description: "Cargas, fornecedores, portos",
    badge: "NEW",
  },
];

export default function OperationsCommandHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "maritime";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync URL with tab changes
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Handle URL changes (e.g., from redirects)
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && TABS.some(t => t.id === urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="h-8 w-8 text-primary" />
            Operations Command
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro unificado de operações marítimas
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          5 módulos consolidados
        </Badge>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.emoji}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground hidden lg:block">
                {tab.description}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Maritime Command Tab */}
        <TabsContent value="maritime" className="space-y-4 mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <MaritimeCommandCenter />
          </Suspense>
        </TabsContent>

        {/* Fleet Command Tab */}
        <TabsContent value="fleet" className="space-y-4 mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <FleetCommandCenter />
          </Suspense>
        </TabsContent>

        {/* Voyage Command Tab */}
        <TabsContent value="voyage" className="space-y-4 mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <VoyageCommandCenter />
          </Suspense>
        </TabsContent>

        {/* Mission Command Tab */}
        <TabsContent value="mission" className="space-y-4 mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <MissionCommandCenter />
          </Suspense>
        </TabsContent>

        {/* Logistics Command Tab */}
        <TabsContent value="logistics" className="space-y-4 mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <LogisticsCommandPage />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
