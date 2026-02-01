/**
 * Telemetria 360 - Placeholder
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function Telemetria360() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Telemetria 360</h2>
          <p className="text-muted-foreground">Monitoramento completo de telemetria</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Telemetria</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de telemetria em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
