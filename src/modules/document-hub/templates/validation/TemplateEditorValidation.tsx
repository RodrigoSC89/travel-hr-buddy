/**
 * PATCH 401 - Template Editor Validation
 * Validação do módulo de Editor de Templates
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileEdit, Download, Save, Zap } from "lucide-react";
import { useState } from "react";;;

export default function TemplateEditorValidation() {
  const [checks, setChecks] = useState({
    placeholder: false,
    pdfExport: false,
    saveTemplate: false,
    realtime: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileEdit className="h-8 w-8 text-primary" />
            PATCH 401 - Editor de Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do módulo de edição de templates com placeholders dinâmicos
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
              id="placeholder"
              checked={checks.placeholder}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, placeholder: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="placeholder"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Placeholder dinâmico inserido corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se placeholders {"{{"} variavel {"}}"} são inseridos e reconhecidos
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
                Exportação para PDF com dados reais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Exportar template preenchido e verificar se dados aparecem corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="saveTemplate"
              checked={checks.saveTemplate}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, saveTemplate: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="saveTemplate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Save className="inline h-4 w-4 mr-1" />
                Template salvo e reaplicado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Salvar template, fechar editor, reabrir e verificar persistência
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="realtime"
              checked={checks.realtime}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, realtime: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="realtime"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Zap className="inline h-4 w-4 mr-1" />
                Editor responde em tempo real
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Digitar texto e verificar atualização imediata da visualização
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
            ✅ Editor completo, responsivo e com exportação funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
