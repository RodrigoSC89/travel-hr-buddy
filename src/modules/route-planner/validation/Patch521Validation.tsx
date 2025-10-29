/**
 * PATCH 521 - AI Route Planner Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Map, CloudSun, Clock } from "lucide-react";
import { useState } from "react";

export default function Patch521Validation() {
  const [checks, setChecks] = useState({
    activeInterface: false,
    weatherTrafficIntegration: false,
    etaCalculation: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            PATCH 521 - AI Route Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do planejador de rotas com IA
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
              id="activeInterface"
              checked={checks.activeInterface}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, activeInterface: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="activeInterface"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Map className="inline h-4 w-4 mr-1" />
                Interface ativa e com sugestão de rotas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema exibe interface funcional com sugestões de rotas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="weatherTrafficIntegration"
              checked={checks.weatherTrafficIntegration}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, weatherTrafficIntegration: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="weatherTrafficIntegration"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CloudSun className="inline h-4 w-4 mr-1" />
                Integração com clima e tráfego marítimo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados meteorológicos e de tráfego integrados ao planejamento
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="etaCalculation"
              checked={checks.etaCalculation}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, etaCalculation: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="etaCalculation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Cálculo de ETA e rota alternada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema calcula tempo estimado de chegada e oferece rotas alternativas
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
            ✅ Planejador ativo com IA funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
