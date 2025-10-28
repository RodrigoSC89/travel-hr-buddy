/**
 * PATCH 415 - Painel de Módulos Experimentais Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package, Filter, Activity, Link } from "lucide-react";
import { useState } from "react";

export default function ExperimentalModulesValidation() {
  const [checks, setChecks] = useState({
    modules: false,
    filters: false,
    stability: false,
    links: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            PATCH 415 - Painel de Módulos Experimentais
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do painel centralizado de módulos experimentais
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
              id="modules"
              checked={checks.modules}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, modules: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="modules"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Package className="inline h-4 w-4 mr-1" />
                Todos os 12 módulos listados
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel exibe os 12 módulos experimentais com informações completas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="filters"
              checked={checks.filters}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, filters: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="filters"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Filter className="inline h-4 w-4 mr-1" />
                Filtros por tag e status funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Filtros permitem buscar por tags, categorias e status de módulos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="stability"
              checked={checks.stability}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, stability: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="stability"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Activity className="inline h-4 w-4 mr-1" />
                Indicador de estabilidade correto
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Cada módulo mostra seu nível de estabilidade (alpha, beta, stable)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="links"
              checked={checks.links}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, links: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="links"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Link className="inline h-4 w-4 mr-1" />
                Links redirecionam para rota certa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Clicar em um módulo navega para a página/rota correta
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
            ✅ Painel completo com visão centralizada dos módulos experimentais
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
