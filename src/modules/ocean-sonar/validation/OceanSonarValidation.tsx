/**
 * PATCH 423 - Ocean Sonar Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Waves, BarChart3, AlertTriangle, Database } from "lucide-react";
import { useState, useCallback } from "react";;;

export default function OceanSonarValidation() {
  const [checks, setChecks] = useState({
    signal: false,
    visualization: false,
    alerts: false,
    storage: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Waves className="h-8 w-8 text-primary" />
            PATCH 423 - Ocean Sonar
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de sonar oceânico
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
              id="signal"
              checked={checks.signal}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, signal: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="signal"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Waves className="inline h-4 w-4 mr-1" />
                Sinal sonar simulado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de simulação de sonar gerando sinais realistas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="visualization"
              checked={checks.visualization}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, visualization: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="visualization"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Painel com visualização gráfica
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface visual mostrando dados do sonar em tempo real
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
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Alertas de risco exibidos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de alertas funcionando para detecção de riscos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="storage"
              checked={checks.storage}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, storage: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="storage"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Dados armazenados corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Leituras e alertas sendo persistidos no banco de dados
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
            ✅ Sonar operante com feedback visual e alertas
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
