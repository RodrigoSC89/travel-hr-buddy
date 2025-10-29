import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function IncidentsConsolidationV2Validation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 473 – Incidents Consolidation</h1>
          <p className="text-muted-foreground">Validação de consolidação de relatórios de incidentes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Status da consolidação de incidentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Componente de validação criado</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Apenas incident-reports/ ativo - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Duplicações removidas - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>CRUD de incidentes funcionando - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Rotas e imports limpos - Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
