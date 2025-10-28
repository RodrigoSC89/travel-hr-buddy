/**
 * PATCH 417 - Templates Editor Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Code, FileDown, Eye } from "lucide-react";
import { useState } from "react";

export default function TemplatesEditorValidation() {
  const [checks, setChecks] = useState({
    editor: false,
    placeholder: false,
    pdf: false,
    reusable: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 417 - Templates Editor
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do editor de templates dinâmicos
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
              id="editor"
              checked={checks.editor}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, editor: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="editor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Editor funcional e salvo no banco
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Editor permite criação e salvamento de templates no banco
              </p>
            </div>
          </div>

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
                <Code className="inline h-4 w-4 mr-1" />
                Placeholder dinâmico processado corretamente
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Variáveis {`{{var}}`} são substituídas corretamente por dados reais
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="pdf"
              checked={checks.pdf}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, pdf: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="pdf"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileDown className="inline h-4 w-4 mr-1" />
                Geração de PDF válida
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Templates geram PDFs corretamente com dados preenchidos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="reusable"
              checked={checks.reusable}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, reusable: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="reusable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Eye className="inline h-4 w-4 mr-1" />
                Templates reutilizáveis visíveis no Document Hub
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Templates salvos aparecem e podem ser reutilizados no Document Hub
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
            ✅ Editor 100% funcional para templates dinâmicos
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
