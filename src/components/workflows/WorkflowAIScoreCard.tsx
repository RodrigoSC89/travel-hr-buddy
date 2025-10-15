'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getWorkflowAISummary, WorkflowAISummary } from '@/lib/analytics/workflowAIMetrics';

export function WorkflowAIScoreCard() {
  const [summary, setSummary] = useState<WorkflowAISummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await getWorkflowAISummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching workflow AI summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold">IA no Controle (Workflow)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sugestões geradas</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.total}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Aceitas pelos usuários</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.aceitas}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Adoção da IA</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.taxa}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
