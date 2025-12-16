/**
 * PATCH 403 - Price Alerts Validation
 * Validação do sistema de alertas de preços
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Bell, Plus, TrendingUp, Database } from "lucide-react";
import { useState } from "react";

export default function PriceAlertsValidation() {
  const [checks, setChecks] = useState({
    loadAlerts: false,
    createAlert: false,
    triggerAlert: false,
    persistence: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            PATCH 403 - Price Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de alertas de preços com notificações
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
              id="loadAlerts"
              checked={checks.loadAlerts}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, loadAlerts: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="loadAlerts"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Bell className="inline h-4 w-4 mr-1" />
                UI carrega alertas existentes
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se alertas salvos aparecem na interface ao carregar
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="createAlert"
              checked={checks.createAlert}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, createAlert: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="createAlert"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Plus className="inline h-4 w-4 mr-1" />
                Novo alerta criado corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Criar novo alerta de preço e confirmar aparição na lista
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="triggerAlert"
              checked={checks.triggerAlert}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, triggerAlert: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="triggerAlert"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Alertas disparam ao atingir valores configurados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Simular mudança de preço e verificar disparo de notificação
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
                Banco persiste alertas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Recarregar página e confirmar que alertas permanecem salvos
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
            ✅ Sistema de alertas 100% funcional e testado
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
