/**
 * Certification Expiry Tracker - Real-time countdown for crew certificates
 * Shows upcoming expirations with urgency levels
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { differenceInDays, format } from "date-fns";

interface CertExpiry {
  id: string;
  crewName: string;
  certType: string;
  expiryDate: string;
  daysLeft: number;
  severity: "critical" | "warning" | "ok";
}

export function CertificationExpiryTracker() {
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["cert-expiry-tracker"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, expiry_date, status")
        .not("expiry_date", "is", null)
        .order("expiry_date", { ascending: true })
        .limit(100);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["cert-expiry-crew"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_members")
        .select("id, full_name");
      return data || [];
    },
    staleTime: 120000,
  });

  const expiryList = useMemo<CertExpiry[]>(() => {
    const crewMap = new Map(crewMembers.map((c) => [c.id, c.full_name]));
    const today = new Date();

    return certifications
      .filter((c) => c.expiry_date)
      .map((c) => {
        const expiryDate = new Date(c.expiry_date!);
        const daysLeft = differenceInDays(expiryDate, today);
        return {
          id: c.id,
          crewName: crewMap.get(c.crew_member_id || "") || "Unknown",
          certType: c.certification_name || c.certification_type || "Certificate",
          expiryDate: c.expiry_date!,
          daysLeft,
          severity: daysLeft < 0 ? "critical" as const : daysLeft <= 30 ? "critical" as const : daysLeft <= 90 ? "warning" as const : "ok" as const,
        };
      })
      .filter((c) => c.daysLeft <= 180)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [certifications, crewMembers]);

  const stats = useMemo(() => ({
    expired: expiryList.filter((c) => c.daysLeft < 0).length,
    critical: expiryList.filter((c) => c.daysLeft >= 0 && c.daysLeft <= 30).length,
    warning: expiryList.filter((c) => c.daysLeft > 30 && c.daysLeft <= 90).length,
    ok: expiryList.filter((c) => c.daysLeft > 90).length,
  }), [expiryList]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
      case "warning": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-success/10 text-success border-success/20";
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Certificate Expiry Tracker
          </CardTitle>
          <div className="flex gap-1.5">
            {stats.expired > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">
                {stats.expired} expired
              </Badge>
            )}
            {stats.critical > 0 && (
              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] h-5">
                {stats.critical} critical
              </Badge>
            )}
            {stats.warning > 0 && (
              <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] h-5">
                {stats.warning} warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        ) : expiryList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm">All certificates are up to date (180+ days)</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {expiryList.slice(0, 15).map((cert) => (
                <div
                  key={cert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityStyles(cert.severity)}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cert.severity === "critical" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cert.crewName}</p>
                      <p className="text-xs opacity-75 truncate">{cert.certType}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold">
                      {cert.daysLeft < 0
                        ? `${Math.abs(cert.daysLeft)}d overdue`
                        : `${cert.daysLeft}d left`}
                    </p>
                    <p className="text-[10px] opacity-75">
                      {format(new Date(cert.expiryDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
