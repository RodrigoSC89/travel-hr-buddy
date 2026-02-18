import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Fuel, TrendingDown, TrendingUp, Ship, Droplets } from "lucide-react";

export function FleetFuelEfficiencyTracker() {
  const { data: bunkerOps = [], isLoading } = useQuery({
    queryKey: ["fleet-fuel-efficiency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bunker_operations")
        .select("id, vessel_id, fuel_type, quantity_mt, sulfur_content, operation_date, operation_type")
        .order("operation_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ["fuel-efficiency-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const vesselMap = Object.fromEntries(vessels.map(v => [v.id, v.name]));

  // Fuel type breakdown
  const fuelBreakdown: Record<string, number> = {};
  let totalQty = 0;
  bunkerOps.forEach(op => {
    const ft = op.fuel_type || "Unknown";
    const qty = op.quantity_mt || 0;
    fuelBreakdown[ft] = (fuelBreakdown[ft] || 0) + qty;
    totalQty += qty;
  });
  const topFuels = Object.entries(fuelBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Sulfur compliance (MARPOL Annex VI: max 0.50%)
  const withSulfur = bunkerOps.filter(op => op.sulfur_content != null);
  const compliant = withSulfur.filter(op => (op.sulfur_content || 0) <= 0.5).length;
  const complianceRate = withSulfur.length > 0 ? Math.round((compliant / withSulfur.length) * 100) : 100;

  // Top consumers
  const vesselConsumption: Record<string, number> = {};
  bunkerOps.forEach(op => {
    if (op.vessel_id) {
      vesselConsumption[op.vessel_id] = (vesselConsumption[op.vessel_id] || 0) + (op.quantity_mt || 0);
    }
  });
  const topConsumers = Object.entries(vesselConsumption)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, qty]) => ({ name: vesselMap[id] || id.slice(0, 8), qty }));

  const maxConsumption = topConsumers[0]?.qty || 1;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Fuel className="h-4 w-4 text-warning" />
          Fleet Fuel Efficiency
          <Badge variant="outline" className="ml-auto text-xs">{totalQty.toFixed(0)} MT total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sulfur Compliance */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Droplets className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">MARPOL Annex VI (≤0.50% S)</span>
              <span className={`font-medium ${complianceRate >= 95 ? "text-success" : "text-destructive"}`}>{complianceRate}%</span>
            </div>
            <Progress value={complianceRate} className="h-1.5" />
          </div>
        </div>

        {/* Fuel Type Mix */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Combustíveis Utilizados</p>
          <div className="space-y-1.5">
            {topFuels.map(([type, qty]) => {
              const pct = totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-xs w-24 truncate text-muted-foreground">{type}</span>
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-16 text-right">{qty.toFixed(0)} MT</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Consumers */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Maiores Consumidores</p>
          <div className="space-y-2">
            {topConsumers.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <Ship className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs w-28 truncate">{v.name}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${(v.qty / maxConsumption) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{v.qty.toFixed(0)} MT</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FleetFuelEfficiencyTracker;
