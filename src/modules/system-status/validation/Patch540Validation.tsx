/**
 * PATCH 540 - System Status Panel Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Server, Wifi, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Patch540Validation() {
  const [checks, setChecks] = useState({
    panelLoads: false,
    servicesMonitored: false,
    errorsVisible: false,
    statusAlerts: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            PATCH 540 - Painel de Estado do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Diagnóstico em Tempo Real – Estado do Sistema
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
              id="panelLoads"
              checked={checks.panelLoads}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, panelLoads: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="panelLoads"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Painel carrega corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel /ops/system-status carrega sem erros
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="servicesMonitored"
              checked={checks.servicesMonitored}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, servicesMonitored: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="servicesMonitored"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Server className="inline h-4 w-4 mr-1" />
                Serviços principais monitorados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Supabase, WebSocket, MQTT e Edge IA estão sendo monitorados
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="errorsVisible"
              checked={checks.errorsVisible}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, errorsVisible: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="errorsVisible"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Wifi className="inline h-4 w-4 mr-1" />
                Últimos erros visíveis em tempo real
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema exibe últimos erros e atualiza em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="statusAlerts"
              checked={checks.statusAlerts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, statusAlerts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="statusAlerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Mudança de status dispara alertas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Alteração de status simula alerta visual
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
            ✅ Todos os serviços aparecem com "Online" ou último erro
          </p>
          <p className="font-medium">
            ✅ Alteração manual de status dispara alerta
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
