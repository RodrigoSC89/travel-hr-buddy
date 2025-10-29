import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Users } from "lucide-react";

export default function CrewModuleConsolidationValidation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 478 – Crew Module Consolidation</h1>
          <p className="text-muted-foreground">Validação de consolidação de módulos crew</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Status da consolidação dos módulos crew</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Componente de validação criado</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>crew-app/ removido - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Funcionalidades preservadas - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Importações atualizadas - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Sem quebras mobile/desktop - Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
