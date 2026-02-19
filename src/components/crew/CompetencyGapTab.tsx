/**
 * Crew Competency Gap Analysis Tab
 * Enhanced version for crew management with training recommendations
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GraduationCap, AlertCircle, CheckCircle2, Clock, Award,
  ShieldAlert, Download, Users, BookOpen, Target
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const levelToNum = (level: string | null): number => {
  if (!level) return 0;
  const map: Record<string, number> = { none: 0, basic: 1, intermediate: 2, advanced: 3, expert: 4 };
  return map[level.toLowerCase()] ?? (parseInt(level) || 0);
};

export function CompetencyGapTab() {
  const [filter, setFilter] = useState("all");

  const { data: certifications = [] } = useQuery({
    queryKey: ["crew-certs-gap-tab"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, expiry_date, status")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const { data: competencies = [] } = useQuery({
    queryKey: ["crew-competency-gap-tab"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_competency_matrix")
        .select("id, crew_member_id, competency_name, current_level, required_level, assessment_date")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const expired = certifications.filter(c => c.expiry_date && new Date(c.expiry_date) < now);
    const expiring90 = certifications.filter(c => {
      if (!c.expiry_date) return false;
      const days = differenceInDays(new Date(c.expiry_date), now);
      return days >= 0 && days <= 90;
    });
    const valid = certifications.filter(c => !c.expiry_date || new Date(c.expiry_date) > now);
    const certCompliance = certifications.length > 0 ? (valid.length / certifications.length) * 100 : 100;

    const gaps = competencies.filter(c => levelToNum(c.current_level) < levelToNum(c.required_level));
    const critical = gaps.filter(c => (levelToNum(c.required_level) - levelToNum(c.current_level)) >= 2);

    // Group by competency
    const byCompetency = new Map<string, { current: number; required: number; count: number }>();
    competencies.forEach(c => {
      const name = c.competency_name || "Unknown";
      const e = byCompetency.get(name) || { current: 0, required: 0, count: 0 };
      e.current += levelToNum(c.current_level);
      e.required += levelToNum(c.required_level);
      e.count++;
      byCompetency.set(name, e);
    });

    const radarData = Array.from(byCompetency.entries()).slice(0, 8).map(([name, d]) => ({
      subject: name.length > 15 ? name.substring(0, 15) + "…" : name,
      current: Math.round((d.current / d.count) * 25),
      required: Math.round((d.required / d.count) * 25),
    }));

    const gapBarData = Array.from(byCompetency.entries())
      .map(([name, d]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "…" : name,
        gap: Math.max(0, Math.round(((d.required - d.current) / d.count) * 25)),
      }))
      .filter(d => d.gap > 0)
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 8);

    // Training recommendations
    const recommendations = critical.slice(0, 5).map(c => ({
      competency: c.competency_name,
      currentLevel: c.current_level,
      requiredLevel: c.required_level,
      priority: "Alta",
    }));

    return {
      totalCerts: certifications.length,
      expiredCount: expired.length,
      expiringCount: expiring90.length,
      certCompliance,
      totalGaps: gaps.length,
      criticalGaps: critical.length,
      crewAffected: new Set(gaps.map(g => g.crew_member_id)).size,
      radarData,
      gapBarData,
      recommendations,
    };
  }, [certifications, competencies]);

  const exportCSV = () => {
    const header = "Competency,Current Level,Required Level,Gap\n";
    const rows = competencies
      .filter(c => levelToNum(c.current_level) < levelToNum(c.required_level))
      .map(c => `"${c.competency_name}",${c.current_level},${c.required_level},${levelToNum(c.required_level) - levelToNum(c.current_level)}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "competency_gaps.csv"; a.click();
    toast.success("CSV exportado!");
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Award className="h-4 w-4 mx-auto text-primary mb-1" />
          <div className={`text-xl font-bold ${analytics.certCompliance >= 90 ? "text-success" : "text-warning"}`}>{analytics.certCompliance.toFixed(0)}%</div>
          <div className="text-[10px] text-muted-foreground">Cert Compliance</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <ShieldAlert className="h-4 w-4 mx-auto text-destructive mb-1" />
          <div className="text-xl font-bold text-destructive">{analytics.expiredCount}</div>
          <div className="text-[10px] text-muted-foreground">Expiradas</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto text-warning mb-1" />
          <div className="text-xl font-bold text-warning">{analytics.expiringCount}</div>
          <div className="text-[10px] text-muted-foreground">Vencendo ≤90d</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertCircle className="h-4 w-4 mx-auto text-destructive mb-1" />
          <div className="text-xl font-bold text-destructive">{analytics.criticalGaps}</div>
          <div className="text-[10px] text-muted-foreground">Gaps Críticos</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto text-primary mb-1" />
          <div className="text-xl font-bold text-primary">{analytics.crewAffected}</div>
          <div className="text-[10px] text-muted-foreground">Tripulantes Afetados</div>
        </CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Exportar Gaps</Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analytics.radarData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Radar de Competências</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={analytics.radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Atual" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Requerido" dataKey="required" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {analytics.gapBarData.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Maiores Gaps</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.gapBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Training Recommendations */}
      {analytics.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Recomendações de Treinamento</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border bg-destructive/5 border-destructive/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">{rec.competency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{rec.currentLevel} → {rec.requiredLevel}</Badge>
                    <Badge className="bg-destructive/20 text-destructive text-[10px]">{rec.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics.totalGaps === 0 && analytics.expiredCount === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
          Todas as competências e certificações estão em conformidade.
        </CardContent></Card>
      )}
    </div>
  );
}
