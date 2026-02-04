/**
 * InteractiveKPICard - Card de KPI interativo com drill-down e histórico
 * Oferece visualização detalhada ao clicar com mini gráfico sparkline
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  History,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrendData {
  value: number;
  date: string;
}

interface InteractiveKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  status?: "good" | "warning" | "critical" | "neutral";
  progress?: number;
  progressLabel?: string;
  sparklineData?: TrendData[];
  details?: {
    label: string;
    value: string | number;
  }[];
  onDrillDown?: () => void;
  drillDownLabel?: string;
  tooltip?: string;
  className?: string;
}

export function InteractiveKPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  status = "neutral",
  progress,
  progressLabel,
  sparklineData,
  details,
  onDrillDown,
  drillDownLabel = "Ver detalhes",
  tooltip,
  className = "",
}: InteractiveKPICardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "border-l-green-500";
      case "warning":
        return "border-l-amber-500";
      case "critical":
        return "border-l-red-500";
      default:
        return "border-l-primary";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "good":
        return "from-green-500/10";
      case "warning":
        return "from-amber-500/10";
      case "critical":
        return "from-red-500/10";
      default:
        return "from-primary/10";
    }
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground";
    if (trend > 0) return "text-green-500";
    return "text-red-500";
  };

  // Simple sparkline SVG
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const values = sparklineData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 80;
    const height = 24;
    const padding = 2;

    const points = values.map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((v - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const isPositive = values[values.length - 1] >= values[0];

    return (
      <svg width={width} height={height} className="opacity-60">
        <polyline
          fill="none"
          stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(" ")}
        />
      </svg>
    );
  };

  return (
    <motion.div
      layout
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={`border-l-4 ${getStatusColor()} bg-gradient-to-br ${getStatusBg()} to-transparent hover:shadow-md transition-all cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(trend)}%</span>
                    {trendLabel && (
                      <span className="text-muted-foreground">{trendLabel}</span>
                    )}
                  </div>
                )}
              </div>

              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}

              {progress !== undefined && (
                <div className="mt-2 space-y-1">
                  <Progress value={progress} className="h-1.5" />
                  {progressLabel && (
                    <p className="text-xs text-muted-foreground">{progressLabel}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="p-2 rounded-lg bg-background/80">{icon}</div>
              {sparklineData && renderSparkline()}
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          {(details || onDrillDown) && (
            <div className="flex justify-center mt-2 pt-2 border-t border-border/50">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </CardContent>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (details || onDrillDown) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 space-y-3">
                {details && (
                  <div className="grid grid-cols-2 gap-2">
                    {details.map((detail, i) => (
                      <div key={i} className="p-2 rounded-lg bg-background/50">
                        <p className="text-xs text-muted-foreground">{detail.label}</p>
                        <p className="font-medium text-sm">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {onDrillDown && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown();
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {drillDownLabel}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/**
 * KPIGrid - Grid responsivo de KPIs com animação sequencial
 */
interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function KPIGrid({ children, columns = 4, className = "" }: KPIGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
    5: "md:grid-cols-2 lg:grid-cols-5",
    6: "md:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div className={`grid grid-cols-1 ${colsClass[columns]} gap-4 ${className}`}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
