/**
 * StatsGridV2 - Grid de Estatísticas V2
 * Cards de métricas com animações e gradientes
 */

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  color?: "blue" | "purple" | "green" | "orange" | "yellow" | "red" | "cyan" | "teal";
  description?: string;
}

interface StatsGridV2Props {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: "from-primary/10 to-info/5",
    icon: "bg-primary/20 text-primary",
    text: "text-primary"
  },
  purple: {
    bg: "from-secondary/10 to-accent/5",
    icon: "bg-secondary/20 text-secondary",
    text: "text-secondary"
  },
  green: {
    bg: "from-success/10 to-success/5",
    icon: "bg-success/20 text-success",
    text: "text-success"
  },
  orange: {
    bg: "from-warning/10 to-warning/5",
    icon: "bg-warning/20 text-warning",
    text: "text-warning"
  },
  yellow: {
    bg: "from-warning/10 to-warning/5",
    icon: "bg-warning/20 text-warning",
    text: "text-warning"
  },
  red: {
    bg: "from-destructive/10 to-destructive/5",
    icon: "bg-destructive/20 text-destructive",
    text: "text-destructive"
  },
  cyan: {
    bg: "from-info/10 to-info/5",
    icon: "bg-info/20 text-info",
    text: "text-info"
  },
  teal: {
    bg: "from-info/10 to-success/5",
    icon: "bg-info/20 text-info",
    text: "text-info"
  },
};

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

export function StatsGridV2({ stats, columns = 4, className }: StatsGridV2Props) {
  return (
    <div className={cn(`grid gap-4 ${columnClasses[columns]}`, className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const color = stat.color || "blue";
        const colors = colorClasses[color];
        
        return (
          <Card 
            key={stat.label}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]",
              `bg-gradient-to-br ${colors.bg}`
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={cn("p-2 rounded-lg", colors.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
                {stat.trend && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend.direction === "up" && "text-success",
                    stat.trend.direction === "down" && "text-destructive",
                    stat.trend.direction === "neutral" && "text-muted-foreground"
                  )}>
                    {stat.trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
                    {stat.trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
                    {stat.trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                    {stat.trend.value}%
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground/80 mt-1">{stat.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default StatsGridV2;
