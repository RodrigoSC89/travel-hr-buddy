/**
 * PATCH 537 - Audit Dashboard Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Filter, FileDown, Database } from "lucide-react";
import { useState } from "react";

export default function Patch537Validation() {
  const [checks, setChecks] = useState({
    logsVisible: false,
    filtersWorking: false,
    csvExport: false,
    dbConnection: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            PATCH 537 - Audit Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do Audit Dashboard de Acessos
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
                <Shield className="inline h-4 w-4 mr-1" />
                Acessos recentes visíveis no painel
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel /admin/audit-dashboard exibe todos os acessos recentes
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="filtersWorking"
              checked={checks.filtersWorking}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, filtersWorking: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="filtersWorking"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Filter className="inline h-4 w-4 mr-1" />
                Filtros funcionando corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Filtros por usuário, IP e rota funcionam corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="csvExport"
              checked={checks.csvExport}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, csvExport: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="csvExport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileDown className="inline h-4 w-4 mr-1" />
                Exportação CSV funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Exportação gera arquivo com colunas corretas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="dbConnection"
              checked={checks.dbConnection}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, dbConnection: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="dbConnection"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Conexão com access_logs funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Conexão com tabela access_logs está funcional
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
            ✅ Logs completos carregando corretamente
          </p>
          <p className="font-medium">
            ✅ Export CSV com no mínimo 10 entradas
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
