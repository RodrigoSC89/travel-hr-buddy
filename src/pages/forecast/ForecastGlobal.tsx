import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "lucide-react";

const ForecastPanel = safeLazyImport(() => React.lazy(() => import(import("@/components/forecast/ForecastPanel"), "ForecastPanel")));
const ForecastMap = safeLazyImport(() => React.lazy(() => import(import("@/components/forecast/ForecastMap"), "ForecastMap")));
const ForecastAIInsights = safeLazyImport(() => React.lazy(() => import(import("@/components/forecast/ForecastAIInsights"), "ForecastAIInsights")));

export default function ForecastGlobal() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      }>
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white mb-6">Forecast Global Intelligence</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForecastPanel />
            <ForecastAIInsights />
          </div>
          
          <ForecastMap />
        </div>
      </Suspense>
    </div>
  );
}
