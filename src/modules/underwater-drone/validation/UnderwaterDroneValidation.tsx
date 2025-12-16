/**
 * PATCH 436 - Underwater Drone Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Anchor, Navigation, FileText, Gauge } from "lucide-react";
import { useState } from "react";

export default function UnderwaterDroneValidation() {
  const [checks, setChecks] = useState({
    panel: false,
    control: false,
    logs: false,
    interface: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Anchor className="h-8 w-8 text-primary" />
            PATCH 436 - Underwater Drone
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do drone submarino
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
                <Gauge className="inline h-4 w-4 mr-1" />
                Painel de drone ativo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard mostrando status e telemetria do drone submarino
              </p>
            </div>
          </div>

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
                <Navigation className="inline h-4 w-4 mr-1" />
                Controle de rota e status funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Comandos de navegação e controle de missão operacionais
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
                Log de missão salvo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de missões e operações sendo registrado corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="interface"
              checked={checks.interface}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, interface: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="interface"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Interface operável
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                UI responsiva e intuitiva para controle do drone
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
            ✅ Drone submarino simulado com controles
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
