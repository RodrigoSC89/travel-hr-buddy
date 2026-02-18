import React, { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, Award, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface CrewStats {
  total: number;
  active: number;
  onLeave: number;
  expiringCerts: number;
  avgExperience: number;
  certBreakdown: { valid: number; expiring: number; expired: number };
}

export default function CrewReadinessWidget() {
  const { data } = useQuery<CrewStats>({
    queryKey: ["crew-readiness-widget-v3"],
    queryFn: async () => {
      const [crewRes, certsRes] = await Promise.all([
        supabase.from("crew_members").select("id, status, join_date, experience_years"),
        supabase.from("crew_certifications").select("id, expiry_date, status"),
      ]);

      const crew = crewRes.data || [];
      const certs = certsRes.data || [];
      const now = Date.now();
      const thirtyDays = 30 * 86400000;

      const active = crew.filter(c => c.status === "active").length;
      const onLeave = crew.filter(c => c.status === "on_leave" || c.status === "leave").length;

      const valid = certs.filter(c => c.status === "active" || c.status === "valid").length;
      const expiring = certs.filter(c => {
        if (!c.expiry_date) return false;
        const diff = new Date(c.expiry_date).getTime() - now;
        return diff > 0 && diff <= thirtyDays;
      }).length;
      const expired = certs.filter(c => {
        if (!c.expiry_date) return false;
        return new Date(c.expiry_date).getTime() < now;
      }).length;

      // Average experience in years
      const avgExp = crew.length > 0 
        ? crew.reduce((sum, c) => sum + (c.experience_years || 0), 0) / crew.length
        : 0;

      return {
        total: crew.length,
        active,
        onLeave,
        expiringCerts: expiring,
        avgExperience: Math.round(avgExp * 10) / 10,
        certBreakdown: { valid, expiring, expired },
      };
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const readiness = useMemo(() => {
    if (!data || data.total === 0) return 0;
    // Weighted readiness: active crew (60%) + cert health (40%)
    const crewScore = (data.active / data.total) * 100;
    const totalCerts = data.certBreakdown.valid + data.certBreakdown.expiring + data.certBreakdown.expired;
    const certScore = totalCerts > 0 
      ? ((data.certBreakdown.valid / totalCerts) * 100)
      : 100;
    return Math.round(crewScore * 0.6 + certScore * 0.4);
  }, [data]);

  const readinessColor = readiness >= 90 ? "text-success" : readiness >= 70 ? "text-warning" : "text-destructive";
  const progressColor = readiness >= 90 ? "bg-success" : readiness >= 70 ? "bg-warning" : "bg-destructive";

  return (
    <div className="space-y-3">
      {/* Readiness Score */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div 
            className={`text-3xl font-bold ${readinessColor}`}
            key={readiness}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {readiness}%
          </motion.div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Readiness Score</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">{data?.active || 0}<span className="text-muted-foreground text-sm">/{data?.total || 0}</span></div>
          <p className="text-[10px] text-muted-foreground">Ativos</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={readiness} className={`h-2 [&>div]:${progressColor}`} />
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-muted/50 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
            <Clock className="h-2.5 w-2.5" />
            Licença
          </div>
          <span className="text-xs font-semibold text-foreground">{data?.onLeave || 0}</span>
        </div>
        <div className="bg-muted/50 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
            <Award className="h-2.5 w-2.5" />
            Exp.
          </div>
          <span className="text-xs font-semibold text-foreground">{data?.avgExperience || 0}a</span>
        </div>
        <div className="bg-muted/50 rounded-md p-1.5 text-center">
          <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground mb-0.5">
            <TrendingUp className="h-2.5 w-2.5" />
            Certs
          </div>
          <span className="text-xs font-semibold text-foreground">{data?.certBreakdown.valid || 0}</span>
        </div>
      </div>

      {/* Certificate Health Alerts */}
      {(data?.certBreakdown.expiring || 0) > 0 && (
        <motion.div 
          className="flex items-center gap-1.5 p-1.5 rounded-md bg-warning/10 border border-warning/20"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
          <span className="text-[10px] text-warning">
            {data?.certBreakdown.expiring} cert(s) vencem em 30 dias
          </span>
        </motion.div>
      )}
      {(data?.certBreakdown.expired || 0) > 0 && (
        <motion.div 
          className="flex items-center gap-1.5 p-1.5 rounded-md bg-destructive/10 border border-destructive/20"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
          <span className="text-[10px] text-destructive">
            {data?.certBreakdown.expired} cert(s) vencido(s)!
          </span>
        </motion.div>
      )}
    </div>
  );
}
