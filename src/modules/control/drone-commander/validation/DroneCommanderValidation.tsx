/**
 * PATCH 427 - Drone Commander Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plane, Gamepad2, FileText, Calendar } from "lucide-react";
import { useState } from "react";

export default function DroneCommanderValidation() {
  const [checks, setChecks] = useState({
    panel: false,
    commands: false,
    logs: false,
    scheduling: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            PATCH 427 - Drone Commander
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de comando e controle de drones
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
              id="panel"
              checked={checks.panel}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, panel: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="panel"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Plane className="inline h-4 w-4 mr-1" />
                Painel de drones interativo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface mostra status e localização de múltiplos drones em tempo real
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
                <Gamepad2 className="inline h-4 w-4 mr-1" />
                Comandos operacionais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema permite enviar comandos de voo, retorno e emergência
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
                Logs de voos persistidos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico completo de voos armazenado no banco de dados
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="scheduling"
              checked={checks.scheduling}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, scheduling: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="scheduling"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                Agendamento funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Missões podem ser agendadas e executadas automaticamente
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
            ✅ Controle e simulação de múltiplos drones operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
