/**
 * PATCH 453 - Sensors Hub Validation
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

export default function SensorsHubValidation() {
  const [checks, setChecks] = useState({
    mockSensors: false,
    dashboardCharts: false,
    alerts: false,
    dataPersistence: false,
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);
  const progress = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🧪 PATCH 453 – Sensors Hub</CardTitle>
            <Badge variant={allChecked ? "default" : "secondary"}>
              {progress}/{total} ✓
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.mockSensors}
              onCheckedChange={() => toggleCheck("mockSensors")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.mockSensors ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Sensores mockados funcionais</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.dashboardCharts}
              onCheckedChange={() => toggleCheck("dashboardCharts")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.dashboardCharts ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Painel com gráficos ativos</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.alerts}
              onCheckedChange={() => toggleCheck("alerts")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.alerts ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Alertas acionados corretamente</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.dataPersistence}
              onCheckedChange={() => toggleCheck("dataPersistence")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.dataPersistence ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Leitura e eventos persistidos</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Critério:</strong> Hub de sensores completamente funcional com monitoramento em tempo real.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
