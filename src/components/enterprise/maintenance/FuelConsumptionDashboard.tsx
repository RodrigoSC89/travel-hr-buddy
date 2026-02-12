/**
 * FuelConsumptionDashboard - Real data from fuel_records + vessels
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, Ship, TrendingUp, DollarSign, Droplets, Gauge, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";
import { toast } from "sonner";

export function FuelConsumptionDashboard() {
  const [selectedVessel, setSelectedVessel] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["fuel-dashboard"],
    queryFn: async () => {
      const [fuelResult, vesselResult] = await Promise.all([
        supabase.from("fuel_records")
          .select("id, vessel_id, fuel_type, quantity_mt, price_per_mt, total_cost, rob_before, rob_after, bunkering_port, record_date, consumption_type")
          .order("record_date", { ascending: false }),
        supabase.from("vessels")
          .select("id, name, current_fuel_level, fuel_capacity, status")
          .order("name"),
      ]);
      if (fuelResult.error) throw fuelResult.error;
      if (vesselResult.error) throw vesselResult.error;
      return { fuelRecords: fuelResult.data || [], vessels: vesselResult.data || [] };
    },
    staleTime: 30000,
  });

  if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={`fuel-dash-skeleton-${i}`} className="h-24" />)}</div><Skeleton className="h-64" /></div>;

  const { fuelRecords = [], vessels = [] } = data || {};

  if (fuelRecords.length === 0 && vessels.length === 0) {
    return <EmptyState icon={Fuel} title="Sem dados de combustível" message="Registre operações de bunker e consumo para monitorar combustível da frota." />;
  }

  type FuelRecord = typeof fuelRecords[number];
  type VesselRecord = typeof vessels[number];
  const vesselMap = new Map(vessels.map((v: VesselRecord) => [v.id, v.name]));
  const totalConsumed = fuelRecords.reduce((sum: number, r: FuelRecord) => sum + (Number(r.quantity_mt) || 0), 0);
  const totalCost = fuelRecords.reduce((sum: number, r: FuelRecord) => sum + (Number(r.total_cost) || 0), 0);
  const totalROB = vessels.reduce((sum: number, v: VesselRecord) => sum + (Number(v.current_fuel_level) || 0), 0);
  const avgPrice = fuelRecords.length > 0
    ? fuelRecords.reduce((sum: number, r: FuelRecord) => sum + (Number(r.price_per_mt) || 0), 0) / fuelRecords.length
    : 0;

  // Group by fuel type for chart
  const fuelByType: Record<string, number> = {};
  fuelRecords.forEach((r: FuelRecord) => {
    const type = r.fuel_type || "Other";
    fuelByType[type] = (fuelByType[type] || 0) + (Number(r.quantity_mt) || 0);
  });
  const chartData = Object.entries(fuelByType).map(([type, qty]) => ({ type, quantity: Math.round(qty * 10) / 10 }));

  const exportCSV = () => {
    const headers = ["Data", "Embarcação", "Tipo", "Quantidade (MT)", "Preço/MT", "Custo Total", "Porto"];
    const rows = fuelRecords.map((r: FuelRecord) => [
      String(r.record_date ?? ""), r.vessel_id ? (vesselMap.get(r.vessel_id) || "N/A") : "N/A", String(r.fuel_type ?? ""), String(r.quantity_mt ?? ""), String(r.price_per_mt ?? ""), String(r.total_cost ?? ""), String(r.bunkering_port || "")
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fuel-report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Fuel className="h-6 w-6" />Gestão de Combustível</h2>
          <p className="text-muted-foreground">{fuelRecords.length} registros • {vessels.length} embarcações</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Embarcação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a Frota</SelectItem>
              {vessels.map((v: VesselRecord) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">ROB Total</p><p className="text-2xl font-bold">{totalROB.toLocaleString()} t</p></div><Droplets className="h-6 w-6 text-info" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Consumo Registrado</p><p className="text-2xl font-bold">{totalConsumed.toFixed(1)} MT</p></div><Fuel className="h-6 w-6 text-warning" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Preço Médio</p><p className="text-2xl font-bold">${avgPrice.toFixed(0)}/MT</p></div><Gauge className="h-6 w-6 text-success" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Custo Total</p><p className="text-2xl font-bold">${(totalCost / 1000).toFixed(0)}K</p></div><DollarSign className="h-6 w-6 text-accent-foreground" /></div></CardContent></Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Consumo por Tipo de Combustível (MT)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Quantidade (MT)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Embarcações</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vessels.map((v: VesselRecord) => {
              const robPct = v.fuel_capacity ? Math.round(((v.current_fuel_level || 0) / v.fuel_capacity) * 100) : null;
              return (
                <Card key={v.id} className="border-2">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{v.name}</h4>
                      <Badge variant="outline">{v.status}</Badge>
                    </div>
                    {robPct !== null && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">ROB</span>
                          <span className="font-medium">{v.current_fuel_level || 0} / {v.fuel_capacity} t</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${robPct < 25 ? "bg-destructive" : robPct < 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${robPct}%` }} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FuelConsumptionDashboard;
