/**
 * STCWComplianceChecker - Auto cross-references certs vs rank requirements
 * Surpasses Compas: automatic STCW gap detection vs manual checking
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, XCircle, CheckCircle } from "lucide-react";

const STCW_REQUIREMENTS: Record<string, string[]> = {
  Master: ["STCW II/2", "GMDSS", "Medical First Aid", "Fire Fighting Advanced", "Proficiency Survival Craft", "ECDIS", "Bridge Resource Management"],
  "Chief Officer": ["STCW II/2", "Medical First Aid", "Fire Fighting Advanced", "Proficiency Survival Craft", "ECDIS"],
  "Chief Engineer": ["STCW III/2", "Medical First Aid", "Fire Fighting Advanced", "Proficiency Survival Craft"],
  "2nd Officer": ["STCW II/1", "Medical First Aid", "ECDIS", "Proficiency Survival Craft"],
  "3rd Officer": ["STCW II/1", "Medical First Aid", "ECDIS"],
  "DP Operator": ["NI DP Unlimited", "STCW Basic Safety", "Medical Certificate ENG1"],
  "Dive Supervisor": ["HSE Part IV", "IMCA Diver", "First Aid Offshore", "Hyperbaric Rescue"],
  Bosun: ["STCW II/4", "Basic Safety Training", "Proficiency Survival Craft"],
  AB: ["STCW II/4", "Basic Safety Training"],
};

interface STCWComplianceCheckerProps {
  crewMemberId: string;
  rank: string;
  crewName?: string;
}

export function STCWComplianceChecker({ crewMemberId, rank, crewName }: STCWComplianceCheckerProps) {
  const required = STCW_REQUIREMENTS[rank] ?? STCW_REQUIREMENTS["AB"] ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["stcw-check", crewMemberId],
    queryFn: async () => {
      const { data: certs, error } = await supabase
        .from("certificates")
        .select("certificate_type, expiry_date, status")
        .eq("crew_member_id", crewMemberId)
        .in("status", ["active", "valid"]);
      if (error) throw error;

      const validCerts = new Set(
        (certs ?? [])
          .filter((c) => !c.expiry_date || new Date(c.expiry_date) > new Date())
          .map((c) => c.certificate_type)
      );

      const missing = required.filter((r) => !validCerts.has(r));
      const present = required.filter((r) => validCerts.has(r));
      const pct = required.length > 0 ? Math.round((present.length / required.length) * 100) : 100;

      return { missing, present, pct, total: required.length };
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!crewMemberId,
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;
  if (!data) return null;

  const color = data.pct >= 100 ? "text-success" : data.pct >= 80 ? "text-warning" : "text-destructive";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          STCW Compliance {crewName && `— ${crewName}`}
          <Badge variant="outline" className="text-[10px] ml-auto">{rank}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${color}`}>{data.pct}%</span>
          <span className="text-xs text-muted-foreground">
            {data.present.length}/{data.total} certificados
          </span>
        </div>
        <Progress value={data.pct} className="h-2" />

        {data.missing.length > 0 && (
          <div className="space-y-1 mt-2">
            {data.missing.map((m) => (
              <p key={m} className="text-xs flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3 shrink-0" /> {m}
              </p>
            ))}
          </div>
        )}
        {data.missing.length === 0 && (
          <p className="text-xs flex items-center gap-1 text-success">
            <CheckCircle className="h-3 w-3" /> Todos os certificados STCW válidos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
