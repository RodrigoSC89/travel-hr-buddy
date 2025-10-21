/**
 * Forecast Page
 * Main page for Forecast Global Engine
 */

import React from "react";
import ControlHub2 from "@/modules/controlhub/ControlHub2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Zap } from "lucide-react";

export default function ForecastPage() {
  return (
    <main className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-blue-400">Forecast Global Engine</h1>
        <p className="text-gray-400">
          Módulo preditivo de condições operacionais e falhas de sistema com IA embarcada
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Previsões em Tempo Real</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Análise preditiva para 24h, 72h e 7 dias baseada em dados DP, ASOG e FMEA
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">IA Adaptativa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Aprendizado contínuo via logs e eventos MQTT com RAG embarcado
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">BridgeLink v2</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Backbone de integração com PEO-DP e sistemas externos via MQTT
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Hub */}
      <ControlHub2 />

      {/* Architecture Info */}
      <Card>
        <CardHeader>
          <CardTitle>Arquitetura do Sistema</CardTitle>
          <CardDescription>Componentes principais da versão Beta 3.2</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400">
            <pre className="whitespace-pre">
{`[Telemetry] → [BridgeLink] → [Forecast Engine] ↔ [ControlHub]
                             ↕
                         [NautilusAI v2]
                             ↕
                       [PEO-DP DataLake]`}
            </pre>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Forecast Global Engine:</strong> Módulo de predição marítima e de falhas em tempo real</p>
            <p>• <strong>NautilusAI v2:</strong> IA adaptativa com aprendizado contínuo via logs e eventos MQTT</p>
            <p>• <strong>ControlHub 2.0:</strong> Interface preditiva e alarmística inteligente</p>
            <p>• <strong>BridgeLink v2:</strong> Backbone de integração entre módulos e sistemas externos</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
