/**
 * Maintenance Hub Premium - Centro de Manutenção Completo
 * Integra todos os componentes de manutenção com IA preditiva
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Wrench, Brain, Calendar, 
  ClipboardList, BarChart3, Package, Activity, AlertTriangle
} from "lucide-react";

// Lazy load components
const PredictiveMaintenanceAI = lazy(() => import("@/modules/maintenance-planner/components/PredictiveMaintenanceAI"));
const MaintenanceIntelligence = lazy(() => import("@/components/premium/MaintenanceIntelligence"));
const DrydockMaintenanceIntelligence = lazy(() => import("@/components/premium/DrydockMaintenanceIntelligence"));

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
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
            <Brain className="h-3 w-3 mr-1" />
            IA Preditiva
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 h-auto p-1">
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">DNV Class</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Ordens</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex flex-col items-center gap-1 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex flex-col items-center gap-1 py-2">
            <Package className="h-4 w-4" />
            <span className="text-xs">Peças</span>
          </TabsTrigger>
          <TabsTrigger value="drydock" className="flex flex-col items-center gap-1 py-2">
            <Wrench className="h-4 w-4" />
            <span className="text-xs">Drydock</span>
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

        <TabsContent value="orders">
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Ordens de Serviço</p>
            <p className="text-sm">Gestão de work orders e requisições</p>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Calendário de Manutenção</p>
            <p className="text-sm">Planejamento e dry-docking</p>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Inventário de Peças</p>
            <p className="text-sm">Estoque e requisições de materiais</p>
          </div>
        </TabsContent>

        <TabsContent value="drydock">
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Drydock Management</p>
            <p className="text-sm">Planejamento de docagem e overhauls</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Analytics de Manutenção</p>
            <p className="text-sm">KPIs, tendências e relatórios</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
