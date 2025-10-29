/**
 * PATCH 461 - Sensors Hub Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Wifi, BarChart3, Database } from "lucide-react";
import { useState } from "react";

export default function Patch461Validation() {
  const [checks, setChecks] = useState({
    dashboard: false,
    realtime: false,
    charts: false,
    persistence: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            PATCH 461 - Sensors Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do hub de sensores em tempo real
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
              id="dashboard"
              checked={checks.dashboard}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dashboard: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dashboard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Dashboard funcional por tipo de sensor
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface organizada por categorias de sensores
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="realtime"
              checked={checks.realtime}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, realtime: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="realtime"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Wifi className="inline h-4 w-4 mr-1" />
                Leitura em tempo real via WebSocket/MQTT
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados de sensores atualizando em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="charts"
              checked={checks.charts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, charts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="charts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BarChart3 className="inline h-4 w-4 mr-1" />
                Gráficos históricos ok
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Visualizações de histórico de leituras funcionando
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="persistence"
              checked={checks.persistence}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, persistence: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="persistence"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Tabelas sensor_readings, sensor_alerts populadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dados persistidos corretamente no banco de dados
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
            ✅ Hub de sensores com monitoramento em tempo real operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
