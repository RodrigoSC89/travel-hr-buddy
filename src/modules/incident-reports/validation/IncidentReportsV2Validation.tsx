/**
 * PATCH 439 - Incident Reports v2 Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Database, Download, Navigation } from "lucide-react";
import { useState } from "react";;;

export default function IncidentReportsV2Validation() {
  const [checks, setChecks] = useState({
    viewer: false,
    data: false,
    export: false,
    routes: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 439 - Incident Reports v2
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação do módulo de relatórios de incidentes
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
              id="viewer"
              checked={checks.viewer}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, viewer: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="viewer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Viewer consolidado funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface unificada para visualização de relatórios
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="data"
              checked={checks.data}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, data: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="data"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Dados dos incidentes centralizados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os dados consolidados em uma única fonte
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
                <Download className="inline h-4 w-4 mr-1" />
                Exportação funciona
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de exportação de relatórios operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="routes"
              checked={checks.routes}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, routes: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="routes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Navigation className="inline h-4 w-4 mr-1" />
                Sem rotas duplicadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas consolidadas sem redundâncias
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
            ✅ Módulo único de incidentes, completo
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
