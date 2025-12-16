/**
 * PATCH 444 - Unificação Documents Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Upload, Navigation, Layout } from "lucide-react";
import { useState } from "react";

export default function DocumentsUnificationValidation() {
  const [checks, setChecks] = useState({
    unified: false,
    upload: false,
    routes: false,
    ui: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 444 - Unificação Documents
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da consolidação do módulo de documentos
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
                <FileText className="inline h-4 w-4 mr-1" />
                Apenas um módulo de documentos
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Módulos duplicados removidos, apenas um módulo unificado ativo
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="upload"
              checked={checks.upload}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, upload: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="upload"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Upload className="inline h-4 w-4 mr-1" />
                Upload e parsing funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de upload e processamento de documentos operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="routes"
              checked={checks.routes}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, routes: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="routes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Navigation className="inline h-4 w-4 mr-1" />
                Rotas atualizadas
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Rotas consolidadas e redirecionamentos corretos
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
                <Layout className="inline h-4 w-4 mr-1" />
                UI sem redundância
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Interface unificada, sem elementos duplicados
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
            ✅ Gestão de documentos consolidada e funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
