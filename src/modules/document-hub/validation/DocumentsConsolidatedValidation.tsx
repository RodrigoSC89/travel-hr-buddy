/**
 * PATCH 421 - Documentos Consolidado Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Upload, FileCheck, Database } from "lucide-react";
import { useState, useCallback } from "react";;;

export default function DocumentsConsolidatedValidation() {
  const [checks, setChecks] = useState({
    routing: false,
    upload: false,
    templates: false,
    data: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 421 - Documentos Consolidado
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do hub unificado de documentos
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
              id="routing"
              checked={checks.routing}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, routing: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="routing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                /documents é a única rota ativa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rota consolidada sem duplicações ou entradas alternativas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="upload"
              checked={checks.upload}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, upload: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="upload"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Upload className="inline h-4 w-4 mr-1" />
                Upload, leitura, parsing ativos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema completo de upload e processamento de documentos funcional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="templates"
              checked={checks.templates}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, templates: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="templates"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileCheck className="inline h-4 w-4 mr-1" />
                Templates integrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de templates funcionando corretamente com o hub de documentos
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
                Dados reais, sem duplicações
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Banco de dados consistente sem entradas duplicadas ou redundantes
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
            ✅ Hub unificado e funcional para documentos
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
