/**
 * Dashboard Page
 * PATCH 621: Optimized with lazy loading and performance monitoring
 */
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { ComprehensiveExecutiveDashboardOptimized } from "@/components/dashboard/comprehensive-executive-dashboard-optimized";
import { performanceMonitor } from "@/lib/utils/performance-monitor";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Loading fallback
const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  React.useEffect(() => {
    console.log("🎯 Dashboard: Starting load...");
    performanceMonitor.start("dashboard:page-load");
    
    return () => {
      performanceMonitor.end("dashboard:page-load");
      console.log("✅ Dashboard: Load complete");
    };
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <ComprehensiveExecutiveDashboardOptimized />
      </Suspense>
    </ErrorBoundary>
  );
}
