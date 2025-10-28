/**
 * PATCH 443 - Ocean Sonar Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Waves, FileText, Brain } from "lucide-react";
import { useState } from "react";

export default function OceanSonarValidationV2() {
  const [checks, setChecks] = useState({
    visualization: false,
    detection: false,
    logs: false,
    ai: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Waves className="h-8 w-8 text-primary" />
            PATCH 443 - Ocean Sonar
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema sonar com IA
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
              id="visualization"
              checked={checks.visualization}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, visualization: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="visualization"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Waves className="inline h-4 w-4 mr-1" />
                Visualização de sinais sonar
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface exibindo sinais sonar em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="detection"
              checked={checks.detection}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, detection: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="detection"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Detecção de objetos/anomalias
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema identifica objetos e anomalias nos sinais
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
                Logs salvos em sonar_events
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Eventos de sonar persistidos na tabela sonar_events
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="ai"
              checked={checks.ai}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, ai: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="ai"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Brain className="inline h-4 w-4 mr-1" />
                IA integrada (real ou simulada)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de IA para análise de sinais operacional
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
            ✅ Sistema sonar funcional com apoio de IA
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
