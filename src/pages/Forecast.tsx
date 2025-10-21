/**
 * Forecast Page - Modular Architecture
 * Main page for Forecast Global Engine with lazy-loaded components
 */

import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "@/components/ui/loader";

// Lazy-load forecast components with error handling
const ForecastAI = safeLazyImport(
  () => import("@/components/forecast/ForecastAI"),
  "ForecastAI"
);
const ForecastMetrics = safeLazyImport(
  () => import("@/components/forecast/ForecastMetrics"),
  "ForecastMetrics"
);
const ForecastMap = safeLazyImport(
  () => import("@/components/forecast/ForecastMap"),
  "ForecastMap"
);

export default function ForecastPage() {
  return (
    <Suspense fallback={<Loader />}>
      <main className="min-h-screen bg-gray-950 p-6">
        {/* Page Header */}
        <h1
          role="heading"
          aria-level={1}
          className="text-3xl font-bold text-blue-400 mb-2"
        >
          Forecast Global
        </h1>
        <p className="text-gray-400 mb-6">
          Motor preditivo com IA embarcada, sincronização MQTT e acessibilidade WCAG 2.1
        </p>

        {/* AI and Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ForecastAI />
          <ForecastMetrics />
        </div>

        {/* Global Map */}
        <ForecastMap />
      </main>
    </Suspense>
  );
}
