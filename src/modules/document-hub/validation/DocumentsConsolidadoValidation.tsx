/**
 * PATCH 412 - Documents Consolidado Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Upload, Eye, Copy } from "lucide-react";
import { useState, useCallback } from "react";;;

export default function DocumentsConsolidadoValidation() {
  const [checks, setChecks] = useState({
    route: false,
    upload: false,
    templates: false,
    duplication: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 412 - Documents Consolidado
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
              id="route"
              checked={checks.route}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, route: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="route"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Rota /documents consolidada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Acesso via /documents ou /dashboard/documents funciona
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
                Upload e visualização funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload de documentos (PDF, DOCX) e preview operacionais
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
                <Eye className="inline h-4 w-4 mr-1" />
                Templates integrados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de templates acessível e funcional dentro do hub
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="duplication"
              checked={checks.duplication}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, duplication: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="duplication"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Copy className="inline h-4 w-4 mr-1" />
                Nenhuma duplicação detectada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Código limpo, sem módulos ou componentes duplicados
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
            ✅ Hub unificado e funcional para documentos e templates
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
