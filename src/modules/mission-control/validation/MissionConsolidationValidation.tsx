/**
 * PATCH 430 - Consolidação de Missões Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FolderTree, GitMerge, Navigation, CheckCheck } from "lucide-react";
import { useState } from "react";;;

export default function MissionConsolidationValidation() {
  const [checks, setChecks] = useState({
    route: false,
    duplicates: false,
    navigation: false,
    features: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GitMerge className="h-8 w-8 text-primary" />
            PATCH 430 - Consolidação de Missões
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da estrutura unificada do sistema de missões
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
                <FolderTree className="inline h-4 w-4 mr-1" />
                Rota única ativa (/mission-engine/)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema usa rota consolidada /mission-engine/ para todas as operações
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="duplicates"
              checked={checks.duplicates}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, duplicates: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="duplicates"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <CheckCheck className="inline h-4 w-4 mr-1" />
                Sem entradas duplicadas no registry
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Registry de módulos não contém duplicatas ou referências obsoletas
              </p>
            </div>
          </div>

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
                Navegação atualizada
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Menus e links internos apontam para a rota consolidada
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
                <CheckCircle2 className="inline h-4 w-4 mr-1" />
                Todas funcionalidades anteriores ativas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Recursos existentes continuam funcionando após consolidação
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
            ✅ Estrutura de missão unificada e sem redundância
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
