/**
 * PATCH 431 - Route Planner Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Map, Navigation, Cloud, Database } from "lucide-react";
import { useState } from "react";

export default function RoutePlannerValidation() {
  const [checks, setChecks] = useState({
    map: false,
    calculations: false,
    weather: false,
    persistence: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Navigation className="h-8 w-8 text-primary" />
            PATCH 431 - Route Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejamento de rota inteligente
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
                Mapa funcional com rotas traçadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de visualização de rotas operando corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="calculations"
              checked={checks.calculations}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, calculations: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="calculations"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Navigation className="inline h-4 w-4 mr-1" />
                ETA e distância calculados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Cálculos de tempo estimado e distância funcionando
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="weather"
              checked={checks.weather}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, weather: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="weather"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Cloud className="inline h-4 w-4 mr-1" />
                Dados climáticos integrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Integração com dados meteorológicos ativa
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
                Persistência confirmada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas salvas corretamente no banco de dados
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
            ✅ Planejamento de rota funcional e inteligente
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
