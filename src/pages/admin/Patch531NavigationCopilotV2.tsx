/**
 * PATCH 531 - Navigation Copilot v2 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mic, MessageSquare, Database } from "lucide-react";
import { useState } from "react";

export default function Patch531NavigationCopilotV2() {
  const [checks, setChecks] = useState({
    voiceText: false,
    wakeWord: false,
    logs: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            PATCH 531 - Navigation Copilot v2
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do copiloto com comandos por voz e texto
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
              id="voiceText"
              checked={checks.voiceText}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, voiceText: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="voiceText"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Mic className="inline h-4 w-4 mr-1" />
                IA responde a comandos por voz e texto
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema processa comandos por voz e texto corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="wakeWord"
              checked={checks.wakeWord}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, wakeWord: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="wakeWord"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Mic className="inline h-4 w-4 mr-1" />
                Wake word funciona corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Palavra de ativação detectada e sistema responde adequadamente
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
                <Database className="inline h-4 w-4 mr-1" />
                Logs de decisão e rota são registrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as decisões e rotas são persistidas corretamente
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
            ✅ Copilot funcional em tempo real com logs visíveis
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
