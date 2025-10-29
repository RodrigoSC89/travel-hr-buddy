/**
 * PATCH 467 - Drone Commander Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plane, Radio, Database, Shield } from "lucide-react";
import { useState } from "react";

export default function Patch467Validation() {
  const [checks, setChecks] = useState({
    dashboard: false,
    commands: false,
    logs: false,
    noErrors: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            PATCH 467 - Drone Commander
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de comando de drones
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
                <Plane className="inline h-4 w-4 mr-1" />
                Dashboard com drones simulados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface exibindo drones e seus status
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="commands"
              checked={checks.commands}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, commands: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="commands"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Radio className="inline h-4 w-4 mr-1" />
                Envio de comando básico OK
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de comandos funcionando corretamente
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
                <Database className="inline h-4 w-4 mr-1" />
                Logs populando em drone_logs
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Registros sendo persistidos no banco de dados
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="noErrors"
              checked={checks.noErrors}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, noErrors: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="noErrors"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Shield className="inline h-4 w-4 mr-1" />
                Sem falhas no frontend
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface estável e sem erros de console
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
            ✅ Sistema de comando de drones operacional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
