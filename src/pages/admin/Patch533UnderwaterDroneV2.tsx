/**
 * PATCH 533 - Underwater Drone v2 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Anchor, Play, Database } from "lucide-react";
import { useState } from "react";

export default function Patch533UnderwaterDroneV2() {
  const [checks, setChecks] = useState({
    recording: false,
    replay: false,
    logs: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Anchor className="h-8 w-8 text-primary" />
            PATCH 533 - Underwater Drone v2
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do drone submarino com gravação e replay
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
              id="recording"
              checked={checks.recording}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, recording: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="recording"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Anchor className="inline h-4 w-4 mr-1" />
                Missão pode ser gravada e reproduzida
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema grava e reproduz missões submarinas corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="replay"
              checked={checks.replay}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, replay: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="replay"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Play className="inline h-4 w-4 mr-1" />
                Replay com timeline e localização funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Replay exibe timeline e posições do drone adequadamente
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
                Logs da missão visíveis e completos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os eventos da missão são registrados e acessíveis
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
            ✅ Drone submarino simulado com sucesso e replay funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
