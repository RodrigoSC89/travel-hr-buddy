import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIInsightsWidget() {
  const { data: insights = [] } = useQuery({
    queryKey: ["ai-insights-widget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("id, title, priority, category, confidence")
        .order("created_at", { ascending: false })
        .limit(4);
      return data || [];
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-foreground">{insights.length}</div>
        <Lightbulb className="h-4 w-4 text-amber-400" />
      </div>
      <p className="text-xs text-muted-foreground">Insights ativos</p>
      <div className="space-y-1.5 mt-2">
        {insights.map((i) => (
          <div key={i.id} className="text-xs space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="truncate max-w-[75%] font-medium">{i.title}</span>
              <Badge variant="outline" className="text-[10px]">{Math.round((i.confidence || 0) * 100)}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
