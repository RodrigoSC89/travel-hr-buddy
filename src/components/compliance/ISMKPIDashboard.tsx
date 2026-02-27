/**
 * ISM KPI Dashboard — Per-Element Performance Analytics
 * Compliance trends, audit readiness, and element-level KPIs
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Cell
} from "recharts";
import {
  Shield, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, Target, Download, Activity
} from "lucide-react";

export function ISMKPIDashboard() {
  const { data: elements = [] } = useQuery({
    queryKey: ["ism_elements"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("ism_elements").select("*").order("element_number");
      if (error) throw error;
      return (data || []) as Array<Record<string, unknown>>;
    },
  });

  const { data: gaps = [] } = useQuery({
    queryKey: ["ism_gap_analysis"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("ism_gap_analysis").select("*");
      if (error) throw error;
      return (data || []) as Array<Record<string, unknown>>;
    },
  });

  const { data: capas = [] } = useQuery({
    queryKey: ["ism_capa"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("ism_capa").select("*");
      if (error) throw error;
      return (data || []) as Array<Record<string, unknown>>;
    },
  });

  // Bar chart data: score per element
  const barData = useMemo(() => {
    return elements.map(el => {
      const elGaps = gaps.filter(g => g.element_id === el.id);
      const avgScore = elGaps.length > 0
        ? Math.round(elGaps.reduce((s: number, g) => s + Number(g.compliance_score || 0), 0) / elGaps.length)
        : 0;
      const openCapas = capas.filter(c => c.element_id === el.id && ["open", "in_progress"].includes(String(c.status))).length;
      return {
        name: `E${el.element_number}`,
        fullName: String(el.title || ''),
        score: avgScore,
        capas: openCapas,
      };
    });
  }, [elements, gaps, capas]);

  // Radar chart data for top-level dimensions
  const radarData = useMemo(() => {
    const dimensions = [
      { name: "Política", elements: [1] },
      { name: "Responsabilidades", elements: [2, 3, 4] },
      { name: "Operações", elements: [5, 6, 7, 8] },
      { name: "Emergência", elements: [9] },
      { name: "Manutenção", elements: [10] },
      { name: "Documentação", elements: [11] },
      { name: "Auditoria", elements: [12, 13] },
    ];
    return dimensions.map(dim => {
      const dimElements = barData.filter(b => {
        const num = parseInt(b.name.replace("E", ""));
        return dim.elements.includes(num);
      });
      const avgScore = dimElements.length > 0
        ? Math.round(dimElements.reduce((s, e) => s + e.score, 0) / dimElements.length)
        : 0;
      return { subject: dim.name, score: avgScore, fullMark: 100 };
    });
  }, [barData]);

  // Overall stats
  const stats = useMemo(() => {
    const scores = barData.map(b => b.score).filter(s => s > 0);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const critical = barData.filter(b => b.score > 0 && b.score < 50).length;
    const auditReady = barData.filter(b => b.score >= 80).length;
    const totalCapas = capas.filter(c => ["open", "in_progress"].includes(String(c.status))).length;
    return { avg, critical, auditReady, totalCapas, assessed: scores.length, total: elements.length };
  }, [barData, capas, elements]);

  const getBarColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 50) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const exportCSV = () => {
    const header = "Elemento,Título,Score,CAPAs Abertas\n";
    const rows = barData.map(b => `${b.name},"${b.fullName}",${b.score},${b.capas}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ism-kpi-dashboard-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso");
  };

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Score Médio", value: `${stats.avg}%`, icon: Target, color: stats.avg >= 80 ? "text-success" : "text-warning" },
          { label: "Audit Ready", value: `${stats.auditReady}/${stats.total}`, icon: CheckCircle2, color: "text-success" },
          { label: "Elementos Críticos", value: stats.critical, icon: AlertTriangle, color: stats.critical > 0 ? "text-destructive" : "text-success" },
          { label: "CAPAs Abertas", value: stats.totalCapas, icon: Activity, color: stats.totalCapas > 0 ? "text-warning" : "text-success" },
          { label: "Cobertura", value: `${Math.round((stats.assessed / Math.max(stats.total, 1)) * 100)}%`, icon: BarChart3, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Per Element Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Score por Elemento ISM
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-3 w-3 mr-1" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(value: number, name: string) => [`${value}%`, "Score"]}
                  labelFormatter={(label) => {
                    const item = barData.find(b => b.name === label);
                    return item ? `${label}: ${item.fullName}` : label;
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart - Dimension Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Radar de Dimensões ISM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Table: Elements at Risk */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Elementos que Requerem Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {barData.filter(b => b.score < 80 && b.score > 0).sort((a, b) => a.score - b.score).map(el => (
              <div key={el.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">{el.name}</Badge>
                  <span className="font-medium text-sm">{el.fullName}</span>
                </div>
                <div className="flex items-center gap-4">
                  {el.capas > 0 && <Badge variant="secondary" className="text-[10px]">{el.capas} CAPAs</Badge>}
                  <div className="flex items-center gap-2 w-32">
                    <Progress value={el.score} className="h-2" />
                    <span className={`text-sm font-bold ${el.score >= 50 ? "text-warning" : "text-destructive"}`}>
                      {el.score}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {barData.filter(b => b.score < 80 && b.score > 0).length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 inline mr-2 text-success" />
                Todos os elementos avaliados estão acima de 80%
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
