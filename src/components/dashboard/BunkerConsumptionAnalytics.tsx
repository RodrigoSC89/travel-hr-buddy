/**
 * BunkerConsumptionAnalytics - Fuel consumption analytics from bunker_operations + noon_reports
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Fuel, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

export function BunkerConsumptionAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["bunker-consumption-analytics"],
    queryFn: async () => {
      const [bunkerRes, noonRes] = await Promise.all([
        supabase.from("bunker_operations").select("fuel_type, quantity_mt, operation_type, operation_date").order("operation_date", { ascending: false }).limit(100),
        supabase.from("noon_reports").select("consumption_hfo, consumption_mdo, consumption_mgo, distance_run, report_date").order("report_date", { ascending: false }).limit(50),
      ]);

      const bunkers = bunkerRes.data || [];
      const noons = noonRes.data || [];

      // Fuel type breakdown
      const fuelTypes: Record<string, number> = {};
      bunkers.forEach((b) => {
        const t = b.fuel_type || "Unknown";
        fuelTypes[t] = (fuelTypes[t] || 0) + (b.quantity_mt || 0);
      });

      // Efficiency from noon reports
      const totalFuel = noons.reduce((s, n) => s + (n.consumption_hfo || 0) + (n.consumption_mdo || 0) + (n.consumption_mgo || 0), 0);
      const totalDistance = noons.reduce((s, n) => s + (n.distance_run || 0), 0);
      const efficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;

      const totalBunkered = bunkers.filter(b => b.operation_type === 'bunkering').reduce((s, b) => s + (b.quantity_mt || 0), 0);

      return { fuelTypes, efficiency, totalBunkered, totalFuel, totalDistance, reportsCount: noons.length };
    },
    staleTime: 120000,
  });

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
  if (!data) return null;

  const fuelEntries = Object.entries(data.fuelTypes).sort((a, b) => b[1] - a[1]);
  const maxFuel = fuelEntries[0]?.[1] || 1;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Fuel className="h-4 w-4 text-primary" />
          Bunker & Consumption Analytics
          <Badge variant="outline" className="ml-auto text-[10px]">{data.reportsCount} reports</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-primary">{data.totalBunkered.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">MT Bunkered</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-lg font-bold text-foreground">{data.totalDistance.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">NM Sailed</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${data.efficiency < 0.1 ? "text-success" : "text-warning"}`}>
              {data.efficiency > 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {data.efficiency.toFixed(3)}
            </p>
            <p className="text-[10px] text-muted-foreground">MT/NM</p>
          </div>
        </div>

        {/* Fuel type breakdown bars */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Fuel Type Breakdown</p>
          {fuelEntries.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Nenhuma operação de bunker registrada</p>
          )}
          {fuelEntries.slice(0, 5).map(([type, qty]) => (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium">{type}</span>
                <span className="text-muted-foreground">{qty.toFixed(1)} MT</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all"
                  style={{ width: `${(qty / maxFuel) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default BunkerConsumptionAnalytics;
