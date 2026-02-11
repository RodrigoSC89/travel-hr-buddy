/**
 * ESGEmissionsDashboard - Real data from emissions_records, cii_ratings, vessels
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, TrendingDown, Ship, AlertTriangle, Target, BarChart3, Globe, FileText, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";
import { toast } from "sonner";

interface EmissionRecord {
  id: string;
  vessel_id: string | null;
  recorded_date: string | null;
  co2_tonnes: number | null;
  nox_kg: number | null;
  sox_kg: number | null;
  fuel_consumed_mt: number | null;
  distance_nm: number | null;
  carbon_intensity: number | null;
}

interface CIIRating {
  id: string;
  vessel_id: string | null;
  year: number | null;
  attained_cii: number | null;
  required_cii: number | null;
  rating: string | null;
  annual_co2_tonnes: number | null;
  annual_distance_nm: number | null;
}

interface VesselBasic {
  id: string;
  name: string;
  imo_number: string | null;
}

const ciiColors: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-success", text: "text-primary-foreground", label: "Superior" },
  B: { bg: "bg-success/80", text: "text-primary-foreground", label: "Menor" },
  C: { bg: "bg-warning", text: "text-warning-foreground", label: "Moderado" },
  D: { bg: "bg-warning/80", text: "text-primary-foreground", label: "Inferior" },
  E: { bg: "bg-destructive", text: "text-destructive-foreground", label: "Muito Inferior" },
};

export function ESGEmissionsDashboard() {
  const [selectedVessel, setSelectedVessel] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["esg-dashboard"],
    queryFn: async () => {
      const [emResult, ciiResult, vesResult] = await Promise.all([
        supabase.from("emissions_records")
          .select("id, vessel_id, recorded_date, co2_tonnes, nox_kg, sox_kg, fuel_consumed_mt, distance_nm, carbon_intensity")
          .order("recorded_date", { ascending: false }),
        supabase.from("cii_ratings")
          .select("id, vessel_id, year, attained_cii, required_cii, rating, annual_co2_tonnes, annual_distance_nm")
          .order("year", { ascending: false }),
        supabase.from("vessels").select("id, name, imo_number").order("name"),
      ]);
      if (emResult.error) throw emResult.error;
      if (ciiResult.error) throw ciiResult.error;
      if (vesResult.error) throw vesResult.error;
      return {
        emissions: (emResult.data || []) as EmissionRecord[],
        ciiRatings: (ciiResult.data || []) as CIIRating[],
        vessels: (vesResult.data || []) as VesselBasic[],
      };
    },
    staleTime: 30000,
  });

  if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64" /></div>;

  const { emissions = [], ciiRatings = [], vessels = [] } = data || {};
  const vesselMap = new Map(vessels.map((v) => [v.id, v.name]));

  if (emissions.length === 0 && ciiRatings.length === 0) {
    return <EmptyState icon={Leaf} title="Sem dados de emissões" message="Registre emissões e ratings CII para monitorar o desempenho ESG da frota." />;
  }

  const totalCO2 = emissions.reduce((sum, r) => sum + (Number(r.co2_tonnes) || 0), 0);
  const totalSOx = emissions.reduce((sum, r) => sum + (Number(r.sox_kg) || 0), 0);
  const totalNOx = emissions.reduce((sum, r) => sum + (Number(r.nox_kg) || 0), 0);
  const compliantVessels = ciiRatings.filter((c) => ["A", "B", "C"].includes(c.rating || "")).length;

  // Group emissions by month for chart
  const byMonth: Record<string, { co2: number; sox: number; nox: number }> = {};
  emissions.forEach((r) => {
    const month = r.recorded_date ? r.recorded_date.substring(0, 7) : "?";
    if (!byMonth[month]) byMonth[month] = { co2: 0, sox: 0, nox: 0 };
    byMonth[month].co2 += Number(r.co2_tonnes) || 0;
    byMonth[month].sox += Number(r.sox_kg) || 0;
    byMonth[month].nox += Number(r.nox_kg) || 0;
  });
  const trendData = Object.entries(byMonth).sort().slice(-12).map(([m, v]) => ({ month: m, co2: Math.round(v.co2), sox: Math.round(v.sox), nox: Math.round(v.nox) }));

  const exportCSV = () => {
    const headers = ["Data", "Embarcação", "CO2 (t)", "SOx (kg)", "NOx (kg)", "Combustível (MT)", "Distância (nm)"];
    const rows = emissions.map((r) => [r.recorded_date, vesselMap.get(r.vessel_id || "") || "N/A", r.co2_tonnes, r.sox_kg, r.nox_kg, r.fuel_consumed_mt, r.distance_nm]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "esg-emissions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório ESG exportado");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6 text-success" />ESG & Emissões</h2>
          <p className="text-muted-foreground">{emissions.length} registros • {ciiRatings.length} ratings CII</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Embarcação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda a Frota</SelectItem>
              {vessels.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success"><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">CO2 Total</p><p className="text-2xl font-bold">{totalCO2.toFixed(1)} t</p></div><Globe className="h-6 w-6 text-success" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-warning"><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">SOx Total</p><p className="text-2xl font-bold">{totalSOx.toFixed(0)} kg</p></div><BarChart3 className="h-6 w-6 text-warning" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-destructive"><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">NOx Total</p><p className="text-2xl font-bold">{totalNOx.toFixed(0)} kg</p></div><AlertTriangle className="h-6 w-6 text-destructive" /></div></CardContent></Card>
        <Card className="border-l-4 border-l-success"><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">CII Compliant</p><p className="text-2xl font-bold">{compliantVessels}/{ciiRatings.length}</p></div><Ship className="h-6 w-6 text-success" /></div></CardContent></Card>
      </div>

      {/* CII Ratings */}
      {ciiRatings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Rating CII por Embarcação</CardTitle><CardDescription>Carbon Intensity Indicator - Regulamento IMO</CardDescription></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ciiRatings.map((cii) => {
                const colors = ciiColors[cii.rating || "C"] || ciiColors.C;
                return (
                  <Card key={cii.id} className="border-2">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{vesselMap.get(cii.vessel_id || "") || "N/A"}</h4>
                          <p className="text-xs text-muted-foreground">Ano {cii.year}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                          <span className={`text-xl font-bold ${colors.text}`}>{cii.rating}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">CII Attained</span>
                            <span className="font-medium">{Number(cii.attained_cii).toFixed(1)}</span>
                          </div>
                          <Progress value={cii.required_cii ? (Number(cii.attained_cii) / Number(cii.required_cii)) * 100 : 50} />
                          <p className="text-xs text-muted-foreground mt-1">Required: ≤{Number(cii.required_cii).toFixed(1)}</p>
                        </div>
                        {cii.annual_co2_tonnes && (
                          <p className="text-xs text-muted-foreground">CO2 Anual: {Number(cii.annual_co2_tonnes).toLocaleString()} t</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emissions Trend */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Tendência de Emissões</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="co2" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="CO2 (t)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* CII Scale */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Escala CII Rating - IMO</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2">
            {Object.entries(ciiColors).map(([rating, config]) => (
              <div key={rating} className="flex flex-col items-center">
                <div className={`h-12 w-12 rounded-lg ${config.bg} flex items-center justify-center mb-2`}>
                  <span className={`text-xl font-bold ${config.text}`}>{rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ESGEmissionsDashboard;