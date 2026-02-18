import React, { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, FileWarning } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface CertData {
  expiring: Array<{ id: string; certificate_type: string | null; expiry_date: string; holder_name?: string | null }>;
  expired: number;
  active: number;
  total: number;
}

export default function CertificatesWidget() {
  const { data } = useQuery<CertData>({
    queryKey: ["certificates-widget-v3"],
    queryFn: async (): Promise<CertData> => {
      const now = new Date();
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);

      const [expiringRes, countRes] = await Promise.all([
        supabase.from("certificates")
          .select("id, certificate_type, expiry_date, holder_name")
          .eq("status", "active")
          .gte("expiry_date", now.toISOString())
          .lte("expiry_date", thirtyDays.toISOString())
          .order("expiry_date", { ascending: true })
          .limit(5),
        supabase.from("certificates")
          .select("id, status, expiry_date"),
      ]);

      const all = countRes.data || [];
      const expired = all.filter(c => c.expiry_date && new Date(c.expiry_date) < now && c.status === "active").length;
      const active = all.filter(c => c.status === "active").length;

      return {
        expiring: (expiringRes.data || []) as CertData["expiring"],
        expired,
        active,
        total: all.length,
      };
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const urgencyLevel = useMemo(() => {
    if ((data?.expired || 0) > 0) return "critical";
    if ((data?.expiring?.length || 0) > 3) return "warning";
    if ((data?.expiring?.length || 0) > 0) return "attention";
    return "ok";
  }, [data]);

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Certificados</div>
          <div className="text-lg font-bold text-foreground">{data?.active || 0}<span className="text-muted-foreground text-sm">/{data?.total || 0}</span></div>
        </div>
        {urgencyLevel === "critical" && (
          <motion.div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-medium"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ShieldAlert className="h-3 w-3" />
            {data?.expired} vencido(s)
          </motion.div>
        )}
        {urgencyLevel === "ok" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/15 text-success text-[10px] font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Em dia
          </div>
        )}
      </div>

      {/* Expiring List */}
      {(data?.expiring?.length ?? 0) > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencendo em 30 dias</p>
          {data?.expiring.map((cert, i) => {
            const days = daysUntil(cert.expiry_date);
            const isUrgent = days <= 7;
            return (
              <motion.div
                key={cert.id}
                className={`flex items-center justify-between text-xs p-1.5 rounded-md ${isUrgent ? 'bg-destructive/5 border border-destructive/20' : 'bg-warning/5 border border-warning/10'}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <FileWarning className={`h-3 w-3 shrink-0 ${isUrgent ? 'text-destructive' : 'text-warning'}`} />
                  <span className="truncate text-foreground">{cert.certificate_type || "Certificado"}</span>
                </div>
                <Badge variant="outline" className={`text-[9px] px-1 py-0 shrink-0 ${isUrgent ? 'text-destructive border-destructive/30' : 'text-warning border-warning/30'}`}>
                  {days}d
                </Badge>
              </motion.div>
            );
          })}
        </div>
      )}

      {(data?.expiring?.length ?? 0) === 0 && (data?.expired ?? 0) === 0 && (
        <div className="flex flex-col items-center justify-center py-3 text-center">
          <CheckCircle2 className="h-6 w-6 text-success mb-1" />
          <p className="text-xs text-muted-foreground">Todos os certificados em dia</p>
        </div>
      )}
    </div>
  );
}
