import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { LineChart, Ship } from "lucide-react";

const RevenueChart = lazy(() => import("@/components/dashboard/charts/RevenueChart"));
const FleetChart = lazy(() => import("@/components/dashboard/charts/FleetChart"));

interface OverviewChartsProps {
  revenueData: ReadonlyArray<{
    month: string;
    revenue: number;
    target: number;
  }>;
  fleetData: ReadonlyArray<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const OverviewCharts = React.memo<OverviewChartsProps>(({ revenueData, fleetData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart - Lazy Loaded */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Evolução de Receita
          </CardTitle>
          <CardDescription>Receita mensal vs meta estabelecida</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <RevenueChart data={revenueData} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Fleet Distribution - Lazy Loaded */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Status da Frota
          </CardTitle>
          <CardDescription>Distribuição atual das embarcações</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <FleetChart data={fleetData} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
});

OverviewCharts.displayName = "OverviewCharts";
