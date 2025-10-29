/**
 * PATCH 478 - Crew Module Consolidation Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Trash2, CheckSquare, Smartphone } from "lucide-react";
import { useState } from "react";

export default function Patch478Validation() {
  const [checks, setChecks] = useState({
    removed: false,
    features: false,
    imports: false,
    noBreaks: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            PATCH 478 - Crew Module Consolidation
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação final do módulo de tripulação
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
              id="removed"
              checked={checks.removed}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, removed: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="removed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Trash2 className="inline h-4 w-4 mr-1" />
                crew-app/ removido
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Módulo duplicado crew-app/ totalmente removido do repositório
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="features"
              checked={checks.features}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, features: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="features"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckSquare className="inline h-4 w-4 mr-1" />
                Funcionalidades preservadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todas as funcionalidades do módulo mantidas e operacionais
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
                <Users className="inline h-4 w-4 mr-1" />
                Importações atualizadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os imports e referências corrigidos e funcionais
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="noBreaks"
              checked={checks.noBreaks}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, noBreaks: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="noBreaks"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Smartphone className="inline h-4 w-4 mr-1" />
                Sem quebras mobile/desktop
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface funcional em todos os dispositivos e resoluções
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
            ✅ Módulo crew consolidado com sucesso
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
