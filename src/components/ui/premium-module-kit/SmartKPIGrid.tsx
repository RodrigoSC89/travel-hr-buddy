/**
 * Smart KPI Grid v2 - Cards de indicadores com drill-down, sparklines e animações
 * Benchmark: Linear, Vercel, Stripe Dashboard
 */

import React, { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, ChevronRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { SparklineChart } from "./SparklineChart";
import { cn } from "@/lib/utils";

export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  progress?: number;
  progressLabel?: string;
  color?: "primary" | "success" | "warning" | "destructive" | "info";
  details?: React.ReactNode;
  onClick?: () => void;
  sparklineData?: number[];
  animateValue?: boolean;
  prefix?: string;
  suffix?: string;
}

interface SmartKPIGridProps {
  kpis: KPIData[];
  columns?: 2 | 3 | 4 | 5 | 6;
  variant?: "default" | "compact" | "glass";
}

const colorMap = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
  info: "border-l-info",
};

const iconColorMap = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
  info: "text-info bg-info/10",
};

const KPICard = memo(({ kpi, index, variant }: { kpi: KPIData; index: number; variant: string }) => {
  const Icon = kpi.icon;
  const color = kpi.color || "primary";
  const hasInteraction = kpi.details || kpi.onClick;
  const isNumeric = typeof kpi.value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className={cn(
          "border-l-4 group relative overflow-hidden transition-all duration-200",
          colorMap[color],
          hasInteraction && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
          variant === "glass" && "bg-card/80 backdrop-blur-sm"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">{kpi.title}</p>
              <div className="mt-1">
                {isNumeric && kpi.animateValue !== false ? (
                  <AnimatedCounter
                    value={kpi.value as number}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    className="text-2xl font-bold text-foreground"
                  />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{kpi.prefix}{kpi.value}{kpi.suffix}</p>
                )}
              </div>

              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              )}

              {kpi.trend !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : kpi.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    kpi.trend > 0 ? "text-success" : kpi.trend < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
                  </span>
                  {kpi.trendLabel && (
                    <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
                  )}
                </div>
              )}

              {kpi.progress !== undefined && (
                <div className="mt-3 space-y-1">
                  <Progress value={kpi.progress} className="h-1.5" />
                  {kpi.progressLabel && (
                    <p className="text-[10px] text-muted-foreground">{kpi.progressLabel}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className={cn("p-2 rounded-lg", iconColorMap[color])}>
                <Icon className="h-5 w-5" />
              </div>
              {kpi.sparklineData && kpi.sparklineData.length > 0 && (
                <SparklineChart
                  data={kpi.sparklineData}
                  color={color}
                  width={80}
                  height={24}
                />
              )}
              {hasInteraction && (
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

KPICard.displayName = "KPICard";

export function SmartKPIGrid({ kpis, columns = 4, variant = "default" }: SmartKPIGridProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  const handleClick = (kpi: KPIData) => {
    if (kpi.onClick) kpi.onClick();
    else if (kpi.details) setSelectedKPI(kpi);
  };

  return (
    <>
      <div className={cn("grid gap-4", gridCols[columns])}>
        {kpis.map((kpi, i) => (
          <div key={kpi.id} onClick={() => (kpi.details || kpi.onClick) && handleClick(kpi)}>
            <KPICard kpi={kpi} index={i} variant={variant} />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedKPI && <selectedKPI.icon className="h-5 w-5" />}
              {selectedKPI?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedKPI?.details}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
