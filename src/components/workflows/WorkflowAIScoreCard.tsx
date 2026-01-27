"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkflowAIScoreCard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['workflow-ai-metrics'],
    queryFn: async () => {
      // Fetch real AI decision metrics
      const { data: decisions, error } = await supabase
        .from('ai_decisions')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) {
        console.error('Error fetching AI metrics:', error);
        return { total: 0, aceitas: 0, taxa: "0" };
      }
      
      const total = decisions?.length || 0;
      const aceitas = decisions?.filter(d => d.status === 'executed' || d.status === 'approved').length || 0;
      const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : "0";
      
      return { total, aceitas, taxa };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

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
              <span className="text-sm font-medium">{summary?.total || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aceitas pelos usuários:</span>
              <span className="text-sm font-medium">{summary?.aceitas || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Adoção da IA:</span>
              <span className="text-sm font-medium">{summary?.taxa || "0"}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
