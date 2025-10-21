import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";

const ControlHubPanel = safeLazyImport(() => import("@/components/control-hub/ControlHubPanel"), "ControlHubPanel");
const SystemAlerts = safeLazyImport(() => import("@/components/control-hub/SystemAlerts"), "SystemAlerts");
const AIInsightReporter = safeLazyImport(() => import("@/components/control-hub/AIInsightReporter"), "AIInsightReporter");

export default function ControlHub() {
  return (
    <Suspense fallback={<Loading />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
          Control Hub – Observability & AI Insights
        </h1>
        <SystemAlerts />
        <ControlHubPanel />
        <AIInsightReporter />
      </main>
    </Suspense>
  );
}
