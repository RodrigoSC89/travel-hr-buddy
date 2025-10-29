/**
 * PATCH 523 - Travel System + Forecast Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plane, DollarSign, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function Patch523Validation() {
  const [checks, setChecks] = useState({
    reservationsIntegrated: false,
    dynamicPricing: false,
    travelDashboard: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            PATCH 523 - Travel System + Forecast
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de viagens com previsão integrada
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
              id="reservationsIntegrated"
              checked={checks.reservationsIntegrated}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, reservationsIntegrated: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="reservationsIntegrated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Plane className="inline h-4 w-4 mr-1" />
                Reservas com destino, ETA e previsão integrada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de reservas inclui destino, tempo estimado e previsões
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dynamicPricing"
              checked={checks.dynamicPricing}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dynamicPricing: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dynamicPricing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <DollarSign className="inline h-4 w-4 mr-1" />
                Sistema de preço dinâmico operando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Preços se ajustam dinamicamente baseado em demanda e previsões
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="travelDashboard"
              checked={checks.travelDashboard}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, travelDashboard: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="travelDashboard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <LayoutDashboard className="inline h-4 w-4 mr-1" />
                Dashboard de viagens consolidado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel unificado exibe todas as informações de viagens
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
            ✅ Sistema de viagem integrado a forecasts e operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
