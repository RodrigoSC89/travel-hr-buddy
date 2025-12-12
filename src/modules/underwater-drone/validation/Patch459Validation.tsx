/**
 * PATCH 459 - Underwater Drone Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Waves, Radio, Database, Battery } from "lucide-react";
import { useState, useCallback } from "react";;;

export default function Patch459Validation() {
  const [checks, setChecks] = useState({
    ui: false,
    websocket: false,
    logs: false,
    status: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Waves className="h-8 w-8 text-primary" />
            PATCH 459 - Underwater Drone
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de controle de drones submarinos
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
                <Waves className="inline h-4 w-4 mr-1" />
                UI ativa de controle
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface de controle do drone funcionando corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="websocket"
              checked={checks.websocket}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, websocket: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="websocket"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Radio className="inline h-4 w-4 mr-1" />
                Feedback do drone via WebSocket
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Comunicação em tempo real com o drone via WebSocket
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
                Logs em underwater_missions
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Missões sendo persistidas na tabela underwater_missions
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="status"
              checked={checks.status}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, status: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Battery className="inline h-4 w-4 mr-1" />
                Status de profundidade/bateria
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Telemetria de profundidade e bateria exibida em tempo real
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
            ✅ Sistema de controle de drone submarino operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
