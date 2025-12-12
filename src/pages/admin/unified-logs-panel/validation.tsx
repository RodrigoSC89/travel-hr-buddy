import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Filter, Download, Eye } from "lucide-react";
import { useState, useCallback } from "react";;;

export default function UnifiedLogsPanelValidationPage() {
  const [checks, setChecks] = useState({
    logsVisible: false,
    filters: false,
    export: false,
    watchdog: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            PATCH 413 - Unified Logs Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação da central unificada de logs
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
              id="logsVisible"
              checked={checks.logsVisible}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, logsVisible: checked as boolean })
              }
            />
            <div className="flex-1">
              <label htmlFor="logsVisible" className="text-sm font-medium cursor-pointer">
                <Eye className="inline h-4 w-4 mr-1" />
                Logs de acesso, AI e sistema visíveis
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Painel exibe logs de diferentes categorias de forma organizada
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
              <label htmlFor="filters" className="text-sm font-medium cursor-pointer">
                <Filter className="inline h-4 w-4 mr-1" />
                Filtros operacionais
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Filtros por tipo, data, severidade funcionando corretamente
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="export"
              checked={checks.export}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, export: checked as boolean })
              }
            />
            <div className="flex-1">
              <label htmlFor="export" className="text-sm font-medium cursor-pointer">
                <Download className="inline h-4 w-4 mr-1" />
                Exportação funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema exporta logs para CSV/JSON conforme seleção
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="watchdog"
              checked={checks.watchdog}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, watchdog: checked as boolean })
              }
            />
            <div className="flex-1">
              <label htmlFor="watchdog" className="text-sm font-medium cursor-pointer">
                <FileText className="inline h-4 w-4 mr-1" />
                Integração com Watchdog ativa
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Watchdog reporta logs para o painel unificado
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
            ✅ Central de logs funcional e acessível por admins
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
