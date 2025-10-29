/**
 * PATCH 466 - Crew Consolidation Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Calendar, Award, FileCheck } from "lucide-react";
import { useState } from "react";

export default function Patch466Validation() {
  const [checks, setChecks] = useState({
    singleModule: false,
    flows: false,
    ui: false,
    noDuplicates: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            PATCH 466 - Crew Consolidation
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação do módulo de crew
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
                <FileCheck className="inline h-4 w-4 mr-1" />
                Apenas crew/ presente no repo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Módulo único consolidado sem duplicações
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="flows"
              checked={checks.flows}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, flows: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="flows"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                Todos fluxos testados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Cadastro, escala e certificação funcionando corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="ui"
              checked={checks.ui}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, ui: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="ui"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Award className="inline h-4 w-4 mr-1" />
                UI e rotas ativas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface e navegação totalmente funcionais
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="noDuplicates"
              checked={checks.noDuplicates}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, noDuplicates: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="noDuplicates"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Users className="inline h-4 w-4 mr-1" />
                Duplicações removidas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Nenhum módulo ou rota duplicada restante
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
            ✅ Módulo crew consolidado e funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
