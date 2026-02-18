/**
 * DocumentExpiryMatrix - Heatmap of crew certifications + vessel certificates by expiry window
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileWarning, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface ExpiryBucket {
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

export function DocumentExpiryMatrix() {
  const { data, isLoading } = useQuery({
    queryKey: ["document-expiry-matrix"],
    queryFn: async () => {
      const [crewCerts, vesselCerts] = await Promise.all([
        supabase.from("crew_certifications").select("id, certification_name, expiry_date").not("expiry_date", "is", null).limit(500),
        supabase.from("certificates").select("id, certificate_type, expiry_date").not("expiry_date", "is", null).limit(500),
      ]);

      const allDocs = [
        ...(crewCerts.data || []).map(c => ({ id: c.id, name: c.certification_name, expiry: c.expiry_date!, source: "crew" })),
        ...(vesselCerts.data || []).map(c => ({ id: c.id, name: c.certificate_type, expiry: c.expiry_date!, source: "vessel" })),
      ].filter(d => d.expiry);

      const now = Date.now();
      const buckets = { expired: 0, critical: 0, warning: 0, ok: 0 };
      const criticalDocs: Array<{ name: string; days: number; source: string }> = [];

      allDocs.forEach(doc => {
        const days = Math.ceil((new Date(doc.expiry).getTime() - now) / 86400000);
        if (days < 0) buckets.expired++;
        else if (days <= 30) { buckets.critical++; criticalDocs.push({ name: doc.name || "Unknown", days, source: doc.source }); }
        else if (days <= 90) buckets.warning++;
        else buckets.ok++;
      });

      criticalDocs.sort((a, b) => a.days - b.days);

      return { buckets, criticalDocs: criticalDocs.slice(0, 8), total: allDocs.length };
    },
    staleTime: 120000,
  });

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>;
  if (!data) return null;

  const bucketConfig: ExpiryBucket[] = [
    { label: "Expirados", count: data.buckets.expired, color: "bg-destructive/20 text-destructive border-destructive/30", icon: <AlertTriangle className="h-4 w-4" /> },
    { label: "< 30 dias", count: data.buckets.critical, color: "bg-warning/20 text-warning border-warning/30", icon: <Clock className="h-4 w-4" /> },
    { label: "30-90 dias", count: data.buckets.warning, color: "bg-accent/20 text-accent-foreground border-accent/30", icon: <FileWarning className="h-4 w-4" /> },
    { label: "> 90 dias", count: data.buckets.ok, color: "bg-success/20 text-success border-success/30", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileWarning className="h-4 w-4 text-primary" />
          Document & Certificate Expiry Matrix
          <Badge variant="outline" className="ml-auto text-[10px]">{data.total} documentos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heatmap buckets */}
        <div className="grid grid-cols-4 gap-2">
          {bucketConfig.map(b => (
            <div key={b.label} className={`rounded-lg border p-3 text-center ${b.color}`}>
              <div className="flex justify-center mb-1">{b.icon}</div>
              <p className="text-xl font-bold">{b.count}</p>
              <p className="text-[10px]">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Critical docs list */}
        {data.criticalDocs.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Próximos a Expirar</p>
            {data.criticalDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-muted/30">
                <span className="truncate max-w-[60%]">{doc.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{doc.source === "crew" ? "Crew" : "Vessel"}</Badge>
                  <span className={`font-bold ${doc.days <= 7 ? "text-destructive" : "text-warning"}`}>
                    {doc.days}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DocumentExpiryMatrix;
