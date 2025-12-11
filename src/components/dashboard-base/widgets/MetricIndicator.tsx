/**
 * Metric Indicator Widget
 * Componente reutilizável para exibir métricas com progress bar
 * FASE B.2 - Consolidação de Dashboards
 */

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MetricConfig } from "@/types/dashboard-config";
import { cn } from "@/lib/utils";

interface MetricIndicatorProps {
  config: MetricConfig;
  className?: string;
}

export const MetricIndicator = ({ config, className }: MetricIndicatorProps) => {
  const { label, value, target, unit = "", color = "blue", format = "number" } = config;

  const percentage = target ? (value / target) * 100 : 0;
  const isExceeding = percentage >= 100;
  const isWarning = percentage >= 75 && percentage < 100;

  const formatValue = (val: number): string => {
    switch (format) {
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "currency":
        return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      case "time":
        return `${val.toFixed(1)}h`;
      default:
        return val.toLocaleString("pt-BR");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge
          variant={isExceeding ? "default" : isWarning ? "outline" : "secondary"}
        >
          {formatValue(value)} {unit}
        </Badge>
      </div>

      {target && (
        <>
          <Progress
            value={Math.min(percentage, 100)}
            className={cn(
              "h-2",
              isExceeding && "bg-green-200 dark:bg-green-900",
              isWarning && "bg-yellow-200 dark:bg-yellow-900"
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Meta: {formatValue(target)} {unit}</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        </>
      )}
    </div>
  );
};
