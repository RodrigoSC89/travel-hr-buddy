/**
 * PATCH 462 - Consolidação dos Módulos de Missão Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FolderKanban, History, Database, Navigation } from "lucide-react";
import { useState } from "react";;;

export default function Patch462Validation() {
  const [checks, setChecks] = useState({
    unified: false,
    control: false,
    logs: false,
    navigation: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-primary" />
            PATCH 462 - Consolidação dos Módulos de Missão
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da unificação dos módulos de missão
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
              id="unified"
              checked={checks.unified}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, unified: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="unified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FolderKanban className="inline h-4 w-4 mr-1" />
                Apenas 1 módulo de missão ativo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Módulos duplicados removidos, estrutura unificada
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="control"
              checked={checks.control}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, control: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="control"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <History className="inline h-4 w-4 mr-1" />
                Histórico + controle funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de histórico e controle de missões operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="logs"
              checked={checks.logs}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logs: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="logs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Logs unificados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de logs consolidado em uma única estrutura
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
                Navegação limpa e funcional
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface de navegação sem links quebrados ou duplicados
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
            ✅ Módulos de missão consolidados e operantes
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
