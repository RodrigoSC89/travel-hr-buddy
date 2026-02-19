/**
 * Fuel Quality Tracker - MARPOL Annex VI sulfur compliance
 * BDN tracking, lab analysis results, supplier quality ranking
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, Fuel, AlertTriangle, CheckCircle2, FlaskConical, Ship, Star } from "lucide-react";
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

const MOCK_SAMPLES: FuelSample[] = [
  { id: "1", vessel: "MV Explorer", port: "Rotterdam", supplier: "Shell Marine", fuelType: "VLSFO", sulfurContent: 0.42, sulfurLimit: 0.50, density: 0.965, viscosity: 135, waterContent: 0.03, bdnNumber: "BDN-2025-001", sampleDate: "2025-02-10", labResult: "pass", catFines: 12 },
  { id: "2", vessel: "MV Atlantic", port: "Singapore", supplier: "BP Marine", fuelType: "VLSFO", sulfurContent: 0.48, sulfurLimit: 0.50, density: 0.975, viscosity: 148, waterContent: 0.05, bdnNumber: "BDN-2025-002", sampleDate: "2025-02-05", labResult: "pass", catFines: 18 },
  { id: "3", vessel: "MV Pacific", port: "Fujairah", supplier: "ENOC", fuelType: "VLSFO", sulfurContent: 0.53, sulfurLimit: 0.50, density: 0.985, viscosity: 162, waterContent: 0.08, bdnNumber: "BDN-2025-003", sampleDate: "2025-01-28", labResult: "fail", catFines: 45 },
  { id: "4", vessel: "MV Explorer", port: "Houston", supplier: "Chevron", fuelType: "MGO", sulfurContent: 0.08, sulfurLimit: 0.10, density: 0.845, viscosity: 3.2, waterContent: 0.01, bdnNumber: "BDN-2025-004", sampleDate: "2025-01-20", labResult: "pass", catFines: 2 },
  { id: "5", vessel: "MV Atlantic", port: "Rotterdam", supplier: "Shell Marine", fuelType: "HFO", sulfurContent: 2.85, sulfurLimit: 3.50, density: 0.992, viscosity: 320, waterContent: 0.10, bdnNumber: "BDN-2025-005", sampleDate: "2025-01-15", labResult: "pass", catFines: 28 },
  { id: "6", vessel: "MV Pacific", port: "Piraeus", supplier: "Aegean Marine", fuelType: "VLSFO", sulfurContent: 0.49, sulfurLimit: 0.50, density: 0.970, viscosity: 140, waterContent: 0.04, bdnNumber: "BDN-2025-006", sampleDate: "2025-01-10", labResult: "pending", catFines: 15 },
];

export function FuelQualityTrackerTab() {
  const [samples] = useState(MOCK_SAMPLES);
  const [filterResult, setFilterResult] = useState("all");

  const { data: bunkerOps = [] } = useQuery({
    queryKey: ["bunker-ops-fuel-quality"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bunker_operations")
        .select("id, vessel_id, port, supplier, fuel_type, quantity_mt, sulfur_content, bdn_number, delivery_date")
        .order("delivery_date", { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    },
    staleTime: 120000,
  });

  const filtered = filterResult === "all" ? samples : samples.filter(s => s.labResult === filterResult);

  const stats = useMemo(() => {
    const passCount = samples.filter(s => s.labResult === "pass").length;
    const failCount = samples.filter(s => s.labResult === "fail").length;
    const pendingCount = samples.filter(s => s.labResult === "pending").length;
    const avgSulfur = samples.length > 0 ? samples.reduce((s, d) => s + d.sulfurContent, 0) / samples.length : 0;
    const avgCatFines = samples.length > 0 ? samples.reduce((s, d) => s + d.catFines, 0) / samples.length : 0;

    // Supplier ranking
    const supplierMap = new Map<string, { pass: number; fail: number; total: number; avgSulfur: number }>();
    samples.forEach(s => {
      const e = supplierMap.get(s.supplier) || { pass: 0, fail: 0, total: 0, avgSulfur: 0 };
      e.total++;
      if (s.labResult === "pass") e.pass++;
      if (s.labResult === "fail") e.fail++;
      e.avgSulfur += s.sulfurContent;
      supplierMap.set(s.supplier, e);
    });
    const supplierRanking = Array.from(supplierMap.entries())
      .map(([name, d]) => ({ name, score: Math.round((d.pass / d.total) * 100), avgSulfur: d.avgSulfur / d.total, samples: d.total }))
      .sort((a, b) => b.score - a.score);

    const sulfurChart = samples.map(s => ({
      name: `${s.vessel.replace("MV ", "")} (${s.port.substring(0, 4)})`,
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
        <CardHeader className="pb-2"><CardTitle className="text-sm">Lab Analysis Results</CardTitle></CardHeader>
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
                    <td className={`p-2 text-right font-mono ${s.sulfurContent > s.sulfurLimit ? "text-destructive font-bold" : ""}`}>{s.sulfurContent.toFixed(2)}</td>
                    <td className={`p-2 text-right font-mono ${s.catFines > 25 ? "text-warning" : ""}`}>{s.catFines}</td>
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
    </div>
  );
}
