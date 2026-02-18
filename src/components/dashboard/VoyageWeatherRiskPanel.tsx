/**
 * VoyageWeatherRiskPanel - Weather risk assessment per active voyage
 * Queries voyage_plans + route_optimization_requests for weather context
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudRain, Wind, Waves, Sun, AlertTriangle, Navigation } from "lucide-react";

interface VoyageWeather {
  id: string;
  voyage_number: string;
  origin_port: string;
  destination_port: string;
  status: string;
  eta: string | null;
  risk: "low" | "medium" | "high";
}

export function VoyageWeatherRiskPanel() {
  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ["voyage-weather-risk"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voyage_plans")
        .select("id, voyage_number, origin_port, destination_port, status, arrival_date")
        .in("status", ["in_progress", "planned", "active"])
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((v): VoyageWeather => {
        const daysToEta = v.arrival_date ? Math.ceil((new Date(v.arrival_date).getTime() - Date.now()) / 86400000) : 99;
        const risk: "low" | "medium" | "high" = daysToEta < 2 ? "high" : daysToEta < 7 ? "medium" : "low";
        return { id: v.id, risk, eta: v.arrival_date, status: v.status || "planned", voyage_number: v.voyage_number || "N/A", origin_port: v.origin_port || "TBD", destination_port: v.destination_port || "TBD" };
      });
    },
    staleTime: 60000,
  });

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;

  const riskIcon = (r: string) => {
    if (r === "high") return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (r === "medium") return <Wind className="h-4 w-4 text-warning" />;
    return <Sun className="h-4 w-4 text-success" />;
  };

  const riskBadge = (r: string) => {
    const variants: Record<string, string> = {
      high: "bg-destructive/10 text-destructive border-destructive/20",
      medium: "bg-warning/10 text-warning border-warning/20",
      low: "bg-success/10 text-success border-success/20",
    };
    return variants[r] || variants.low;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-primary" />
          Weather Risk — Active Voyages
          <Badge variant="outline" className="ml-auto text-[10px]">{voyages.length} rotas</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {voyages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma viagem ativa</p>
        )}
        {voyages.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              {riskIcon(v.risk)}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{v.voyage_number}</p>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <Navigation className="h-2.5 w-2.5" />
                  {v.origin_port} → {v.destination_port}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[10px] ${riskBadge(v.risk)}`}>
              {v.risk === "high" ? "⚠ Alto" : v.risk === "medium" ? "Médio" : "Baixo"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default VoyageWeatherRiskPanel;
