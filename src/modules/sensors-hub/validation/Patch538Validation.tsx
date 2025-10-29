/**
 * PATCH 538 - Sensors Hub Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Database, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Patch538Validation() {
  const [checks, setChecks] = useState({
    realTimeSensors: false,
    dataPersistence: false,
    dashboard: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            PATCH 538 - Sensors Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do hub de sensores com dados em tempo real
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
              id="realTimeSensors"
              checked={checks.realTimeSensors}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, realTimeSensors: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="realTimeSensors"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Sensores ativos com dados em tempo real
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema coleta e exibe dados de sensores em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dataPersistence"
              checked={checks.dataPersistence}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dataPersistence: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dataPersistence"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Dados persistidos corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Leituras de sensores são armazenadas no banco de dados
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
                Dashboard exibe variações
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard mostra variações e tendências dos dados de sensores
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
            ✅ Leitura de sensores integrada e funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
