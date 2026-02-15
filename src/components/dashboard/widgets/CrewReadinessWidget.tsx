import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CrewReadinessWidget() {
  const { data } = useQuery({
    queryKey: ["crew-readiness-widget"],
    queryFn: async () => {
      const { count: total } = await supabase.from("crew_members").select("id", { count: "exact", head: true });
      const { count: active } = await supabase.from("crew_members").select("id", { count: "exact", head: true }).eq("status", "active");
      return { total: total || 0, active: active || 0 };
    },
    staleTime: 60_000,
  });

  const readiness = data && data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="text-2xl font-bold text-foreground">{data?.total || 0}</div>
      <p className="text-xs text-muted-foreground">Tripulantes totais</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Prontidão</span>
          <span className="font-medium">{readiness}%</span>
        </div>
        <Progress value={readiness} className="h-2" />
      </div>
      <p className="text-xs text-muted-foreground">{data?.active || 0} ativos / {data?.total || 0} total</p>
    </div>
  );
}
