import React, { useMemo, useState, useCallback } from "react";
import { ProfessionalHeader } from "@/components/dashboard/professional-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";

// PATCH 584: Split Index into optimized subcomponents
import { KPIGrid } from "@/components/dashboard/index/KPIGrid";
import { OverviewCharts } from "@/components/dashboard/index/OverviewCharts";
import { QuickStats } from "@/components/dashboard/index/QuickStats";
import { FinancialTab } from "@/components/dashboard/index/FinancialTab";
import { OperationsTab } from "@/components/dashboard/index/OperationsTab";

// PATCH 584: Memoized data constants for better performance
const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, target: 40000 },
  { month: "Fev", revenue: 48000, target: 45000 },
  { month: "Mar", revenue: 52000, target: 50000 },
  { month: "Abr", revenue: 58000, target: 55000 },
  { month: "Mai", revenue: 65000, target: 60000 },
  { month: "Jun", revenue: 72000, target: 70000 },
] as const;

const FLEET_DATA = [
  { name: "Operacional", value: 20, color: "#10b981" },
  { name: "Manutenção", value: 3, color: "#f59e0b" },
  { name: "Standby", value: 1, color: "#3b82f6" },
] as const;

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // PATCH 624 - Preview Safe Mode
  const { isValidated, validationPassed, shouldShowData } = usePreviewSafeMode({
    componentName: "Index",
    enableValidation: true,
    maxRenderTime: 2000,
    silenceErrors: true
  });

  // PATCH 584: Memoize callback to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <ProfessionalHeader
          title="Dashboard Executivo"
          subtitle="Visão estratégica e métricas em tempo real - Sistema Nautilus One"
          showLogo={true}
          showRealTime={true}
        />
        <Link to="/qa/preview">
          <Button variant="outline" size="sm" className="gap-2">
            <Shield className="h-4 w-4" />
            QA Dashboard
          </Button>
        </Link>
      </div>

      {/* PATCH 584: KPIs Grid extracted to memoized component */}
      <KPIGrid />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-primary/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Operações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* PATCH 584: Charts extracted to memoized component */}
          <OverviewCharts revenueData={REVENUE_DATA} fleetData={FLEET_DATA} />
          
          {/* PATCH 584: Quick Stats extracted to memoized component */}
          <QuickStats />
        </TabsContent>

        <TabsContent value="financial">
          {/* PATCH 584: Financial tab extracted to memoized component */}
          <FinancialTab data={REVENUE_DATA} />
        </TabsContent>

        <TabsContent value="operations">
          {/* PATCH 584: Operations tab extracted to memoized component */}
          <OperationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;