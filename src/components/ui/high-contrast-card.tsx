import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HighContrastCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  colorScheme: "green" | "blue" | "purple" | "orange";
  className?: string;
  onClick?: () => void;
}

const colorClasses = {
  green: {
    card: "bg-card-green dark:bg-card-green border-card-green",
    text: "text-card-green-fg dark:text-card-green-fg",
    icon: "text-card-green-fg/80 dark:text-card-green-fg/80",
    trend: {
      up: "text-emerald-200",
      down: "text-red-200",
      stable: "text-card-green-fg/60"
    }
  },
  blue: {
    card: "bg-card-blue dark:bg-card-blue border-card-blue",
    text: "text-card-blue-fg dark:text-card-blue-fg",
    icon: "text-card-blue-fg/80 dark:text-card-blue-fg/80",
    trend: {
      up: "text-blue-200",
      down: "text-red-200",
      stable: "text-card-blue-fg/60"
    }
  },
  purple: {
    card: "bg-card-purple dark:bg-card-purple border-card-purple",
    text: "text-card-purple-fg dark:text-card-purple-fg",
    icon: "text-card-purple-fg/80 dark:text-card-purple-fg/80",
    trend: {
      up: "text-purple-200",
      down: "text-red-200",
      stable: "text-card-purple-fg/60"
    }
  },
  orange: {
    card: "bg-card-orange dark:bg-card-orange border-card-orange",
    text: "text-card-orange-fg dark:text-card-orange-fg",
    icon: "text-card-orange-fg/80 dark:text-card-orange-fg/80",
    trend: {
      up: "text-orange-200",
      down: "text-red-200",
      stable: "text-card-orange-fg/60"
    }
  }
};

export const HighContrastCard: React.FC<HighContrastCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  colorScheme,
  className,
  onClick
}) => {
  const colors = colorClasses[colorScheme];
  
  return (
    <Card 
      className={cn(
        colors.card,
        "border-2 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title}: ${value}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-semibold", colors.text)}>
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-5 w-5", colors.icon)} aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", colors.text)}>
          {value}
        </div>
        {description && (
          <CardDescription className={cn("mt-1 text-sm font-medium", colors.text, "opacity-90")}>
            {description}
          </CardDescription>
        )}
        {trend && trendValue && (
          <div className={cn(
            "mt-2 flex items-center text-sm font-semibold",
            colors.trend[trend]
          )}>
            <span className="mr-1" aria-label={`Tendência: ${trend === "up" ? "crescimento" : trend === "down" ? "queda" : "estável"}`}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HighContrastCard;
