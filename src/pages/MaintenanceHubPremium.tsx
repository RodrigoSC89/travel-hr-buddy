/**
 * Maintenance Hub Premium - Centro de Manutenção Completo
 * Integra todos os componentes de manutenção com IA preditiva
 * ENTERPRISE UPGRADE - Phase 2
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Wrench, Brain, Calendar, 
  ClipboardList, BarChart3, Package, Activity, AlertTriangle, Fuel, Leaf, Anchor
} from "lucide-react";

// Lazy load original components
const PredictiveMaintenanceAI = lazy(() => import("@/modules/maintenance-planner/components/PredictiveMaintenanceAI"));
const MaintenanceIntelligence = lazy(() => import("@/components/premium/MaintenanceIntelligence"));
const DrydockMaintenanceIntelligence = lazy(() => import("@/components/premium/DrydockMaintenanceIntelligence"));

// Enterprise Components - Phase 2
import { 
  MaintenanceCalendarView,
  DrydockPlanningTimeline,
  FuelConsumptionDashboard,
  WasteManagementMARPOL,
  ESGEmissionsDashboard
} from "@/components/enterprise";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function MaintenanceHubPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "intelligence";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-500" />
            Maintenance Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de manutenção com IA preditiva e PMS integrado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            94% Health Score
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Brain className="h-3 w-3 mr-1" />
            IA Preditiva
          </Badge>
          <Badge variant="outline" className="text-sm">
            Enterprise
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">DNV Class</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex flex-col items-center gap-1 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="drydock" className="flex flex-col items-center gap-1 py-2">
            <Anchor className="h-4 w-4" />
            <span className="text-xs">Drydock</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex flex-col items-center gap-1 py-2">
            <Fuel className="h-4 w-4" />
            <span className="text-xs">Combustível</span>
          </TabsTrigger>
          <TabsTrigger value="waste" className="flex flex-col items-center gap-1 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">MARPOL</span>
          </TabsTrigger>
          <TabsTrigger value="esg" className="flex flex-col items-center gap-1 py-2">
            <Leaf className="h-4 w-4" />
            <span className="text-xs">ESG</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Ordens</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex flex-col items-center gap-1 py-2">
            <Package className="h-4 w-4" />
            <span className="text-xs">Peças</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence">
          <Suspense fallback={<LoadingSkeleton />}>
            <DrydockMaintenanceIntelligence />
          </Suspense>
        </TabsContent>

        <TabsContent value="predictive">
          <Suspense fallback={<LoadingSkeleton />}>
            <PredictiveMaintenanceAI />
          </Suspense>
        </TabsContent>

        {/* Enterprise Components - Phase 2 */}
        <TabsContent value="calendar">
          <MaintenanceCalendarView />
        </TabsContent>

        <TabsContent value="drydock">
          <DrydockPlanningTimeline />
        </TabsContent>

        <TabsContent value="fuel">
          <FuelConsumptionDashboard />
        </TabsContent>

        <TabsContent value="waste">
          <WasteManagementMARPOL />
        </TabsContent>

        <TabsContent value="esg">
          <ESGEmissionsDashboard />
        </TabsContent>

        <TabsContent value="orders">
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Ordens de Serviço</p>
            <p className="text-sm">Gestão de work orders e requisições</p>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Inventário de Peças</p>
            <p className="text-sm">Estoque e requisições de materiais</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingSkeleton />}>
            <MaintenanceIntelligence />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
