/**
 * PATCH 540 - Navigation Copilot v3 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Navigation, AlertTriangle, FileText } from "lucide-react";
import { useState } from "react";

export default function Patch540Validation() {
  const [checks, setChecks] = useState({
    adaptiveRoute: false,
    navigationAlerts: false,
    logsReplanning: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Navigation className="h-8 w-8 text-primary" />
            PATCH 540 - Navigation Copilot v3
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da navegação autônoma com adaptação a riscos
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
              id="adaptiveRoute"
              checked={checks.adaptiveRoute}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, adaptiveRoute: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="adaptiveRoute"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Navigation className="inline h-4 w-4 mr-1" />
                Rota se adapta sozinha a riscos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema ajusta rotas automaticamente ao detectar riscos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="navigationAlerts"
              checked={checks.navigationAlerts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, navigationAlerts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="navigationAlerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Alertas de navegação são emitidos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema emite alertas quando detecta riscos ou mudanças de rota
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="logsReplanning"
              checked={checks.logsReplanning}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logsReplanning: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="logsReplanning"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Logs e replanejamentos salvos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as decisões e replanejamentos são registrados
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
            ✅ Autonomia completa com fallback funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
