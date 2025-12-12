/**
 * KPI Card Widget
 * Componente reutilizável para exibir KPIs
 * FASE B.2 - Consolidação de Dashboards
 */

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPIConfig } from "@/types/dashboard-config";
import { cn } from "@/lib/utils";

interface KPICardProps {
  config: KPIConfig;
  className?: string;
  animated?: boolean;
}

export const KPICard = ({ config, className, animated = true }: KPICardProps) => {
  const {
    title,
    value,
    change,
    trend,
    icon: Icon,
    prefix = "",
    suffix = "",
    target,
    color,
    description
  } = config;

  const isPositive = change !== undefined ? change >= 0 : trend === "up";
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const hasChange = change !== undefined;

  const cardContent = (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-playfair">
              {prefix}{value}{suffix}
            </p>
            
            {hasChange && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="gap-1"
                >
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(change)}%
                </Badge>
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}

            {target !== undefined && (
              <div className="text-xs text-muted-foreground mt-2">
                Meta: {prefix}{target}{suffix}
              </div>
            )}
          </div>

          {Icon && (
            <div
              className={cn(
                "p-3 rounded-lg",
                color ? `bg-${color}-100 dark:bg-${color}-900/20` : 
                  isPositive ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  color ? `text-${color}-600 dark:text-${color}-400` :
                    isPositive ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
});
