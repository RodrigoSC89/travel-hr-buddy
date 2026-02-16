/**
 * FleetSTCWDashboard - Fleet-wide STCW compliance + proactive certificate alerts
 * Surpasses Compas: automatic fleet-wide STCW gap analysis with expiry alerts
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle, Users, Bell, XCircle,
} from "lucide-react";

interface CrewCertStatus {
  id: string;
  full_name: string;
  rank: string;
  vessel_name: string | null;
  total_certs: number;
  valid_certs: number;
  expiring_soon: number;
  expired: number;
  compliance_pct: number;
}

interface CertAlert {
  crew_name: string;
  cert_type: string;
  expiry_date: string;
  days_remaining: number;
  severity: "critical" | "warning" | "info";
}

export function FleetSTCWDashboard() {
  // Fleet-wide crew cert analysis
  const { data, isLoading } = useQuery({
    queryKey: ["fleet-stcw-dashboard"],
    queryFn: async () => {
      // Fetch crew members with vessel info
      const { data: crew, error: crewErr } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, vessel_id, status")
        .in("status", ["active", "onboard", "on_leave"])
        .order("full_name")
        .limit(200);
      if (crewErr) throw crewErr;

      // Fetch all maritime certificates (has crew_member_id)
      const { data: certs, error: certErr } = await supabase
        .from("maritime_certificates")
        .select("crew_member_id, expiry_date, status, issuing_authority")
        .limit(2000);
      if (certErr) throw certErr;

      // Fetch vessels for names
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name")
        .limit(100);
      const vesselMap = new Map((vessels ?? []).map((v) => [v.id, v.name]));

      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const alerts: CertAlert[] = [];
      const crewStatuses: CrewCertStatus[] = [];

      for (const member of crew ?? []) {
        const memberCerts = (certs ?? []).filter((c) => c.crew_member_id === member.id);
        const validCerts = memberCerts.filter(
          (c) => c.status === "active" && (!c.expiry_date || new Date(c.expiry_date) > now)
        );
        const expiredCerts = memberCerts.filter(
          (c) => c.expiry_date && new Date(c.expiry_date) <= now
        );
        const expiringSoon = memberCerts.filter(
          (c) => c.expiry_date && new Date(c.expiry_date) > now && new Date(c.expiry_date) <= in90
        );

        // Generate alerts for expiring certs
        for (const cert of memberCerts) {
          if (!cert.expiry_date) continue;
          const expiryDate = new Date(cert.expiry_date);
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysRemaining <= 0) {
            alerts.push({
              crew_name: member.full_name ?? "Unknown",
              cert_type: cert.issuing_authority ?? "Certificate",
              expiry_date: cert.expiry_date,
              days_remaining: daysRemaining,
              severity: "critical",
            });
          } else if (daysRemaining <= 30) {
            alerts.push({
              crew_name: member.full_name ?? "Unknown",
              cert_type: cert.issuing_authority ?? "Certificate",
              expiry_date: cert.expiry_date,
              days_remaining: daysRemaining,
              severity: "warning",
            });
          } else if (daysRemaining <= 90) {
            alerts.push({
              crew_name: member.full_name ?? "Unknown",
              cert_type: cert.issuing_authority ?? "Certificate",
              expiry_date: cert.expiry_date,
              days_remaining: daysRemaining,
              severity: "info",
            });
          }
        }

        const total = memberCerts.length || 1;
        crewStatuses.push({
          id: member.id,
          full_name: member.full_name ?? "Unknown",
          rank: member.rank ?? "N/A",
          vessel_name: member.vessel_id ? vesselMap.get(member.vessel_id) ?? null : null,
          total_certs: memberCerts.length,
          valid_certs: validCerts.length,
          expiring_soon: expiringSoon.length,
          expired: expiredCerts.length,
          compliance_pct: Math.round((validCerts.length / total) * 100),
        });
      }

      // Sort alerts by urgency
      alerts.sort((a, b) => a.days_remaining - b.days_remaining);

      // Fleet averages
      const totalCrew = crewStatuses.length || 1;
      const fleetCompliance = Math.round(
        crewStatuses.reduce((sum, c) => sum + c.compliance_pct, 0) / totalCrew
      );
      const totalExpired = crewStatuses.reduce((sum, c) => sum + c.expired, 0);
      const totalExpiring = crewStatuses.reduce((sum, c) => sum + c.expiring_soon, 0);
      const fullyCompliant = crewStatuses.filter((c) => c.compliance_pct === 100).length;

      return {
        crew: crewStatuses,
        alerts: alerts.slice(0, 20),
        summary: { fleetCompliance, totalCrew: crewStatuses.length, totalExpired, totalExpiring, fullyCompliant },
      };
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, alerts, crew } = data;
  const compColor =
    summary.fleetCompliance >= 90
      ? "text-success"
      : summary.fleetCompliance >= 70
        ? "text-warning"
        : "text-destructive";

  return (
    <div className="space-y-4">
      {/* Fleet Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            STCW Fleet Compliance
            <Badge variant="outline" className="text-[10px] ml-auto flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div>
              <p className={`text-3xl font-black ${compColor}`}>{summary.fleetCompliance}%</p>
              <p className="text-[10px] text-muted-foreground">Fleet Compliance</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.totalCrew}</p>
              <p className="text-[10px] text-muted-foreground">Tripulantes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{summary.fullyCompliant}</p>
              <p className="text-[10px] text-muted-foreground">100% Compliant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{summary.totalExpiring}</p>
              <p className="text-[10px] text-muted-foreground">Expiring 90d</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{summary.totalExpired}</p>
              <p className="text-[10px] text-muted-foreground">Expired</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proactive Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Alertas Proativos de Certificados
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px]">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  Nenhum alerta — todos os certificados em dia
                </p>
              ) : (
                <div className="space-y-2">
                  {alerts.map((a, i) => (
                    <div
                      key={`alert-${i}`}
                      className={`p-2.5 rounded-lg border ${
                        a.severity === "critical"
                          ? "bg-destructive/5 border-destructive/20"
                          : a.severity === "warning"
                            ? "bg-warning/5 border-warning/20"
                            : "bg-muted/30 border-border/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{a.crew_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{a.cert_type}</p>
                        </div>
                        <Badge
                          variant={a.severity === "critical" ? "destructive" : "outline"}
                          className="text-[9px] shrink-0"
                        >
                          {a.days_remaining <= 0
                            ? `${Math.abs(a.days_remaining)}d vencido`
                            : `${a.days_remaining}d restantes`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Crew Compliance Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Compliance por Tripulante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {crew
                  .sort((a, b) => a.compliance_pct - b.compliance_pct)
                  .slice(0, 20)
                  .map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {c.rank} {c.vessel_name && `· ${c.vessel_name}`}
                        </p>
                      </div>
                      <div className="w-24 shrink-0">
                        <Progress value={c.compliance_pct} className="h-1.5" />
                      </div>
                      <span
                        className={`text-xs font-bold w-10 text-right ${
                          c.compliance_pct >= 100
                            ? "text-success"
                            : c.compliance_pct >= 80
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {c.compliance_pct}%
                      </span>
                      {c.expired > 0 && (
                        <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
