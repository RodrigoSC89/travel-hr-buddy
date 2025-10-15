'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getWorkflowAISummary } from '@/lib/analytics/workflowAIMetrics';

export function WorkflowAIScoreCard() {
  const [summary, setSummary] = useState<{ total: number; aceitas: number; taxa: string } | null>(null);

  useEffect(() => {
    getWorkflowAISummary().then(setSummary);
  }, []);

  if (!summary) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-purple-900">
              IA no Controle (Workflow)
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Sugestões geradas:
              </span>
              <span className="text-xl font-bold text-purple-700">
                {summary.total}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Aceitas pelos usuários:
              </span>
              <span className="text-xl font-bold text-blue-700">
                {summary.aceitas}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-purple-200">
              <span className="text-sm font-medium text-purple-900">
                Adoção da IA:
              </span>
              <span className="text-2xl font-bold text-green-600">
                {summary.taxa}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
