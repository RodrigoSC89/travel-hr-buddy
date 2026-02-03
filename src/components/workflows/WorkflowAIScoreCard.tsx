"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export function WorkflowAIScoreCard() {
  // Fetch real data from workflow_ai_suggestions table
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["workflow-ai-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_ai_suggestions")
        .select("id, status, applied_at, created_at");
      
      if (error) throw error;
      
      const total = data?.length || 0;
      // "accepted" = applied_at is not null OR status is "applied"/"accepted"
      const aceitas = data?.filter(s => s.applied_at !== null || s.status === "applied" || s.status === "accepted").length || 0;
      const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : "0";
      
      return { total, aceitas, taxa };
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !summary) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma sugestão de IA registrada</p>
          </div>
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
