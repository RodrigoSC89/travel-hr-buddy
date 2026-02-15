import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock } from "lucide-react";

export default function CertificatesWidget() {
  const { data } = useQuery({
    queryKey: ["certificates-widget"],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { count } = await supabase
        .from("certificates")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .lte("expiry_date", thirtyDaysFromNow.toISOString());

      return count || 0;
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-2 text-center">
      <div className={`text-3xl font-bold ${(data || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
        {data || 0}
      </div>
      <p className="text-xs text-muted-foreground">Vencendo em 30 dias</p>
      <div className="flex items-center justify-center gap-1 text-xs">
        {(data || 0) > 0 ? (
          <><AlertTriangle className="h-3 w-3 text-amber-400" /> Ação necessária</>
        ) : (
          <><Clock className="h-3 w-3 text-emerald-400" /> Tudo em dia</>
        )}
      </div>
    </div>
  );
}
