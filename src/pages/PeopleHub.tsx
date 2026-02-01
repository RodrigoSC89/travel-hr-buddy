/**
 * People Hub
 * Unified hub for HR & People modules
 * 
 * FUSION GROUP J - PROMPT MASTER V4.1
 * 
 * Consolidates RH & Pessoas + RH & IA modules
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Target, 
  TrendingUp,
  Heart,
  GraduationCap,
  Shield,
  BarChart3,
  Loader2
} from "lucide-react";

// Lazy load components
const NautilusPeopleDashboard = lazy(() => import("@/modules/nauti-people/NautilusPeopleDashboard"));
const HRDashboard = lazy(() => import("@/pages/hr/HRDashboard"));
const RecruitmentPage = lazy(() => import("@/pages/RecruitmentPage"));
const CrewWellnessPage = lazy(() => import("@/pages/CrewWellnessPage"));
const PeopleAnalytics = lazy(() => import("@/pages/PeopleAnalytics"));

function TabLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Carregando...</span>
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Visão Geral", icon: Users },
  { id: "talent", label: "Talent", icon: Target },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "wellness", label: "Bem-estar", icon: Heart },
  { id: "training", label: "Treinamento", icon: GraduationCap },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function PeopleHub() {
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
            <Users className="h-8 w-8 text-primary" />
            People Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão unificada de pessoas e RH
          </p>
        </div>
        <Badge variant="outline">10+ módulos</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <NautilusPeopleDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="talent" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <RecruitmentPage />
          </Suspense>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <HRDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="wellness" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <CrewWellnessPage />
          </Suspense>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <HRDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <HRDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Suspense fallback={<TabLoadingSkeleton />}>
            <PeopleAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
