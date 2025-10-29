/**
 * PATCH 460 - Consolidação Documents + Crew Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Users, Link, CheckCheck } from "lucide-react";
import { useState } from "react";

export default function Patch460Validation() {
  const [checks, setChecks] = useState({
    module: false,
    data: false,
    references: false,
    functionality: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckCheck className="h-8 w-8 text-primary" />
            PATCH 460 - Consolidação Documents + Crew
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação de módulos duplicados
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
              id="module"
              checked={checks.module}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, module: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="module"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Apenas 1 módulo por tema
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sem módulos duplicados - apenas uma versão de cada funcionalidade
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
                <Users className="inline h-4 w-4 mr-1" />
                Dados íntegros
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os dados migrados e acessíveis após consolidação
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="references"
              checked={checks.references}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, references: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="references"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Link className="inline h-4 w-4 mr-1" />
                Sem referências quebradas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as importações e rotas atualizadas corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="functionality"
              checked={checks.functionality}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, functionality: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="functionality"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckCheck className="inline h-4 w-4 mr-1" />
                Funcionalidade total mantida
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as funcionalidades anteriores funcionando após consolidação
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
            ✅ Consolidação completa sem perda de dados
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
