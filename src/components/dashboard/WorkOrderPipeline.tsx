/**
 * WorkOrderPipeline - Visual pipeline of work order lifecycle stages
 * Shows count per stage with flow animation
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const STAGES = [
  { id: "draft", label: "Draft", color: "bg-muted-foreground" },
  { id: "planned", label: "Planned", color: "bg-info" },
  { id: "approved", label: "Approved", color: "bg-primary" },
  { id: "in_progress", label: "In Progress", color: "bg-warning" },
  { id: "pending_parts", label: "Pending Parts", color: "bg-orange-500" },
  { id: "completed", label: "Completed", color: "bg-success" },
  { id: "verified", label: "Verified", color: "bg-success" },
  { id: "closed", label: "Closed", color: "bg-muted-foreground" },
] as const;

export function WorkOrderPipeline() {
  const { data: tasks = [] } = useQuery({
    queryKey: ["wo-pipeline-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_tasks")
        .select("status")
        .limit(1000);
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: records = [] } = useQuery({
    queryKey: ["wo-pipeline-records"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_records")
        .select("status")
        .limit(1000);
      return data || [];
    },
    staleTime: 30000,
  });

  const stageCounts = useMemo(() => {
    const allStatuses = [
      ...tasks.map((t: any) => t.status),
      ...records.map((r: any) => r.status),
    ];

    const counts: Record<string, number> = {};
    STAGES.forEach(s => { counts[s.id] = 0; });

    allStatuses.forEach(status => {
      if (status && counts[status] !== undefined) {
        counts[status]++;
      } else if (status === "pending") {
        counts["planned"]++;
      } else if (status === "scheduled") {
        counts["approved"]++;
      }
    });

    return counts;
  }, [tasks, records]);

  const totalWOs = Object.values(stageCounts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(1, ...Object.values(stageCounts));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-5 w-5 text-primary" />
            Work Order Pipeline
          </CardTitle>
          <span className="text-xs text-muted-foreground">{totalWOs} work orders</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pipeline flow */}
        <div className="flex items-end gap-1 h-28">
          {STAGES.map((stage, i) => {
            const count = stageCounts[stage.id];
            const heightPct = Math.max(8, (count / maxCount) * 100);

            return (
              <React.Fragment key={stage.id}>
                <motion.div
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {/* Count label */}
                  <span className="text-xs font-bold">{count}</span>
                  {/* Bar */}
                  <motion.div
                    className={`w-full rounded-t-md ${stage.color} transition-all`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    style={{ opacity: count > 0 ? 0.8 : 0.25, minHeight: "4px" }}
                  />
                </motion.div>
                {i < STAGES.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0 mb-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Stage labels */}
        <div className="flex items-start gap-1 mt-2">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.id + "-label"}>
              <div className="flex-1 text-center">
                <span className="text-[9px] text-muted-foreground leading-tight block">
                  {stage.label}
                </span>
              </div>
              {i < STAGES.length - 1 && <div className="w-3 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Flow throughput */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
          <span>
            Throughput: {stageCounts.completed + stageCounts.verified + stageCounts.closed} concluídas
          </span>
          <span>
            Bottleneck: {(() => {
              const active = STAGES.filter(s => !["closed", "draft"].includes(s.id));
              const max = active.reduce((a, b) => stageCounts[b.id] > stageCounts[a.id] ? b : a, active[0]);
              return stageCounts[max.id] > 0 ? max.label : "—";
            })()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
