/**
 * PATCH 416 - Crew Consolidado Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Smartphone, Database, Copy } from "lucide-react";
import { useState } from "react";

export default function CrewConsolidadoValidation() {
  const [checks, setChecks] = useState({
    route: false,
    responsive: false,
    data: false,
    duplication: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            PATCH 416 - Crew Consolidado
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do sistema unificado de gestão de tripulação
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
                <Users className="inline h-4 w-4 mr-1" />
                Rota única /crew válida
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Acesso via /crew funciona e é a única rota de tripulação
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="responsive"
              checked={checks.responsive}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, responsive: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="responsive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Smartphone className="inline h-4 w-4 mr-1" />
                UI responsiva completa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface adapta-se perfeitamente a desktop, tablet e mobile
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
                <Database className="inline h-4 w-4 mr-1" />
                Dados reais carregados (crew_members, etc.)
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema carrega e exibe dados reais do banco de dados
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="duplication"
              checked={checks.duplication}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, duplication: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="duplication"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Copy className="inline h-4 w-4 mr-1" />
                Nenhuma duplicação no registro
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Código limpo sem módulos ou componentes duplicados
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
            ✅ Gestão de tripulação operacional e unificada
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
