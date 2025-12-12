/**
 * PATCH 402 - Documents Consolidation Validation
 * Validação da consolidação de documentos em módulo único
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FolderTree, Link, FileText, BookOpen } from "lucide-react";
import { useState } from "react";;;

export default function DocumentsConsolidationValidation() {
  const [checks, setChecks] = useState({
    access: false,
    imports: false,
    singleDirectory: false,
    documentation: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderTree className="h-8 w-8 text-primary" />
            PATCH 402 - Consolidação Documentos
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação de módulos de documentos em document-hub único
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
              id="access"
              checked={checks.access}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, access: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="access"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Acesso a documentos mantido após consolidação
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se todos os documentos continuam acessíveis via document-hub
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="imports"
              checked={checks.imports}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, imports: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="imports"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Link className="inline h-4 w-4 mr-1" />
                Nenhum import quebrado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Executar build e verificar que não há erros de importação
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="singleDirectory"
              checked={checks.singleDirectory}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, singleDirectory: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="singleDirectory"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FolderTree className="inline h-4 w-4 mr-1" />
                Diretório único e limpo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmar que existe apenas src/modules/documents/document-hub
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="documentation"
              checked={checks.documentation}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, documentation: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="documentation"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <BookOpen className="inline h-4 w-4 mr-1" />
                Documentação criada e linkada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Verificar se DOCUMENTS_CONSOLIDATION.md existe e está atualizado
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
            ✅ Tudo funcionando via único módulo document-hub sem regressões
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
