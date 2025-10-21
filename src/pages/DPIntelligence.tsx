import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";

const DPOverview = safeLazyImport(
  () => import("@/components/dp-intelligence/DPOverview"),
  "DPOverview"
);
const DPRealtime = safeLazyImport(
  () => import("@/components/dp-intelligence/DPRealtime"),
  "DPRealtime"
);
const DPAIAnalyzer = safeLazyImport(
  () => import("@/components/dp-intelligence/DPAIAnalyzer"),
  "DPAIAnalyzer"
);
const DPAdvisorPanel = safeLazyImport(
  () => import("@/components/dp-intelligence/DPAdvisorPanel"),
  "DPAdvisorPanel"
);

export default function DPIntelligence() {
  return (
    <Suspense fallback={<Loading fullScreen message="Carregando DP Intelligence Center..." />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
          DP Intelligence Center
        </h1>
        <DPAIAnalyzer />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DPOverview />
          <DPAdvisorPanel />
        </div>
        <DPRealtime />
      </main>
    </Suspense>
  );
}
