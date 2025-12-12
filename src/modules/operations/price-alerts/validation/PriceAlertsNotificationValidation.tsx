/**
 * PATCH 418 - Price Alerts com Notificação Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Bell, FileText, Eye } from "lucide-react";
import { useState } from "react";;;

export default function PriceAlertsNotificationValidation() {
  const [checks, setChecks] = useState({
    job: false,
    notification: false,
    log: false,
    history: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            PATCH 418 - Price Alerts com Notificação
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema de alertas automáticos com notificações
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
              id="job"
              checked={checks.job}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, job: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="job"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Job agendado detecta condições corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema verifica preços periodicamente e identifica quando alertas devem disparar
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="notification"
              checked={checks.notification}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, notification: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="notification"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Bell className="inline h-4 w-4 mr-1" />
                Notificação enviada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Usuário recebe notificação (toast/email) quando alerta é disparado
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="log"
              checked={checks.log}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, log: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="log"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Log salvo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Cada disparo de alerta é registrado no banco de dados
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
                <Eye className="inline h-4 w-4 mr-1" />
                UI exibe histórico
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface mostra histórico de alertas disparados
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
            ✅ Alertas operacionais em produção
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
