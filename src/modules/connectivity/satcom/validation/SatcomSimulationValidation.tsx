/**
 * PATCH 420 - Satcom com Simulação Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Radio, FileText, Clock, Gauge } from "lucide-react";
import { useState } from "react";

export default function SatcomSimulationValidation() {
  const [checks, setChecks] = useState({
    simulation: false,
    log: false,
    history: false,
    panel: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className="h-8 w-8 text-primary" />
            PATCH 420 - Satcom com Simulação
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do módulo de comunicação por satélite com simulação
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
              id="simulation"
              checked={checks.simulation}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, simulation: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="simulation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Radio className="inline h-4 w-4 mr-1" />
                Simulação com perda de sinal/latência
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema simula condições reais de comunicação via satélite
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="log"
              checked={checks.log}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, log: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="log"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Log funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Eventos de comunicação são registrados com timestamps
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="history"
              checked={checks.history}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, history: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="history"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Histórico acessível
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de comunicações pode ser consultado e filtrado
              </p>
            </div>
          </div>

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
                Painel de controle responsivo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface adapta-se a diferentes tamanhos de tela
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
            ✅ Módulo básico de Satcom operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
