/**
 * PATCH 458 - Route Planner AI Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Route, Cloud, Database, Map } from "lucide-react";
import { useState } from "react";

export default function Patch458Validation() {
  const [checks, setChecks] = useState({
    route: false,
    integrations: false,
    export: false,
    ui: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Route className="h-8 w-8 text-primary" />
            PATCH 458 - Route Planner AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejador de rotas com otimização AI
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
              id="route"
              checked={checks.route}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, route: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="route"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Route className="inline h-4 w-4 mr-1" />
                Rota otimizada gerada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                IA gerando rotas otimizadas com base em múltiplos fatores
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="integrations"
              checked={checks.integrations}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, integrations: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="integrations"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Cloud className="inline h-4 w-4 mr-1" />
                Integrações com clima/combustível
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema integrado com dados climáticos e consumo de combustível
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="export"
              checked={checks.export}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, export: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="export"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Export para planned_routes
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas planejadas sendo salvas na tabela planned_routes
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
                <Map className="inline h-4 w-4 mr-1" />
                UI funcional com mapa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface de planejamento com mapa interativo funcionando
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
            ✅ Planejador de rotas com AI operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
