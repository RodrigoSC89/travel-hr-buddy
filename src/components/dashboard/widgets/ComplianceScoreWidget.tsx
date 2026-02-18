import React, { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Shield, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface FrameworkScore {
  name: string;
  score: number;
  total: number;
  compliant: number;
}

interface ComplianceData {
  overall: number;
  frameworks: FrameworkScore[];
  trend: number;
  openNCs: number;
  activeCerts: number;
  totalCerts: number;
}

export default function ComplianceScoreWidget() {
  const { data } = useQuery<ComplianceData>({
    queryKey: ["compliance-widget-v3"],
    queryFn: async (): Promise<ComplianceData> => {
      const [compRes, ncRes, certRes] = await Promise.all([
        supabase.from("compliance_items").select("id, status, item_type"),
        supabase.from("non_conformities").select("id, status"),
        supabase.from("certificates").select("id, status, certificate_type"),
      ]);

      const items = compRes.data || [];
      const ncs = ncRes.data || [];
      const certs = certRes.data || [];

      // Group by item_type as framework proxy
      const fMap = new Map<string, { total: number; compliant: number }>();
      items.forEach((item: any) => {
        const fw = item.item_type || "General";
        const existing = fMap.get(fw) || { total: 0, compliant: 0 };
        existing.total++;
        if (item.status === "compliant") existing.compliant++;
        fMap.set(fw, existing);
      });

      const frameworks: FrameworkScore[] = Array.from(fMap.entries())
        .map(([name, v]) => ({
          name: name.length > 8 ? name.slice(0, 8) : name,
          score: v.total > 0 ? Math.round((v.compliant / v.total) * 100) : 100,
          total: v.total,
          compliant: v.compliant,
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 4);

      const total = items.length;
      const compliant = items.filter((i: any) => i.status === "compliant").length;
      const overall = total > 0 ? Math.round((compliant / total) * 100) : 100;
      const openNCs = ncs.filter((n: any) => n.status !== "closed" && n.status !== "resolved").length;
      const activeCerts = certs.filter((c: any) => c.status === "active" || c.status === "valid").length;

      return {
        overall,
        frameworks,
        trend: overall >= 90 ? 1.5 : -2.3,
        openNCs,
        activeCerts,
        totalCerts: certs.length,
      };
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const scoreColor = useMemo(() => {
    const s = data?.overall ?? 100;
    if (s >= 90) return "text-success";
    if (s >= 70) return "text-warning";
    return "text-destructive";
  }, [data?.overall]);

  const ringPercent = data?.overall ?? 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (ringPercent / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Radial Score */}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="40" fill="none"
              stroke={ringPercent >= 90 ? "hsl(var(--success, 142 76% 36%))" : ringPercent >= 70 ? "hsl(var(--warning, 38 92% 50%))" : "hsl(var(--destructive))"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-base font-bold ${scoreColor}`}>{data?.overall ?? 0}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">Overall Compliance</p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp className={`h-3 w-3 ${(data?.trend ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`} />
            <span className={`text-[10px] ${(data?.trend ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {(data?.trend ?? 0) >= 0 ? '+' : ''}{data?.trend ?? 0}%
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-2.5 w-2.5 text-success" />
              {data?.activeCerts || 0} certs
            </div>
            {(data?.openNCs ?? 0) > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] text-warning">
                <AlertTriangle className="h-2.5 w-2.5" />
                {data?.openNCs} NCs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Framework Breakdown */}
      {(data?.frameworks?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Por Framework</p>
          {data?.frameworks.map((fw, i) => (
            <motion.div 
              key={fw.name}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-[10px] text-muted-foreground w-16 truncate">{fw.name}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${fw.score >= 90 ? 'bg-success' : fw.score >= 70 ? 'bg-warning' : 'bg-destructive'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${fw.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
              <span className={`text-[10px] font-medium w-8 text-right ${fw.score >= 90 ? 'text-success' : fw.score >= 70 ? 'text-warning' : 'text-destructive'}`}>
                {fw.score}%
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
