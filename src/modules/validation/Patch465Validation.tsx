/**
 * PATCH 465 - Painel de Validação Técnica Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, FileJson, FileSpreadsheet, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function Patch465Validation() {
  const [checks, setChecks] = useState({
    indicators: false,
    json: false,
    export: false,
    links: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            PATCH 465 - Painel de Validação Técnica
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do painel de monitoramento e validação técnica
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
              id="indicators"
              checked={checks.indicators}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, indicators: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="indicators"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Indicadores visuais ativos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard com indicadores de status funcionando
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="json"
              checked={checks.json}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, json: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="json"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileJson className="inline h-4 w-4 mr-1" />
                Dados carregados via JSON
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de carregamento de dados via JSON operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="export"
              checked={checks.export}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, export: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="export"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileSpreadsheet className="inline h-4 w-4 mr-1" />
                Exportação CSV/PDF
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Funcionalidade de exportação para CSV e PDF funcionando
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="links"
              checked={checks.links}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, links: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="links"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <ExternalLink className="inline h-4 w-4 mr-1" />
                Links para correções OK
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de links para ações corretivas operacional
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
            ✅ Painel de validação técnica completamente funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
