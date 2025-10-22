/**
 * Forecast Page
 * Main page for Forecast Global Engine with ONNX AI, MQTT sync, and WCAG 2.1 compliance
 */

// @ts-nocheck
import React, { Suspense } from "react";
import { safeLazyImport } from "@/lib/safeLazyImport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Zap } from "lucide-react";

// Lazy-loaded components for optimal performance
const ForecastAI = safeLazyImport(() => import("@/components/forecast/ForecastAI"), "ForecastAI");
const ForecastMetrics = safeLazyImport(() => import("@/components/forecast/ForecastMetrics"), "ForecastMetrics");
const ForecastMap = safeLazyImport(() => import("@/components/forecast/ForecastMap"), "ForecastMap");

export default function ForecastPage() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-blue-400">Forecast Global</h1>
        <p className="text-gray-400">
          Previsão preditiva com IA embarcada via ONNX Runtime e sincronização MQTT
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <CardTitle className="text-lg">Previsões em Tempo Real</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Análise preditiva baseada em dados meteorológicos e oceanográficos
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" aria-hidden="true" />
              <CardTitle className="text-lg">IA Cliente-Side</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              ONNX Runtime Web para inferência local sem necessidade de backend
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" aria-hidden="true" />
              <CardTitle className="text-lg">Sincronização MQTT</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Publicação automática de previsões via MQTT com QoS configurável
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* AI Forecast Component */}
      <Suspense fallback={<div className="p-4 text-gray-400">Carregando previsão IA...</div>}>
        <ForecastAI />
      </Suspense>

      {/* Metrics Component */}
      <Suspense fallback={<div className="p-4 text-gray-400">Carregando métricas...</div>}>
        <ForecastMetrics />
      </Suspense>

      {/* Map Component */}
      <Suspense fallback={<div className="p-4 text-gray-400">Carregando mapa...</div>}>
        <ForecastMap />
      </Suspense>
    </main>
  );
}
