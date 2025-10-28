/**
 * PATCH 432 - Navigation Copilot v2 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Bot, Navigation, AlertTriangle, Database } from "lucide-react";
import { useState } from "react";

export default function NavigationCopilotV2Validation() {
  const [checks, setChecks] = useState({
    suggestions: false,
    integration: false,
    alerts: false,
    history: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            PATCH 432 - Navigation Copilot v2
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do copiloto com contexto operacional e AI
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
              id="suggestions"
              checked={checks.suggestions}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, suggestions: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="suggestions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Bot className="inline h-4 w-4 mr-1" />
                Sugestões AI ativas na UI
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface exibindo sugestões da IA em tempo real
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
                <Navigation className="inline h-4 w-4 mr-1" />
                Integração com missão e rota
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema integrado com dados de missão e planejamento de rota
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="alerts"
              checked={checks.alerts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, alerts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="alerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Alertas dinâmicos operando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de alertas contextuais funcionando
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
                <Database className="inline h-4 w-4 mr-1" />
                Histórico salvo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de sugestões e decisões persistido corretamente
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
            ✅ Copiloto com contexto operacional e AI
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
