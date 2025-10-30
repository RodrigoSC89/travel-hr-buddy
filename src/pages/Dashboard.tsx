import React, { Suspense } from "react";
import { ComprehensiveExecutiveDashboard } from "@/components/dashboard/comprehensive-executive-dashboard-optimized";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { PageSkeleton } from "@/components/LoadingStates";

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <ComprehensiveExecutiveDashboard />
      </Suspense>
    </ErrorBoundary>
  );
}
