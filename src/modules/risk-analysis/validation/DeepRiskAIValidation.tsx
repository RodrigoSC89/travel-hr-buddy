/**
 * PATCH 433 - Deep Risk AI Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Bell, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function DeepRiskAIValidation() {
  const [checks, setChecks] = useState({
    detection: false,
    alerts: false,
    logs: false,
    dashboard: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            PATCH 433 - Deep Risk AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da análise AI de riscos
          </p>
        </div>
        {allChecked && (
          <Badge className="bg-green-500 text-white text-lg px-4 py-2">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            VALIDADO
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>
            Marque cada item após validar o funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="detection"
              checked={checks.detection}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, detection: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="detection"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Riscos detectados com base em dados reais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de detecção de riscos operando com dados reais
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="alerts"
              checked={checks.alerts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, alerts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="alerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Bell className="inline h-4 w-4 mr-1" />
                Alertas emitidos com contexto
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Alertas contextualizados sendo emitidos corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="logs"
              checked={checks.logs}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logs: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="logs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Logs de eventos completos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de logs registrando todos os eventos relevantes
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dashboard"
              checked={checks.dashboard}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dashboard: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dashboard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Painel visual operante
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard visual funcionando com métricas de risco
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">
            Critério de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            ✅ Análise AI de riscos funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
