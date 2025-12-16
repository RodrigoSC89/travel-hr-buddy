/**
 * PATCH 476 - SATCOM v1 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Satellite, Activity, AlertCircle, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Patch476Validation() {
  const [checks, setChecks] = useState({
    table: false,
    simulation: false,
    ui: false,
    dashboard: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="h-8 w-8 text-primary" />
            PATCH 476 - SATCOM v1
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de comunicação via satélite v1
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
              id="table"
              checked={checks.table}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, table: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="table"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Tabela satcom_logs funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Tabela de logs criada e operacional no banco de dados
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="simulation"
              checked={checks.simulation}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, simulation: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="simulation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Simulação de status online/offline ok
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema simula corretamente status de conexão
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="ui"
              checked={checks.ui}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, ui: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="ui"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <AlertCircle className="inline h-4 w-4 mr-1" />
                UI reflete latência ou falha
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface exibe corretamente status de conexão e latência
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
                <Satellite className="inline h-4 w-4 mr-1" />
                Dashboard atualizado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard principal integra informações SATCOM
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
            ✅ Sistema SATCOM v1 operacional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
