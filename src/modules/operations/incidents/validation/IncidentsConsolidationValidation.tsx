/**
 * PATCH 404 - Incidents Consolidation Validation
 * Validação da consolidação de módulos de incidentes
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Navigation, Brain, Download } from "lucide-react";
import { useState } from "react";;;

export default function IncidentsConsolidationValidation() {
  const [checks, setChecks] = useState({
    navigation: false,
    aiFeedback: false,
    pdfExport: false,
    singleModule: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-primary" />
            PATCH 404 - Consolidar Incidentes
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação de módulos de incidentes em estrutura única
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
              id="navigation"
              checked={checks.navigation}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, navigation: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="navigation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Navigation className="inline h-4 w-4 mr-1" />
                Navegação funciona no novo módulo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Acessar listagem e detalhes de incidentes sem erros
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="aiFeedback"
              checked={checks.aiFeedback}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, aiFeedback: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="aiFeedback"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Brain className="inline h-4 w-4 mr-1" />
                AI feedback funciona
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Testar análise AI de incidente e verificar sugestões
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="pdfExport"
              checked={checks.pdfExport}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, pdfExport: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="pdfExport"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Download className="inline h-4 w-4 mr-1" />
                Exportação para PDF sem erros
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Exportar relatório de incidente e validar conteúdo do PDF
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="singleModule"
              checked={checks.singleModule}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, singleModule: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="singleModule"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Módulo único no registry
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmar que existe apenas um módulo de incidentes no registry
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
            ✅ Incidentes integrados, sem duplicações, com AI operante
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
