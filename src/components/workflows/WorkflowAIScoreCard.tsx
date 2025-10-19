"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkflowAISummary } from "@/_legacy/workflowAIMetrics";

export function WorkflowAIScoreCard() {
  const [summary, setSummary] = useState<{ total: number; aceitas: number; taxa: string } | null>(null);

  useEffect(() => {
    getWorkflowAISummary().then(setSummary);
  }, []);

  if (!summary) return null;

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
