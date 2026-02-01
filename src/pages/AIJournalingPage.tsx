/**
 * AI Journaling Page - Registros de IA
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Brain, MessageSquare } from "lucide-react";

const entries = [
  { id: 1, title: "Análise semanal de frota", date: "01/02/2026", type: "analysis", summary: "Eficiência média de 94%" },
  { id: 2, title: "Previsão de manutenção", date: "31/01/2026", type: "prediction", summary: "3 equipamentos requerem atenção" },
  { id: 3, title: "Otimização de rotas", date: "30/01/2026", type: "optimization", summary: "Economia de 12% em combustível" },
  { id: 4, title: "Relatório de compliance", date: "29/01/2026", type: "compliance", summary: "98% de conformidade" },
];

export default function AIJournalingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Journaling IA</h2>
          <p className="text-muted-foreground">Registros históricos de insights e decisões de IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{entry.type}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {entry.date}
                </div>
              </div>
              <CardTitle className="mt-2">{entry.title}</CardTitle>
              <CardDescription>{entry.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="h-4 w-4" />
                <span>Gerado por IA</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
