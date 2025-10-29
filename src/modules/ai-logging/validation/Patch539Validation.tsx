/**
 * PATCH 539 - AI Logging Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Bot, Database, Clock, Shield } from "lucide-react";
import { useState } from "react";

export default function Patch539Validation() {
  const [checks, setChecks] = useState({
    aiCallsLogged: false,
    fieldsPresent: false,
    logsVisible: false,
    rlsActive: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            PATCH 539 - Logging de IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Verificação do Logging de Interações com AI
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
              id="aiCallsLogged"
              checked={checks.aiCallsLogged}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, aiCallsLogged: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="aiCallsLogged"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Bot className="inline h-4 w-4 mr-1" />
                Chamadas AI são registradas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Cada chamada ao copilot, forecast e Vault AI é registrada
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="fieldsPresent"
              checked={checks.fieldsPresent}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, fieldsPresent: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="fieldsPresent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Clock className="inline h-4 w-4 mr-1" />
                Campos essenciais salvos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Campos prompt, response_time e user_id são salvos corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="logsVisible"
              checked={checks.logsVisible}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logsVisible: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="logsVisible"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Registros visíveis na tabela ai_logs
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Registros podem ser consultados na tabela ai_logs
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="rlsActive"
              checked={checks.rlsActive}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, rlsActive: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="rlsActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Shield className="inline h-4 w-4 mr-1" />
                RLS ativa para acesso dos logs
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Row-Level Security está ativa para proteção dos logs
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
            ✅ 5+ interações AI visíveis nos logs
          </p>
          <p className="font-medium">
            ✅ Dados anonimizados corretamente
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
