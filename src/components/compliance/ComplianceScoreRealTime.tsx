/**
 * ComplianceScoreRealTime v2 - Live compliance from REAL DB data
 * Fetches actual vessel compliance data before calling simulate-audit
 * Surpasses DNV ShipManager: real-time scoring vs static reports
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface ComplianceScoreData {
  score: number;
  passed: boolean;
  weakAreas: string[];
  category_scores: Record<string, { score: number; weight: number }>;
  recommendations: string[];
}

interface ComplianceScoreRealTimeProps {
  vesselId?: string;
  module?: "ISM" | "ISPS" | "MLC" | "DP" | "PEOTRAM";
}

export function ComplianceScoreRealTime({ vesselId, module = "ISM" }: ComplianceScoreRealTimeProps) {
  // Fetch real compliance indicators from DB
  const { data: dbIndicators } = useQuery({
    queryKey: ["compliance-indicators", vesselId, module],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Parallel fetch: certs, maintenance, drills, NCs, audits
      const [certsRes, maintRes, drillsRes, ncsRes, auditsRes] = await Promise.all([
        // Certificates status
        vesselId
          ? supabase
              .from("certificates")
              .select("status, expiry_date")
              .eq("vessel_id", vesselId)
          : supabase.from("certificates").select("status, expiry_date").limit(200),
        // Overdue maintenance
        vesselId
          ? supabase
              .from("maintenance_tasks")
              .select("status, priority")
              .eq("vessel_id", vesselId)
          : supabase.from("maintenance_tasks").select("status, priority").limit(200),
        // Drills completed
        supabase.from("smart_drills").select("status, total_executions").limit(50),
        // Open non-conformities
        vesselId
          ? supabase
              .from("non_conformities")
              .select("status, severity")
              .eq("vessel_id", vesselId)
              .in("status", ["open", "in_progress"])
          : supabase
              .from("non_conformities")
              .select("status, severity")
              .in("status", ["open", "in_progress"])
              .limit(100),
        // Recent audits
        supabase.from("internal_audits").select("status, audit_type, overall_score").limit(20),
      ]);

      const certs = certsRes.data ?? [];
      const maint = maintRes.data ?? [];
      const drills = drillsRes.data ?? [];
      const ncs = ncsRes.data ?? [];
      const audits = auditsRes.data ?? [];

      const totalCerts = certs.length;
      const expiredCerts = certs.filter(
        (c) => c.expiry_date && new Date(c.expiry_date) < new Date()
      ).length;
      const overdueMaint = maint.filter((m) => m.status === "overdue").length;
      const criticalMaint = maint.filter(
        (m) => m.priority === "critical" && m.status !== "completed"
      ).length;
      const drillsDone = drills.filter((d) => (d.total_executions ?? 0) > 0).length;
      const openNCs = ncs.length;
      const majorNCs = ncs.filter(
        (n) => n.severity === "major" || n.severity === "critical"
      ).length;

      // Build dynamic responses based on real data
      const hasSMS = audits.length > 0;
      const hasRecentDrills = drillsDone > 0;
      const certCompliance = totalCerts > 0 ? (totalCerts - expiredCerts) / totalCerts : 1;

      return {
        safety_policy: hasSMS ? "yes" : "no",
        sms: hasSMS ? "yes" : "partial",
        drills: hasRecentDrills ? (drillsDone >= 5 ? "yes" : "partial") : "no",
        near_miss: openNCs === 0 ? "yes" : majorNCs > 0 ? "no" : "partial",
        master_review: certCompliance > 0.9 ? "yes" : certCompliance > 0.7 ? "partial" : "no",
        certificates: certCompliance > 0.95 ? "yes" : certCompliance > 0.8 ? "partial" : "no",
        maintenance: overdueMaint === 0 && criticalMaint === 0 ? "yes" : overdueMaint > 3 ? "no" : "partial",
        // Stats for display
        _stats: { totalCerts, expiredCerts, overdueMaint, criticalMaint, drillsDone, openNCs, majorNCs },
      };
    },
    staleTime: 1000 * 60 * 3,
  });

  // Call simulate-audit with real data
  const { data: score, isLoading } = useQuery({
    queryKey: ["compliance-score-rt", vesselId, module, dbIndicators],
    queryFn: async () => {
      if (!dbIndicators) return null;
      const { _stats, ...responses } = dbIndicators;
      const { data, error } = await supabase.functions.invoke("simulate-audit", {
        body: { module, responses, vesselId },
      });
      if (error) throw error;
      return { ...(data as ComplianceScoreData), _stats };
    },
    enabled: !!dbIndicators,
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 4,
  });

  if (isLoading || !dbIndicators) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!score) return null;

  const stats = score._stats;
  const color =
    score.score >= 90
      ? "text-success border-success/30"
      : score.score >= 70
        ? "text-warning border-warning/30"
        : "text-destructive border-destructive/30";

  return (
    <Card className={`border-2 ${color.split(" ")[1]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Compliance Score — {module}
          <Badge variant="outline" className="text-[10px] ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-4xl font-black ${color.split(" ")[0]}`}>{score.score}</p>
            <p className="text-xs text-muted-foreground">de 100</p>
          </div>
          <div className="text-right space-y-1">
            {score.passed ? (
              <Badge className="bg-success/10 text-success border-success/30 gap-1">
                <CheckCircle className="h-3 w-3" /> Audit-Ready
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" /> Ação necessária
              </Badge>
            )}
          </div>
        </div>

        {/* Real data indicators */}
        {stats && (
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-1.5 rounded bg-muted/50">
              <p className="text-xs font-bold">{stats.expiredCerts}</p>
              <p className="text-[9px] text-muted-foreground">Certs Exp.</p>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <p className="text-xs font-bold">{stats.overdueMaint}</p>
              <p className="text-[9px] text-muted-foreground">Maint. Atr.</p>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <p className="text-xs font-bold">{stats.openNCs}</p>
              <p className="text-[9px] text-muted-foreground">NCs Abertas</p>
            </div>
            <div className="p-1.5 rounded bg-muted/50">
              <p className="text-xs font-bold">{stats.drillsDone}</p>
              <p className="text-[9px] text-muted-foreground">Drills OK</p>
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {score.category_scores && Object.entries(score.category_scores).length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(score.category_scores).map(([cat, data]) => (
              <div key={cat} className="text-center p-1.5 rounded bg-muted/50">
                <p className="text-xs font-bold">{data.score}%</p>
                <p className="text-[10px] text-muted-foreground truncate">{cat}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weak Areas */}
        {score.weakAreas?.length > 0 && (
          <div className="space-y-1">
            {score.weakAreas.slice(0, 3).map((area, i) => (
              <p key={`weak-${i}`} className="text-xs flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3 w-3 shrink-0" /> {area}
              </p>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {score.recommendations?.slice(0, 2).map((r, i) => (
          <p key={`rec-${i}`} className="text-xs text-muted-foreground flex items-start gap-1">
            <TrendingUp className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
