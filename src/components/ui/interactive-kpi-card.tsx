/**
 * Interactive KPI Card - Premium KPI visualization component
 * Features: drill-down, trends, comparisons, animations
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis
} from "recharts";

export interface KPITrend {
  value: number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  isPositive: boolean;
}

export interface KPIComparison {
  label: string;
  value: number;
  difference: number;
}

export interface KPIBreakdown {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface KPISparklineData {
  date: string;
  value: number;
}

export interface InteractiveKPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: KPITrend;
  target?: {
    value: number;
    label?: string;
    progress?: number;
  };
  comparison?: KPIComparison;
  breakdown?: KPIBreakdown[];
  sparklineData?: KPISparklineData[];
  status?: "success" | "warning" | "danger" | "info" | "neutral";
  aiInsight?: string;
  onClick?: () => void;
  onDrillDown?: () => void;
  variant?: "default" | "compact" | "detailed" | "mini";
  className?: string;
  loading?: boolean;
  gradient?: string;
}

export function InteractiveKPICard({
  title,
  value,
  unit,
  icon,
  description,
  trend,
  target,
  comparison,
  breakdown,
  sparklineData,
  status = "neutral",
  aiInsight,
  onClick,
  onDrillDown,
  variant = "default",
  className,
  loading = false,
  gradient,
}: InteractiveKPICardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    success: {
      bg: "from-success/10 to-success/15",
      border: "border-success/20",
      text: "text-success",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    warning: {
      bg: "from-warning/10 to-warning/15",
      border: "border-warning/20",
      text: "text-warning",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    danger: {
      bg: "from-destructive/10 to-destructive/15",
      border: "border-destructive/20",
      text: "text-destructive",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    info: {
      bg: "from-primary/10 to-primary/15",
      border: "border-primary/20",
      text: "text-primary",
      icon: <Info className="h-4 w-4" />,
    },
    neutral: {
      bg: "from-muted/50 to-muted/30",
      border: "border-border",
      text: "text-foreground",
      icon: null,
    },
  };

  const config = statusConfig[status];

  const TrendIcon = trend?.changeType === "increase" 
    ? TrendingUp 
    : trend?.changeType === "decrease" 
      ? TrendingDown 
      : Minus;

  const formatValue = (val: number | string) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 2,
      }).format(val);
    }
    return val;
  };

  // Mini variant
  if (variant === "mini") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
          gradient ? `bg-gradient-to-br ${gradient}` : `bg-gradient-to-br ${config.bg}`,
          config.border,
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {icon && <div className={cn("opacity-70", config.text)}>{icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="font-bold truncate">
            {formatValue(value)}
            {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
        {trend && (
          <div className={cn("flex items-center text-xs", trend.isPositive ? "text-success" : "text-destructive")}>
            <TrendIcon className="h-3 w-3 mr-0.5" />
            {Math.abs(trend.change)}%
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          gradient ? `bg-gradient-to-br ${gradient}` : `bg-gradient-to-br ${config.bg}`,
          config.border,
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {icon && <div className={cn("opacity-70", config.text)}>{icon}</div>}
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            {trend && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {Math.abs(trend.change)}%
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatValue(value)}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {target && (
            <div className="mt-2">
              <Progress value={target.progress || (Number(value) / target.value) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {formatValue(target.value)} {unit}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg overflow-hidden",
        gradient ? `bg-gradient-to-br ${gradient}` : `bg-gradient-to-br ${config.bg}`,
        config.border,
        onClick && "cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <motion.div
                className={cn("p-2 rounded-lg bg-background/50", config.text)}
                whileHover={{ scale: 1.1 }}
              >
                {icon}
              </motion.div>
            )}
            <div>
              <h3 className="font-medium text-sm">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {config.icon && <span className={config.text}>{config.icon}</span>}
            {onDrillDown && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDrillDown();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Value */}
        <motion.div
          className="flex items-baseline gap-2 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-3xl font-bold">{formatValue(value)}</span>
          {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
        </motion.div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className={cn(
                trend.isPositive 
                  ? "bg-success/10 text-success border-success/20" 
                  : "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              <TrendIcon className="h-3 w-3 mr-1" />
              {trend.change > 0 ? "+" : ""}{trend.change}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs período anterior</span>
          </div>
        )}

        {/* Target Progress */}
        {target && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                {target.label || "Meta"}
              </span>
              <span className="font-medium">
                {formatValue(target.value)} {unit}
              </span>
            </div>
            <Progress 
              value={target.progress || (Number(value) / target.value) * 100} 
              className="h-2" 
            />
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-16 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="url(#sparklineGradient)"
                  strokeWidth={2}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [formatValue(val as number), ""]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Breakdown (detailed variant) */}
        {variant === "detailed" && breakdown && breakdown.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs font-medium text-muted-foreground">Composição</p>
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${breakdown.indexOf(item) * 60}, 70%, 50%)` }}
                />
                <span className="text-xs flex-1">{item.label}</span>
                <span className="text-xs font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Comparison */}
        {comparison && (
          <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg text-sm">
            <span className="text-muted-foreground">{comparison.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatValue(comparison.value)}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  comparison.difference > 0 
                    ? "border-success/20 text-success" 
                    : "border-destructive/20 text-destructive"
                )}
              >
                {comparison.difference > 0 ? "+" : ""}{comparison.difference}%
              </Badge>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {aiInsight && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-xs bg-primary/5 hover:bg-primary/10"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Insight IA
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm">{aiInsight}</p>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
}

export default InteractiveKPICard;
