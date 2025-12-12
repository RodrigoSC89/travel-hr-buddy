import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  status?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  subtitle?: string;
  progress?: number;
  variant?: "default" | "green" | "blue" | "purple" | "orange";
  description?: string;
}

const KPICard = ({
  title,
  value,
  change,
  status = "neutral",
  icon,
  subtitle,
  progress,
  variant = "default",
  description
}: KPICardProps) => {
  const getVariantClass = () => {
    switch (variant) {
    case "green":
      return "card-high-contrast-green";
    case "blue":
      return "card-high-contrast-blue";
    case "purple":
      return "card-high-contrast-purple";
    case "orange":
      return "card-high-contrast-orange";
    default:
      return "";
    }
  };

  const getTrendIcon = () => {
    if (!change) return null;
    return status === "up" ? (
      <TrendingUp className="h-4 w-4" aria-label="Tendência positiva" />
    ) : (
      <TrendingDown className="h-4 w-4" aria-label="Tendência negativa" />
    );
  });

  return (
    <Card className={`${getVariantClass()} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold" aria-label={title}>
            {title}
          </CardTitle>
          {icon && <div aria-hidden="true">{icon}</div>}
        </div>
        {description && (
          <CardDescription className="text-xs opacity-90">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" aria-label={`Valor: ${value}`}>
              {value}
            </span>
            {change !== undefined && (
              <Badge
                variant={status === "up" ? "default" : "destructive"}
                className="gap-1"
                aria-label={`Mudança: ${change > 0 ? "+" : ""}${change}%`}
              >
                {getTrendIcon()}
                {change > 0 ? "+" : ""}
                {change}%
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm opacity-80" aria-label={subtitle}>
              {subtitle}
            </p>
          )}
          {progress !== undefined && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" aria-label={`Progresso: ${progress}%`} />
              <p className="text-xs opacity-70" aria-label={`Meta: ${progress}%`}>
                {progress}% da meta
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
