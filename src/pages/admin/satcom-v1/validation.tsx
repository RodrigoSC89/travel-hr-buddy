import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Satellite } from "lucide-react";

export default function SatcomV1Validation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Satellite className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 476 – SATCOM v1</h1>
          <p className="text-muted-foreground">Validação de sistema de comunicação satélite</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Status da implementação do SATCOM v1</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Componente de validação criado</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Tabela satcom_logs funcional - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Simulação de status online/offline ok - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>UI reflete latência ou falha - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Dashboard atualizado - Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
