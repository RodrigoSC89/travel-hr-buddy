import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Navigation } from "lucide-react";

export default function RoutePlannerV1Validation() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">PATCH 474 – Route Planner v1</h1>
          <p className="text-muted-foreground">Validação de planejador de rotas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Status da implementação do Route Planner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Componente de validação criado</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Interface criada (origem, destino) - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Rota persistida em planned_routes - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Visualização em mapa ok - Pendente</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-500" />
            <span>Layout mobile e desktop funcionando - Pendente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
