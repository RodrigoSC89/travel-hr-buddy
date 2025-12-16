"use client";

import { Card, CardContent } from "@/components/ui/card";

export function WorkflowAIScoreCard() {
  // Mock data for now - TODO: Implement real workflow AI metrics
  const summary = {
    total: 0,
    aceitas: 0,
    taxa: "0"
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🤖 IA no Controle (Workflow)
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sugestões geradas:</span>
              <span className="text-sm font-medium">{summary.total}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aceitas pelos usuários:</span>
              <span className="text-sm font-medium">{summary.aceitas}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Adoção da IA:</span>
              <span className="text-sm font-medium">{summary.taxa}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
