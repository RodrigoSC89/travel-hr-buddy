/**
 * PATCH 436 - Underwater Drone Controller Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Anchor, Gauge, Database, Repeat, FileText } from "lucide-react";
import { useState } from "react";

export default function UnderwaterDroneValidation() {
  const [checks, setChecks] = useState({
    controlPanel: false,
    sensors: false,
    missionLogging: false,
    replay: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Anchor className="h-8 w-8 text-cyan-500" />
            PATCH 436 - Underwater Drone Controller
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação de UI + Orquestração de Controle de Drones Submarinos
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
              id="controlPanel"
              checked={checks.controlPanel}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, controlPanel: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="controlPanel"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Anchor className="inline h-4 w-4 mr-1" />
                Painel de controle de movimentação 3D
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface permite controle de movimento 3D com comandos de navegação
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="sensors"
              checked={checks.sensors}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, sensors: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="sensors"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Gauge className="inline h-4 w-4 mr-1" />
                Sensores simulados (profundidade, temperatura, proximidade)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard exibe dados de sensores simulados em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="missionLogging"
              checked={checks.missionLogging}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, missionLogging: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="missionLogging"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Missões registradas em underwater_missions
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Missões são persistidas no banco de dados com logs completos
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
                <Repeat className="inline h-4 w-4 mr-1" />
                Replay de rota e logs operacionais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema permite replay de missões anteriores com visualização de logs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-500/50 bg-cyan-500/5">
        <CardHeader>
          <CardTitle className="text-cyan-700 dark:text-cyan-400">
            Critérios de Aceite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            UI funcional com comandos
          </p>
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Dados dos sensores simulados exibidos
          </p>
          <p className="font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Missões registradas e reexecutáveis
          </p>
          <p className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Integração com Mission Engine (opcional)
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Todos os checkboxes acima devem estar marcados para aprovação completa
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>✅ Painel de controle 3D implementado</p>
            <p>✅ Sensores simulados: profundidade, temperatura, pressão, visibilidade</p>
            <p>✅ Sistema de telemetria em tempo real</p>
            <p>✅ Controle de missões com waypoints</p>
            <p>✅ Tabela underwater_missions criada</p>
            <p>✅ Logs operacionais de eventos e telemetria</p>
            <p>✅ Upload de missões via JSON</p>
            <p>✅ Sistema de alertas baseado em sensores</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
