/**
 * Maintenance Hub Premium - Centro de Manutenção Completo
 * Tier-1 UX: Real badges, functional inventory, zero placeholders
 * ENTERPRISE UPGRADE - Phase 2 + MEGA-UPGRADE
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Wrench, Brain, Calendar, 
  ClipboardList, BarChart3, Package, Activity, AlertTriangle, Fuel, Leaf, Anchor, Gauge,
  RefreshCw, Download
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

// Lazy load original components
const PredictiveMaintenanceAI = lazy(() => import("@/modules/maintenance-planner/components/PredictiveMaintenanceAI"));
const MaintenanceIntelligence = lazy(() => import("@/components/premium/MaintenanceIntelligence"));
const DrydockMaintenanceIntelligence = lazy(() => import("@/components/premium/DrydockMaintenanceIntelligence"));

// FASE 2 - Premium Components
const MaintenanceKPIDashboard = lazy(() => import("@/components/premium/maintenance/MaintenanceKPIDashboard"));
const PMSHourMeterAlerts = lazy(() => import("@/components/premium/maintenance/PMSHourMeterAlerts"));
const FuelROBAnalytics = lazy(() => import("@/components/premium/maintenance/FuelROBAnalytics"));

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
          <Skeleton key={`maint-hub-skeleton-${i}`} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// Spare Parts Inventory Tab with real data
function SparePartsInventoryTab() {
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["maintenance-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("id, name, category, quantity, unit, min_quantity, location, status")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (inventory.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Inventário vazio"
        message="Cadastre peças e materiais para controle de estoque. O sistema alertará sobre itens abaixo do mínimo."
        actionLabel="Ir para Procurement"
        onAction={() => { window.history.pushState({}, '', '/ops?tab=procurement'); window.dispatchEvent(new PopStateEvent('popstate')); toast.success("Navegando para Procurement"); }}
      />
    );
  }

  const lowStock = inventory.filter((i) => (i.quantity ?? 0) <= (i.min_quantity || 0));
  const totalItems = inventory.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventário de Peças
        </h3>
        <div className="flex gap-2">
          {lowStock.length > 0 && (
            <Badge variant="destructive">{lowStock.length} abaixo do mínimo</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => {
            const csv = ["Nome,Categoria,Quantidade,Unidade,Mínimo,Local,Status", ...inventory.map((i) =>
              `"${i.name}",${i.category || 'N/A'},${i.quantity},${i.unit || 'un'},${i.min_quantity || 0},${i.location || 'N/A'},${i.status || 'active'}`
            )].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'inventory-report.csv'; a.click();
            URL.revokeObjectURL(url);
            toast.success("Inventário exportado");
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Itens</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Estoque Baixo</p>
            <p className="text-2xl font-bold text-destructive">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <p className="text-2xl font-bold">
              {new Set(inventory.map((i) => i.category)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do Inventário</CardTitle>
          <CardDescription>{totalItems} itens cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inventory.slice(0, 15).map((item) => {
              const isLow = (item.quantity ?? 0) <= (item.min_quantity || 0);
              return (
                <div key={item.id} className={`flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors ${isLow ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <Package className={`h-4 w-4 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category || 'Sem categoria'} • {item.location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isLow ? 'text-destructive' : ''}`}>
                      {item.quantity} {item.unit || 'un'}
                    </span>
                    {isLow && <Badge variant="destructive" className="text-xs">Baixo</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MaintenanceHubPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "kpis";
  const queryClient = useQueryClient();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Real maintenance metrics for badge
  const { data: maintStats } = useQuery({
    queryKey: ["maintenance-stats-badge"],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("maintenance_records")
        .select("id, status");
      if (error) throw error;
      const total = records?.length || 0;
      const completed = records?.filter((r) => r.status === 'completed').length || 0;
      const healthScore = total > 0 ? Math.round((completed / total) * 100) : 100;
      return { total, completed, healthScore };
    },
    staleTime: 30000,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            Maintenance Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de manutenção com IA preditiva, PMS e MTBF/MTTR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            {maintStats ? `${maintStats.healthScore}%` : '...'} Health
          </Badge>
          <Badge variant="outline" className="text-primary">
            <Brain className="h-3 w-3 mr-1" />
            IA Preditiva
          </Badge>
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["maintenance"] });
            toast.success("Dados de manutenção atualizados");
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 h-auto p-1">
          <TabsTrigger value="kpis" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">KPIs</span>
          </TabsTrigger>
          <TabsTrigger value="pms" className="flex flex-col items-center gap-1 py-2">
            <Gauge className="h-4 w-4" />
            <span className="text-xs">PMS</span>
          </TabsTrigger>
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
          <TabsTrigger value="fuel-rob" className="flex flex-col items-center gap-1 py-2">
            <Fuel className="h-4 w-4" />
            <span className="text-xs">ROB</span>
          </TabsTrigger>
          <TabsTrigger value="waste" className="flex flex-col items-center gap-1 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">MARPOL</span>
          </TabsTrigger>
          <TabsTrigger value="esg" className="flex flex-col items-center gap-1 py-2">
            <Leaf className="h-4 w-4" />
            <span className="text-xs">ESG</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex flex-col items-center gap-1 py-2">
            <Package className="h-4 w-4" />
            <span className="text-xs">Peças</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis">
          <Suspense fallback={<LoadingSkeleton />}>
            <MaintenanceKPIDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="pms">
          <Suspense fallback={<LoadingSkeleton />}>
            <PMSHourMeterAlerts />
          </Suspense>
        </TabsContent>

        <TabsContent value="fuel-rob">
          <Suspense fallback={<LoadingSkeleton />}>
            <FuelROBAnalytics />
          </Suspense>
        </TabsContent>

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

        <TabsContent value="inventory">
          <SparePartsInventoryTab />
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
