/**
 * PATCH 450 - Underwater Drone Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Anchor, Gauge, Map, Database } from "lucide-react";
import { useState } from "react";

export default function UnderwaterDroneValidationV2() {
  const [checks, setChecks] = useState({
    control: false,
    telemetry: false,
    map: false,
    missions: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Anchor className="h-8 w-8 text-primary" />
            PATCH 450 - Underwater Drone
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de controle de drone submarino
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
              id="control"
              checked={checks.control}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, control: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="control"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Anchor className="inline h-4 w-4 mr-1" />
                Interface de controle ativa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel de controle do drone operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="telemetry"
              checked={checks.telemetry}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, telemetry: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="telemetry"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Gauge className="inline h-4 w-4 mr-1" />
                Telemetria recebida (mesmo simulada)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados de telemetria sendo exibidos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="map"
              checked={checks.map}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, map: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="map"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Map className="inline h-4 w-4 mr-1" />
                Mapa 2D exibido
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Visualização 2D da posição e trajetória do drone
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="missions"
              checked={checks.missions}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, missions: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="missions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Missões e logs persistidos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de missões salvo no banco de dados
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
            ✅ Controle operacional do drone submarino
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
