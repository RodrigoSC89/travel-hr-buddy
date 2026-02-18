import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Brain, Lightbulb, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface InsightRow {
  id: string;
  title: string;
  priority: string;
  category: string;
  confidence: number;
  actionable: boolean;
}

export default function AIInsightsWidget() {
  const { data: insights = [] } = useQuery({
    queryKey: ["ai-insights-widget-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("id, title, priority, category, confidence, actionable")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);
      return (data || []) as InsightRow[];
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const actionable = insights.filter(i => i.actionable).length;
  const highPriority = insights.filter(i => i.priority === "high" || i.priority === "critical").length;

  const priorityIcon: Record<string, { icon: typeof Zap; color: string }> = {
    critical: { icon: AlertCircle, color: "text-destructive" },
    high: { icon: Zap, color: "text-warning" },
    medium: { icon: TrendingUp, color: "text-primary" },
    low: { icon: Lightbulb, color: "text-muted-foreground" },
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-1.5 rounded-lg bg-primary/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Brain className="h-4 w-4 text-primary" />
          </motion.div>
          <div>
            <div className="text-lg font-bold text-foreground">{insights.length}</div>
            <p className="text-[10px] text-muted-foreground">Insights ativos</p>
          </div>
        </div>
        <div className="text-right space-y-0.5">
          {actionable > 0 && (
            <Badge variant="outline" className="text-[9px] text-success border-success/30 bg-success/10">
              {actionable} acionáveis
            </Badge>
          )}
          {highPriority > 0 && (
            <Badge variant="outline" className="text-[9px] text-warning border-warning/30 bg-warning/10 block">
              {highPriority} urgentes
            </Badge>
          )}
        </div>
      </div>

      {/* Insight List */}
      <div className="space-y-1.5">
        {insights.map((insight, i) => {
          const cfg = priorityIcon[insight.priority] || priorityIcon.medium;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={insight.id}
              className="flex items-start gap-2 p-1.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${cfg.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{insight.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-muted-foreground">{insight.category}</span>
                  <span className="text-[9px] text-muted-foreground">•</span>
                  <span className="text-[9px] text-primary font-medium">{Math.round(insight.confidence * 100)}% conf.</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {insights.length === 0 && (
          <div className="flex flex-col items-center py-4 text-center">
            <Brain className="h-5 w-5 text-muted-foreground/50 mb-1" />
            <p className="text-xs text-muted-foreground">Nenhum insight disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
