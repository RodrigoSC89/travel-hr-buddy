/**
 * PATCH 449 - Route Planner v2 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Map, Clock, Link2, Database } from "lucide-react";
import { useState } from "react";

export default function RoutePlannerValidationV2() {
  const [checks, setChecks] = useState({
    ui: false,
    eta: false,
    integration: false,
    persistence: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            PATCH 449 - Route Planner v2
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejador de rotas inteligente
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
                <Map className="inline h-4 w-4 mr-1" />
                UI interativa funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface de planejamento responsiva e intuitiva
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="eta"
              checked={checks.eta}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, eta: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="eta"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                ETA calculado dinamicamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Tempo estimado de chegada sendo calculado automaticamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="integration"
              checked={checks.integration}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, integration: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="integration"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Link2 className="inline h-4 w-4 mr-1" />
                Integração com copiloto validada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Comunicação ativa com Navigation Copilot
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="persistence"
              checked={checks.persistence}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, persistence: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="persistence"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Dados salvos em planned_routes
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas planejadas persistidas no banco de dados
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
            ✅ Planejador de rota inteligente concluído
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
