import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";

// Import from consolidated module
const DPOverview = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPOverview"));
const DPRealtime = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPRealtime"));
const DPAIAnalyzer = React.lazy(() => import("@/modules/intelligence/dp-intelligence/components/DPAIAnalyzer"));

export default function DPIntelligence() {
  return (
    <Suspense fallback={<Loading fullScreen message="Carregando DP Intelligence Center..." />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
          DP Intelligence Center
        </h1>
        <DPAIAnalyzer />
        <DPOverview />
        <DPRealtime />
      </main>
    </Suspense>
  );
}
