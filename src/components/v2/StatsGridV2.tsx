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
    bg: "from-blue-500/10 to-cyan-500/5",
    icon: "bg-blue-500/20 text-blue-500",
    text: "text-blue-500"
  },
  purple: {
    bg: "from-purple-500/10 to-pink-500/5",
    icon: "bg-purple-500/20 text-purple-500",
    text: "text-purple-500"
  },
  green: {
    bg: "from-green-500/10 to-emerald-500/5",
    icon: "bg-green-500/20 text-green-500",
    text: "text-green-500"
  },
  orange: {
    bg: "from-orange-500/10 to-amber-500/5",
    icon: "bg-orange-500/20 text-orange-500",
    text: "text-orange-500"
  },
  yellow: {
    bg: "from-yellow-500/10 to-amber-500/5",
    icon: "bg-yellow-500/20 text-yellow-500",
    text: "text-yellow-500"
  },
  red: {
    bg: "from-red-500/10 to-rose-500/5",
    icon: "bg-red-500/20 text-red-500",
    text: "text-red-500"
  },
  cyan: {
    bg: "from-cyan-500/10 to-teal-500/5",
    icon: "bg-cyan-500/20 text-cyan-500",
    text: "text-cyan-500"
  },
  teal: {
    bg: "from-teal-500/10 to-emerald-500/5",
    icon: "bg-teal-500/20 text-teal-500",
    text: "text-teal-500"
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
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const color = stat.color || "blue";
        const colors = colorClasses[color];
        
        return (
          <Card 
            key={index} 
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
                    stat.trend.direction === "up" && "text-green-500",
                    stat.trend.direction === "down" && "text-red-500",
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
