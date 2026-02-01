/**
 * AI Observability Page - Monitoramento de IA
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const metrics = [
  { label: "Latência Média", value: "124ms", status: "good" },
  { label: "Taxa de Erro", value: "0.3%", status: "good" },
  { label: "Requisições/min", value: "1,234", status: "good" },
  { label: "Tokens Usados", value: "2.4M", status: "warning" },
];

export default function AIObservabilityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Observabilidade IA</h2>
          <p className="text-muted-foreground">Monitoramento em tempo real dos sistemas de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.status === "good" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Processamento de documento #{1000 + i}</span>
                </div>
                <Badge variant="outline">Concluído</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
