/**
 * Smart KPI Grid - Cards de indicadores com drill-down
 */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, ChevronRight, type LucideIcon } from "lucide-react";

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
}

interface SmartKPIGridProps {
  kpis: KPIData[];
  columns?: 2 | 3 | 4 | 5 | 6;
}

const colorMap = {
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
  info: "border-l-info",
};

const iconColorMap = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export function SmartKPIGrid({ kpis, columns = 4 }: SmartKPIGridProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  const handleClick = (kpi: KPIData) => {
    if (kpi.onClick) {
      kpi.onClick();
    } else if (kpi.details) {
      setSelectedKPI(kpi);
    }
  };

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const color = kpi.color || "primary";
          const hasInteraction = kpi.details || kpi.onClick;

          return (
            <Card
              key={kpi.id}
              className={`border-l-4 ${colorMap[color]} ${hasInteraction ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
              onClick={() => hasInteraction && handleClick(kpi)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    
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
                        <span className={`text-xs font-medium ${
                          kpi.trend > 0 ? "text-success" : 
                          kpi.trend < 0 ? "text-destructive" : 
                          "text-muted-foreground"
                        }`}>
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
                    <Icon className={`h-6 w-6 ${iconColorMap[color]} opacity-80`} />
                    {hasInteraction && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drill-down Dialog */}
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
