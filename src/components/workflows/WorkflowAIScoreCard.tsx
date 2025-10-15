"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkflowAISummary } from "@/lib/analytics/workflowAIMetrics";

export function WorkflowAIScoreCard() {
  const [summary, setSummary] = useState<{ total: number; aceitas: number; taxa: string } | null>(null);

  useEffect(() => {
    getWorkflowAISummary().then(setSummary);
  }, []);

  if (!summary) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-xl">
            🤖
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            IA no Controle (Workflow)
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Sugestões geradas:
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {summary.total}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Aceitas pelos usuários:
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {summary.aceitas}
            </span>
          </div>
          
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adoção da IA:
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.taxa}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
