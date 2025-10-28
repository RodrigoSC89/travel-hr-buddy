/**
 * PATCH 429 - Satcom Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Satellite, Send, Clock, FileText } from "lucide-react";
import { useState } from "react";

export default function SatcomValidation() {
  const [checks, setChecks] = useState({
    messaging: false,
    latency: false,
    logs: false,
    ui: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="h-8 w-8 text-primary" />
            PATCH 429 - Satcom
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de comunicação satelital
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
              id="messaging"
              checked={checks.messaging}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, messaging: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="messaging"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Send className="inline h-4 w-4 mr-1" />
                Mensagens enviadas e recebidas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema transmite e recebe mensagens via canal satelital
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="latency"
              checked={checks.latency}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, latency: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="latency"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Simulação de latência presente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema simula atrasos e condições reais de comunicação satelital
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
                Logs registrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as comunicações são registradas com timestamps e status
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
                <Satellite className="inline h-4 w-4 mr-1" />
                Canal satelital ativo na UI
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface mostra status do canal e histórico de comunicações
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
            ✅ Canal de comunicação satelital simulado funcionalmente
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
