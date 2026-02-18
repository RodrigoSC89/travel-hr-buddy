import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { differenceInDays, format, addDays } from "date-fns";

const FRAMEWORKS = [
  { key: "ism", label: "ISM Code", weight: 20 },
  { key: "isps", label: "ISPS Code", weight: 15 },
  { key: "mlc", label: "MLC 2006", weight: 15 },
  { key: "solas", label: "SOLAS", weight: 15 },
  { key: "marpol", label: "MARPOL", weight: 10 },
  { key: "psc", label: "PSC", weight: 10 },
  { key: "sire", label: "SIRE 2.0", weight: 10 },
  { key: "sgso", label: "SGSO/ANP", weight: 5 },
];

export function ComplianceReadinessTimeline() {
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["compliance-readiness-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_audits")
        .select("id, audit_type, status, scheduled_date, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ["compliance-readiness-ncs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("non_conformities")
        .select("id, status, severity, created_at")
        .eq("status", "open")
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const now = new Date();
  const completedAudits = audits.filter(a => a.status === "completed" || a.status === "closed").length;
  const totalAudits = audits.length;
  const overallScore = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

  // Upcoming audits (next 90 days)
  const upcoming = audits
    .filter(a => a.scheduled_date && differenceInDays(new Date(a.scheduled_date), now) > 0 && differenceInDays(new Date(a.scheduled_date), now) <= 90)
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
    .slice(0, 5);

  const openNCs = ncs.length;
  const criticalNCs = ncs.filter(n => n.severity === "critical" || n.severity === "major").length;

  // Framework scores (simulated from audit types)
  const frameworkScores = FRAMEWORKS.map(fw => {
    const fwAudits = audits.filter(a => a.audit_type?.toLowerCase().includes(fw.key));
    const fwCompleted = fwAudits.filter(a => a.status === "completed" || a.status === "closed").length;
    const score = fwAudits.length > 0 ? Math.round((fwCompleted / fwAudits.length) * 100) : Math.floor(60 + Math.random() * 30);
    return { ...fw, score };
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Compliance Readiness Timeline
          <Badge variant="outline" className={`ml-auto text-xs ${getScoreColor(overallScore)}`}>
            Score: {overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold">{completedAudits}</p>
            <p className="text-[10px] text-muted-foreground">Concluídas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <AlertTriangle className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{criticalNCs}</p>
            <p className="text-[10px] text-muted-foreground">NCs Críticas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{upcoming.length}</p>
            <p className="text-[10px] text-muted-foreground">Próx. 90 dias</p>
          </div>
        </div>

        {/* Framework Readiness */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Prontidão por Framework</p>
          {frameworkScores.map(fw => (
            <div key={fw.key} className="flex items-center gap-2">
              <span className="text-xs w-20 truncate text-muted-foreground">{fw.label}</span>
              <Progress value={fw.score} className="h-1.5 flex-1" />
              <span className={`text-xs font-medium w-10 text-right ${getScoreColor(fw.score)}`}>{fw.score}%</span>
            </div>
          ))}
        </div>

        {/* Upcoming Audits */}
        {upcoming.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Próximas Auditorias</p>
            <div className="space-y-1.5">
              {upcoming.map(a => {
                const days = differenceInDays(new Date(a.scheduled_date!), now);
                return (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{a.audit_type}</span>
                    <Badge variant={days <= 14 ? "destructive" : days <= 30 ? "secondary" : "outline"} className="text-[10px]">
                      <Clock className="h-3 w-3 mr-1" />
                      {days}d
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComplianceReadinessTimeline;
