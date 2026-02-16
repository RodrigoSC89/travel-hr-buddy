import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Ship } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FleetStatusWidget() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["fleet-widget"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, status, vessel_type").limit(6);
      return data || [];
    },
    staleTime: 60_000,
  });

  const statusColors: Record<string, string> = {
    active: "bg-success/20 text-success border-success/30",
    maintenance: "bg-warning/20 text-warning border-warning/30",
    docked: "bg-primary/20 text-primary border-primary/30",
  };

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold text-foreground">{vessels.length}</div>
      <p className="text-xs text-muted-foreground">Embarcações registradas</p>
      <div className="space-y-1.5 mt-3">
        {vessels.slice(0, 4).map((v) => (
          <div key={v.id} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 truncate">
              <Ship className="h-3 w-3 text-primary" />
              {v.name}
            </span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5", statusColors[v.status || "active"] || statusColors.active)}>
              {v.status || "active"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
