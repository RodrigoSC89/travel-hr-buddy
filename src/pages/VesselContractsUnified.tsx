/**
 * VesselContractsUnified - Unified Vessel Contracts Module
 * V2 only - V1 deprecated and removed
 * @since v4.0.0
 */

import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// V2 only - V1 removed in v4.0.0
const VesselContractsV2 = lazy(() => import("./VesselContractsV2"));

function LoadingFallback() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function VesselContractsUnified() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VesselContractsV2 />
    </Suspense>
  );
}
