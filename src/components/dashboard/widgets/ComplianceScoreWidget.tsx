import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

export default function ComplianceScoreWidget() {
  const { data } = useQuery({
    queryKey: ["compliance-widget"],
    queryFn: async () => {
      const { count: total } = await supabase.from("compliance_items").select("id", { count: "exact", head: true });
      const { count: compliant } = await supabase.from("compliance_items").select("id", { count: "exact", head: true }).eq("status", "compliant");
      return { total: total || 0, compliant: compliant || 0 };
    },
    staleTime: 60_000,
  });

  const score = data && data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 100;

  return (
    <div className="space-y-2 text-center">
      <div className={`text-3xl font-bold ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`}>
        {score}%
      </div>
      <p className="text-xs text-muted-foreground">Compliance Score</p>
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-success" />
        {data?.compliant || 0} / {data?.total || 0} itens
      </div>
    </div>
  );
}
