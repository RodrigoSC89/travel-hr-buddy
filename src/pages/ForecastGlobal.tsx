import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "@/components/ui/loader";

const ForecastMap = safeLazyImport(() => import("@/components/forecast/ForecastMap"), "ForecastMap");
const ForecastMetrics = safeLazyImport(() => import("@/components/forecast/ForecastMetrics"), "ForecastMetrics");
const ForecastAI = safeLazyImport(() => import("@/components/forecast/ForecastAI"), "ForecastAI");

export default function ForecastGlobal() {
  return (
    <Suspense fallback={<Loader />}>
      <main className="p-6 flex flex-col gap-6 bg-[var(--nautilus-bg-alt)] min-h-screen">
        <h1 className="text-3xl font-bold" role="heading" aria-level={1}>Forecast Global</h1>
        <ForecastAI />
        <ForecastMetrics />
        <ForecastMap />
      </main>
    </Suspense>
  );
}
