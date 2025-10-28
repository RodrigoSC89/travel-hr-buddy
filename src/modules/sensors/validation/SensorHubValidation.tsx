/**
 * PATCH 405 - Sensor Hub Initial Validation
 * Validação do módulo inicial de sensores
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Gauge, Plus, BarChart3, Database } from "lucide-react";
import { useState } from "react";

export default function SensorHubValidation() {
  const [checks, setChecks] = useState({
    createSensor: false,
    dashboardStatus: false,
    dataVisible: false,
    logging: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gauge className="h-8 w-8 text-primary" />
            PATCH 405 - Sensor Hub Inicial
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da estrutura inicial do módulo de sensores
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
              id="createSensor"
              checked={checks.createSensor}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, createSensor: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="createSensor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Plus className="inline h-4 w-4 mr-1" />
                Novo sensor cadastrado com sucesso
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Criar novo sensor via interface e confirmar salvamento
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dashboardStatus"
              checked={checks.dashboardStatus}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dashboardStatus: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dashboardStatus"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Dashboard exibe status corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se status dos sensores aparecem no dashboard
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dataVisible"
              checked={checks.dataVisible}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dataVisible: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dataVisible"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Gauge className="inline h-4 w-4 mr-1" />
                Dados simulados ou reais aparecem
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmar que leituras de sensores são exibidas na interface
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="logging"
              checked={checks.logging}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logging: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="logging"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Logging persistente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se leituras são salvas no banco de dados
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
            ✅ Estrutura de sensores criada e operando com dados visíveis
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
