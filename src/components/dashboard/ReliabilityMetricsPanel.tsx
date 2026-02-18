/**
 * ReliabilityMetricsPanel - MTBF/MTTR Engineering Analytics
 * Equipment reliability ranking with trend indicators
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ArrowUp, ArrowDown, Minus, Target } from "lucide-react";
import { motion } from "framer-motion";

interface ReliabilityRow {
  equipment: string;
  mtbf: number; // days between failures
  mttr: number; // hours to repair
  availability: number; // percentage
  trend: "up" | "down" | "stable";
  failures30d: number;
}

export function ReliabilityMetricsPanel() {
  const { data: records = [] } = useQuery({
    queryKey: ["reliability-records"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_records")
        .select("component, status, created_at, completed_date, maintenance_type")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["reliability-predictions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_maintenance_predictions")
        .select("equipment_name, failure_probability")
        .order("failure_probability", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  const rows: ReliabilityRow[] = useMemo(() => {
    // Group records by component
    const byComponent: Record<string, any[]> = {};
    records.forEach((r: any) => {
      const key = r.component || "Unknown";
      if (!byComponent[key]) byComponent[key] = [];
      byComponent[key].push(r);
    });

    const result: ReliabilityRow[] = Object.entries(byComponent).map(([equipment, recs]) => {
      const corrective = recs.filter((r: any) => r.maintenance_type === "corrective" || r.maintenance_type === "emergency");
      const failures = corrective.length || 1;

      // Calculate MTBF from span of records
      const dates = recs.map((r: any) => new Date(r.created_at).getTime()).sort();
      const spanDays = dates.length > 1 ? (dates[dates.length - 1] - dates[0]) / 86400000 : 365;
      const mtbf = Math.round(spanDays / failures);

      // Calculate MTTR from completed records
      const repairTimes = recs
        .filter((r: any) => r.completed_date && r.created_at)
        .map((r: any) => (new Date(r.completed_date).getTime() - new Date(r.created_at).getTime()) / 3600000);
      const mttr = repairTimes.length > 0
        ? Math.round(repairTimes.reduce((a: number, b: number) => a + b, 0) / repairTimes.length)
        : 24;

      // Availability = MTBF / (MTBF + MTTR/24)
      const availability = Math.min(99.9, (mtbf / (mtbf + mttr / 24)) * 100);

      // Recent failures (30d)
      const thirtyDaysAgo = Date.now() - 30 * 86400000;
      const failures30d = corrective.filter((r: any) => new Date(r.created_at).getTime() > thirtyDaysAgo).length;

      return {
        equipment,
        mtbf,
        mttr,
        availability: Math.round(availability * 10) / 10,
        trend: failures30d === 0 ? "up" : failures30d > 2 ? "down" : "stable",
        failures30d,
      };
    });

    // If no real data, show demo
    if (result.length === 0) {
      const demoEquip = ["Main Engine", "Aux Generator #1", "Steering Gear", "Ballast Pump", "Fire Pump", "Crane Hydraulic"];
      return demoEquip.map((eq, i) => ({
        equipment: eq,
        mtbf: 180 - i * 25,
        mttr: 4 + i * 3,
        availability: 99.5 - i * 1.2,
        trend: i < 2 ? "up" as const : i < 4 ? "stable" as const : "down" as const,
        failures30d: i < 2 ? 0 : i - 1,
      }));
    }

    return result.sort((a, b) => a.availability - b.availability).slice(0, 8);
  }, [records]);

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-success" />;
    if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const avgAvail = rows.length > 0 ? (rows.reduce((a, r) => a + r.availability, 0) / rows.length).toFixed(1) : "—";

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Reliability Engineering
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Avg Availability: {avgAvail}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table header */}
        <div className="grid grid-cols-[1fr_60px_60px_70px_40px_50px] gap-2 text-[10px] uppercase text-muted-foreground font-medium pb-2 border-b border-border/40 px-1">
          <span>Equipment</span>
          <span className="text-right">MTBF</span>
          <span className="text-right">MTTR</span>
          <span className="text-right">Avail%</span>
          <span className="text-center">Trend</span>
          <span className="text-right">Fail/30d</span>
        </div>

        {/* Rows */}
        <div className="space-y-0.5 mt-1">
          {rows.map((row, i) => (
            <motion.div
              key={row.equipment}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[1fr_60px_60px_70px_40px_50px] gap-2 items-center py-1.5 px-1 rounded hover:bg-muted/30 transition-colors text-sm"
            >
              <span className="truncate font-medium">{row.equipment}</span>
              <span className="text-right text-muted-foreground">{row.mtbf}d</span>
              <span className="text-right text-muted-foreground">{row.mttr}h</span>
              <span className={`text-right font-semibold ${
                row.availability >= 97 ? "text-success" : row.availability >= 90 ? "text-warning" : "text-destructive"
              }`}>
                {row.availability}%
              </span>
              <span className="flex justify-center"><TrendIcon trend={row.trend} /></span>
              <span className={`text-right ${row.failures30d > 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                {row.failures30d}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/40">
          MTBF = Mean Time Between Failures (dias) | MTTR = Mean Time To Repair (horas) | Target: Avail &gt;97%
        </div>
      </CardContent>
    </Card>
  );
}
