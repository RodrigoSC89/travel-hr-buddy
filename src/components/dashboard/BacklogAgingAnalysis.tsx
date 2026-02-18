/**
 * BacklogAgingAnalysis - Visual aging distribution of maintenance backlog
 * Shows work order age buckets with overdue highlighting
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, AlertTriangle, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface AgingBucket {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  isOverdue: boolean;
}

export function BacklogAgingAnalysis() {
  const { data: tasks = [] } = useQuery({
    queryKey: ["backlog-aging-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_tasks")
        .select("id, status, created_at, due_date, priority")
        .in("status", ["pending", "in_progress", "scheduled"])
        .order("created_at", { ascending: true })
        .limit(500);
      return data || [];
    },
    staleTime: 30000,
  });

  const buckets: AgingBucket[] = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;

    const ages = tasks.map((t: any) => {
      const created = new Date(t.created_at).getTime();
      return Math.floor((now - created) / dayMs);
    });

    return [
      {
        label: "< 7 dias",
        count: ages.filter(a => a < 7).length,
        color: "text-success",
        bgColor: "bg-success",
        isOverdue: false,
      },
      {
        label: "7–14 dias",
        count: ages.filter(a => a >= 7 && a < 14).length,
        color: "text-info",
        bgColor: "bg-info",
        isOverdue: false,
      },
      {
        label: "15–30 dias",
        count: ages.filter(a => a >= 14 && a < 30).length,
        color: "text-warning",
        bgColor: "bg-warning",
        isOverdue: false,
      },
      {
        label: "30–60 dias",
        count: ages.filter(a => a >= 30 && a < 60).length,
        color: "text-orange-500",
        bgColor: "bg-orange-500",
        isOverdue: true,
      },
      {
        label: "60–90 dias",
        count: ages.filter(a => a >= 60 && a < 90).length,
        color: "text-destructive",
        bgColor: "bg-destructive",
        isOverdue: true,
      },
      {
        label: "> 90 dias",
        count: ages.filter(a => a >= 90).length,
        color: "text-destructive",
        bgColor: "bg-destructive",
        isOverdue: true,
      },
    ];
  }, [tasks]);

  const maxCount = Math.max(1, ...buckets.map(b => b.count));
  const overdueTotal = buckets.filter(b => b.isOverdue).reduce((a, b) => a + b.count, 0);
  const totalBacklog = buckets.reduce((a, b) => a + b.count, 0);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Backlog Aging Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {overdueTotal > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {overdueTotal} atrasadas
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {totalBacklog} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {buckets.map((bucket, i) => (
          <motion.div
            key={bucket.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3"
          >
            <span className={`text-xs w-20 text-right font-medium ${bucket.isOverdue ? bucket.color : "text-muted-foreground"}`}>
              {bucket.label}
            </span>
            <div className="flex-1 h-6 bg-muted/40 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full ${bucket.bgColor} ${bucket.isOverdue ? "animate-pulse" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${(bucket.count / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                style={{ opacity: bucket.isOverdue ? 0.85 : 0.65 }}
              />
              {bucket.count > 0 && (
                <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-bold text-white drop-shadow-md">
                  {bucket.count}
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* Overdue ratio */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Backlog Health:</span>
            <span className={`font-bold ${overdueTotal === 0 ? "text-success" : overdueTotal > totalBacklog * 0.3 ? "text-destructive" : "text-warning"}`}>
              {totalBacklog > 0 ? Math.round(((totalBacklog - overdueTotal) / totalBacklog) * 100) : 100}%
            </span>
          </div>
          <span>Target: &gt;80% dentro de 30 dias</span>
        </div>
      </CardContent>
    </Card>
  );
}
