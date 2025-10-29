/**
 * PATCH 474 - Route Planner v1 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Map, Database, Eye, Smartphone } from "lucide-react";
import { useState } from "react";

export default function Patch474Validation() {
  const [checks, setChecks] = useState({
    interface: false,
    persistence: false,
    mapView: false,
    responsive: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            PATCH 474 - Route Planner v1
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejador de rotas versão 1
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
                <Map className="inline h-4 w-4 mr-1" />
                Interface criada (origem, destino)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Formulário de planejamento funcional
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
                Rota persistida em planned_routes
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados salvos corretamente no banco
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="mapView"
              checked={checks.mapView}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, mapView: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="mapView"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Eye className="inline h-4 w-4 mr-1" />
                Visualização em mapa ok
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas exibidas adequadamente no mapa
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="responsive"
              checked={checks.responsive}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, responsive: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="responsive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Smartphone className="inline h-4 w-4 mr-1" />
                Layout mobile e desktop funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface responsiva em todos os dispositivos
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
            ✅ Route Planner v1 completo e funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
