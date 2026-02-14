/**
 * Admin BI Dashboard
 * Uses the professional analytics dashboard
 */
import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ProfessionalAnalyticsDashboard = lazy(() => import("@/components/dashboard/professional-analytics-dashboard").then(m => ({ default: m.ProfessionalAnalyticsDashboard })));

export default function AdminBI() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6"><Skeleton className="h-96" /></div>}>
      <ProfessionalAnalyticsDashboard />
    </Suspense>
  );
}
