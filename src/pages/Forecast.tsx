/**
 * Forecast Page
 * Modular architecture with lazy-loaded components
 * Features:
 * - ONNX Runtime Web AI inference
 * - Real-time MQTT synchronization
 * - WCAG 2.1 Level AA accessibility compliance
 */

import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader2 } from "lucide-react";

// Lazy load forecast components for better performance
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

// Loading fallback component
function Loader() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-950"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-400">Carregando módulo Forecast Global...</p>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<Loader />}>
      <main className="min-h-screen bg-gray-950 p-6">
        {/* Page Header */}
        <header className="mb-6">
          <h1 
            className="text-3xl font-bold text-blue-400 mb-2"
            role="heading"
            aria-level={1}
          >
            Forecast Global
          </h1>
          <p className="text-gray-400">
            Módulo preditivo com IA embarcada, MQTT em tempo real e WCAG 2.1 Level AA
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ForecastAI />
          <ForecastMetrics />
        </div>

        {/* Map Section */}
        <ForecastMap />
      </main>
    </Suspense>
  );
}
