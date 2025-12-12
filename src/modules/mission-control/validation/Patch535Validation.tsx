/**
 * PATCH 535 - Consolidação de Missões Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FolderKanban, Layers, Database } from "lucide-react";
import { useState } from "react";;;

export default function Patch535Validation() {
  const [checks, setChecks] = useState({
    singleModule: false,
    submodules: false,
    migrationLogs: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-primary" />
            PATCH 535 - Consolidação de Missões
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação do módulo de controle de missões
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
                <FolderKanban className="inline h-4 w-4 mr-1" />
                Apenas 1 módulo ativo para controle de missões
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema consolidado em um único módulo mission-control
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="submodules"
              checked={checks.submodules}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, submodules: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="submodules"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Layers className="inline h-4 w-4 mr-1" />
                Submódulos visíveis e acessíveis
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Todos os submódulos estão organizados e funcionais
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="migrationLogs"
              checked={checks.migrationLogs}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, migrationLogs: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="migrationLogs"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Database className="inline h-4 w-4 mr-1" />
                Logs de migração preservados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Histórico de migração mantido e acessível
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
            ✅ Módulo mission-control consolidado, funcional e unificado
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
