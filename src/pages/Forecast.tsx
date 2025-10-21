/**
 * Forecast Page
 * Main page for Forecast Global Engine
 */

import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import { safeLazyImport } from "@/utils/safeLazyImport";

// Lazy load forecast components
const ForecastAI = safeLazyImport(() => import("@/components/forecast/ForecastAI"), "ForecastAI");
const ForecastMetrics = safeLazyImport(() => import("@/components/forecast/ForecastMetrics"), "ForecastMetrics");
const ForecastMap = safeLazyImport(() => import("@/components/forecast/ForecastMap"), "ForecastMap");

export default function ForecastPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader /></div>}>
      <main className="p-6 flex flex-col gap-6">
        <div className="space-y-2">
          <h1 
            role="heading" 
            aria-level={1}
            className="text-3xl font-bold text-blue-400"
          >
            Forecast Global
          </h1>
          <p className="text-gray-400">
            Previsões marítimas com IA embarcada e sincronização em tempo real
          </p>
        </div>
        
        <ForecastAI />
        <ForecastMetrics />
        <ForecastMap />
      </main>
    </Suspense>
  );
}
