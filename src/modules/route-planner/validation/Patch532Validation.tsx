/**
 * PATCH 532 - Route Planner IA-Geográfica Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Route, Cloud, Database } from "lucide-react";
import { useState } from "react";

export default function Patch532Validation() {
  const [checks, setChecks] = useState({
    aiRoutes: false,
    geoData: false,
    routeLogs: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Route className="h-8 w-8 text-primary" />
            PATCH 532 - Route Planner IA-Geográfica
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejador de rotas com IA e dados geográficos
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
              id="aiRoutes"
              checked={checks.aiRoutes}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, aiRoutes: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="aiRoutes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Route className="inline h-4 w-4 mr-1" />
                IA sugere pelo menos 2 rotas com base no clima
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema gera múltiplas rotas considerando dados meteorológicos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="geoData"
              checked={checks.geoData}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, geoData: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="geoData"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Cloud className="inline h-4 w-4 mr-1" />
                Interface mostra dados geográficos integrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados geográficos e meteorológicos visíveis na interface
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="routeLogs"
              checked={checks.routeLogs}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, routeLogs: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="routeLogs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Logs de rota estão completos e salvos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as rotas geradas são persistidas com detalhes completos
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
            ✅ Rota inteligente gerada com sucesso via IA
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
