/**
 * Fuel Quality Tracker - MARPOL Annex VI sulfur compliance
 * Connected to bunker_operations for real BDN/fuel data
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, Fuel, AlertTriangle, CheckCircle2, FlaskConical, Ship, Star, Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FuelSample {
  id: string;
  vessel: string;
  port: string;
  supplier: string;
  fuelType: string;
  sulfurContent: number;
  sulfurLimit: number;
  density: number;
  viscosity: number;
  waterContent: number;
  bdnNumber: string;
  sampleDate: string;
  labResult: "pass" | "fail" | "pending";
  catFines: number;
}

function getSulfurLimit(fuelType: string): number {
  const t = (fuelType || "").toUpperCase();
  if (t.includes("MGO") || t.includes("MDO")) return 0.10;
  if (t.includes("HFO")) return 3.50;
  return 0.50; // VLSFO default
}

export function FuelQualityTrackerTab() {
  const [filterResult, setFilterResult] = useState("all");

  const { data: bunkerOps = [], isLoading } = useQuery({
    queryKey: ["bunker-ops-fuel-quality"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bunker_operations")
        .select("id, vessel_id, port, supplier, fuel_type, quantity_mt, sulfur_content, bdn_number, delivery_date, metadata")
        .order("delivery_date", { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch vessel names for display
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-fuel-quality"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").limit(100);
      if (error) return [];
      return data || [];
    },
    staleTime: 300000,
  });

  const vesselMap = useMemo(() => {
    const map = new Map<string, string>();
    vessels.forEach((v: any) => map.set(v.id, v.name));
    return map;
  }, [vessels]);

  // Map bunker_operations to FuelSample
  const samples: FuelSample[] = useMemo(() => {
    return bunkerOps.map((op: any) => {
      const sulfurContent = op.sulfur_content || 0;
      const fuelType = op.fuel_type || "VLSFO";
      const sulfurLimit = getSulfurLimit(fuelType);
      const meta = (op.metadata as any) || {};

      let labResult: "pass" | "fail" | "pending" = "pending";
      if (sulfurContent > 0) {
        labResult = sulfurContent <= sulfurLimit ? "pass" : "fail";
      }

      return {
        id: op.id,
        vessel: vesselMap.get(op.vessel_id) || op.vessel_id || "N/A",
        port: op.port || "N/A",
        supplier: op.supplier || "N/A",
        fuelType,
        sulfurContent,
        sulfurLimit,
        density: meta.density || 0,
        viscosity: meta.viscosity || 0,
        waterContent: meta.water_content || 0,
        bdnNumber: op.bdn_number || "N/A",
        sampleDate: op.delivery_date || "",
        labResult,
        catFines: meta.cat_fines || 0,
      };
    });
  }, [bunkerOps, vesselMap]);

  const filtered = filterResult === "all" ? samples : samples.filter(s => s.labResult === filterResult);

  const stats = useMemo(() => {
    const passCount = samples.filter(s => s.labResult === "pass").length;
    const failCount = samples.filter(s => s.labResult === "fail").length;
    const pendingCount = samples.filter(s => s.labResult === "pending").length;
    const withSulfur = samples.filter(s => s.sulfurContent > 0);
    const avgSulfur = withSulfur.length > 0 ? withSulfur.reduce((s, d) => s + d.sulfurContent, 0) / withSulfur.length : 0;
    const avgCatFines = samples.length > 0 ? samples.reduce((s, d) => s + d.catFines, 0) / samples.length : 0;

    // Supplier ranking
    const supplierMap = new Map<string, { pass: number; fail: number; total: number; avgSulfur: number }>();
    samples.filter(s => s.supplier !== "N/A").forEach(s => {
      const e = supplierMap.get(s.supplier) || { pass: 0, fail: 0, total: 0, avgSulfur: 0 };
      e.total++;
      if (s.labResult === "pass") e.pass++;
      if (s.labResult === "fail") e.fail++;
      e.avgSulfur += s.sulfurContent;
      supplierMap.set(s.supplier, e);
    });
    const supplierRanking = Array.from(supplierMap.entries())
      .map(([name, d]) => ({ name, score: d.total > 0 ? Math.round((d.pass / d.total) * 100) : 0, avgSulfur: d.total > 0 ? d.avgSulfur / d.total : 0, samples: d.total }))
      .sort((a, b) => b.score - a.score);

    const sulfurChart = samples.slice(0, 10).map(s => ({
      name: `${s.vessel.replace("MV ", "").substring(0, 8)} (${s.port.substring(0, 4)})`,
      sulfur: s.sulfurContent,
      limit: s.sulfurLimit,
      pass: s.sulfurContent <= s.sulfurLimit,
    }));

    return { passCount, failCount, pendingCount, avgSulfur, avgCatFines, supplierRanking, sulfurChart };
  }, [samples]);

  const exportCSV = () => {
    const header = "Vessel,Port,Supplier,Fuel Type,Sulfur %,Limit %,BDN,Date,Result,Cat Fines\n";
    const rows = samples.map(s => `"${s.vessel}","${s.port}","${s.supplier}",${s.fuelType},${s.sulfurContent},${s.sulfurLimit},${s.bdnNumber},${s.sampleDate},${s.labResult},${s.catFines}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "fuel_quality.csv"; a.click();
    toast.success("CSV exportado!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados de bunker...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <CheckCircle2 className="h-4 w-4 mx-auto text-success mb-1" />
          <div className="text-xl font-bold text-success">{stats.passCount}</div>
          <div className="text-[10px] text-muted-foreground">Pass</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto text-destructive mb-1" />
          <div className="text-xl font-bold text-destructive">{stats.failCount}</div>
          <div className="text-[10px] text-muted-foreground">Fail</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <FlaskConical className="h-4 w-4 mx-auto text-warning mb-1" />
          <div className="text-xl font-bold text-warning">{stats.pendingCount}</div>
          <div className="text-[10px] text-muted-foreground">Pending</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Fuel className="h-4 w-4 mx-auto text-primary mb-1" />
          <div className="text-xl font-bold">{stats.avgSulfur.toFixed(2)}%</div>
          <div className="text-[10px] text-muted-foreground">Avg Sulfur</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto text-warning mb-1" />
          <div className="text-xl font-bold">{stats.avgCatFines.toFixed(0)}</div>
          <div className="text-[10px] text-muted-foreground">Avg Cat Fines (ppm)</div>
        </CardContent></Card>
      </div>

      {samples.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Fuel className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma operação de bunker registrada</p>
            <p className="text-sm mt-1">Dados de qualidade de combustível serão exibidos aqui a partir de <code>bunker_operations</code></p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sulfur Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Sulfur Content vs Limit</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />CSV</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.sulfurChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="sulfur" name="Sulfur %" radius={[4, 4, 0, 0]}>
                      {stats.sulfurChart.map((entry, i) => (
                        <Cell key={i} fill={entry.pass ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                      ))}
                    </Bar>
                    <Bar dataKey="limit" name="Limit %" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Supplier Ranking */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-warning" />Supplier Ranking</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stats.supplierRanking.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados de fornecedores</p>
                )}
                {stats.supplierRanking.map((sup, i) => (
                  <div key={sup.name} className="flex items-center gap-2 p-2 rounded border bg-muted/20">
                    <Badge variant="outline" className="font-mono w-6 h-6 flex items-center justify-center text-xs">{i + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{sup.name}</div>
                      <div className="text-[10px] text-muted-foreground">{sup.samples} samples • Avg S: {sup.avgSulfur.toFixed(2)}%</div>
                    </div>
                    <Badge className={sup.score >= 80 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>{sup.score}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sample Table */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Lab Analysis Results ({filtered.length} registros)</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Vessel</th>
                      <th className="text-left p-2 font-medium">Port</th>
                      <th className="text-left p-2 font-medium">Supplier</th>
                      <th className="text-left p-2 font-medium">Fuel</th>
                      <th className="text-right p-2 font-medium">Sulfur %</th>
                      <th className="text-right p-2 font-medium">Cat Fines</th>
                      <th className="text-left p-2 font-medium">BDN</th>
                      <th className="text-center p-2 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map(s => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="p-2 flex items-center gap-1"><Ship className="h-3 w-3 text-muted-foreground" />{s.vessel}</td>
                        <td className="p-2">{s.port}</td>
                        <td className="p-2">{s.supplier}</td>
                        <td className="p-2"><Badge variant="outline" className="text-[10px]">{s.fuelType}</Badge></td>
                        <td className={`p-2 text-right font-mono ${s.sulfurContent > s.sulfurLimit ? "text-destructive font-bold" : ""}`}>{s.sulfurContent > 0 ? s.sulfurContent.toFixed(2) : "—"}</td>
                        <td className={`p-2 text-right font-mono ${s.catFines > 25 ? "text-warning" : ""}`}>{s.catFines || "—"}</td>
                        <td className="p-2 font-mono text-xs">{s.bdnNumber}</td>
                        <td className="p-2 text-center">
                          <Badge className={s.labResult === "pass" ? "bg-success/20 text-success" : s.labResult === "fail" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}>
                            {s.labResult}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
