/**
 * PATCH 409 - Templates Application Validation
 * Validação de templates aplicáveis a documentos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Download, Link2, Variable } from "lucide-react";
import { useState } from "react";;;

export default function TemplatesApplicationValidation() {
  const [checks, setChecks] = useState({
    application: false,
    export: false,
    integration: false,
    variables: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 409 - Templates Aplicáveis
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação de templates dinâmicos aplicados a documentos
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
              id="application"
              checked={checks.application}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, application: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="application"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Template aplicado com sucesso em documento
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Selecionar template e aplicar a documento novo ou existente
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
                Exportação com dados reais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Exportar documento e verificar que dados reais aparecem no PDF
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="integration"
              checked={checks.integration}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, integration: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="integration"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Link2 className="inline h-4 w-4 mr-1" />
                Integração com Document Hub funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar navegação entre templates e documents
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="variables"
              checked={checks.variables}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, variables: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="variables"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Variable className="inline h-4 w-4 mr-1" />
                Variáveis substituídas corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmar que placeholders são substituídos por dados reais
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
            ✅ Templates dinâmicos funcionando com documentos reais
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
