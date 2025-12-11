import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/unified/Skeletons.unified";

const FinancialChart = lazy(() => import("@/components/dashboard/charts/FinancialChart"));

interface FinancialTabProps {
  data: ReadonlyArray<{
    month: string;
    revenue: number;
    target: number;
  }>;
}

export const FinancialTab = React.memo<FinancialTabProps>(({ data }) => {
  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle>Análise Financeira</CardTitle>
        <CardDescription>Detalhamento de receitas e custos operacionais</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <FinancialChart data={data} />
        </Suspense>
      </CardContent>
    </Card>
  );
});

FinancialTab.displayName = "FinancialTab";
