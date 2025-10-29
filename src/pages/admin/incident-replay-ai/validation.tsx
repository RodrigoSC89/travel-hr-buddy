import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function IncidentReplayAIValidation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 472 – Incident Replay AI</h1>
          <p className="text-muted-foreground">Validação de análise de incidentes com IA</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Status da implementação do Incident Replay AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Componente de validação criado</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Timeline de incidentes acessível - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>IA sugere causas prováveis - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>PDF gerado sem erros - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Testado com 3+ incidentes reais - Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
