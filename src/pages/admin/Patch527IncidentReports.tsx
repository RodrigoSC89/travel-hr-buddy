/**
 * PATCH 527 - Relatórios de Incidentes (unificação)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertTriangle, Database } from "lucide-react";

export default function Patch527IncidentReports() {
  const [checks, setChecks] = useState({
    singleModule: false,
    dataMigrated: false,
    aiReplayActive: false,
    logsAccessible: false,
  });

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);
  const progress = Object.values(checks).filter(Boolean).length;
  const total = Object.values(checks).length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 527 – Relatórios de Incidentes (unificação)</h1>
          <p className="text-muted-foreground">Módulo unificado de incidentes com IA de replay</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🧪 PATCH 527 – Validação</CardTitle>
            <Badge variant={allChecked ? "default" : "secondary"}>
              {progress}/{total} ✓
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.singleModule}
              onCheckedChange={() => toggleCheck("singleModule")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.singleModule ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Apenas o módulo final ativo (/incident-center/)</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.dataMigrated}
              onCheckedChange={() => toggleCheck("dataMigrated")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.dataMigrated ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Dados migrados de incidents/ + incident-reports/</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Migração completa de ambas as versões antigas</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.aiReplayActive}
              onCheckedChange={() => toggleCheck("aiReplayActive")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.aiReplayActive ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">IA de replay de incidentes acessível e funcional</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              checked={checks.logsAccessible}
              onCheckedChange={() => toggleCheck("logsAccessible")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {checks.logsAccessible ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">Logs e histórico acessíveis e consistentes</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Critério:</strong> Módulo incident-reports/ unificado com todas funcionalidades migradas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
