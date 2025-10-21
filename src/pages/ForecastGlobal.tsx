import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loading } from "@/components/ui/Loading";

const ForecastPanel = safeLazyImport(() => import("@/components/forecast/ForecastPanel"), "ForecastPanel");
const ForecastMap = safeLazyImport(() => import("@/components/forecast/ForecastMap"), "ForecastMap");
const ForecastAIInsights = safeLazyImport(() => import("@/components/forecast/ForecastAIInsights"), "ForecastAIInsights");

export default function ForecastGlobal() {
  return (
    <Suspense fallback={<Loading message="Carregando Forecast Global..." fullScreen />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>
          Forecast Global Intelligence
        </h1>
        <ForecastPanel />
        <ForecastMap />
        <ForecastAIInsights />
      </main>
    </Suspense>
  );
}
