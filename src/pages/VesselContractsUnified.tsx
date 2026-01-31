/**
 * VesselContractsUnified - Wrapper para V1/V2
 * Usa feature flag 'use-v2-modules' para alternar automaticamente
 * 
 * @deprecated V1 será removido em v4.0.0
 */

import { lazy, Suspense } from "react";
import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load both versions
const VesselContractsV1 = lazy(() => import("./VesselContracts"));
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
  // ALWAYS use V2 with AI features - V1 is deprecated
  const useV2 = true; // Force V2 - useFeatureFlag('use-v2-modules');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <VesselContractsV2 />
    </Suspense>
  );
}

// Export for type inference
export type { default as VesselContractsUnifiedType } from "./VesselContractsUnified";
