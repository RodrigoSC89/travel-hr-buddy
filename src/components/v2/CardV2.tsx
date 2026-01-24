/**
 * CardV2 - Card Componente V2
 * Card modular com suporte a ações, loading, e gradientes
 */

import React, { ReactNode } from "react";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CardV2Props {
  children: ReactNode;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  gradient?: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  className?: string;
  loading?: boolean;
}

const gradientClasses = {
  blue: "from-primary/10 to-info/5",
  purple: "from-secondary/10 to-accent/5",
  green: "from-success/10 to-success/5",
  orange: "from-warning/10 to-warning/5",
  yellow: "from-warning/10 to-warning/5",
  red: "from-destructive/10 to-destructive/5",
};

const iconColorClasses = {
  blue: "text-primary",
  purple: "text-secondary-foreground",
  green: "text-success",
  orange: "text-warning",
  yellow: "text-warning",
  red: "text-destructive",
};

export function CardV2({
  children,
  icon: Icon,
  title,
  description,
  gradient,
  badge,
  badgeVariant = "secondary",
  action,
  className,
  loading = false,
}: CardV2Props) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      gradient && `bg-gradient-to-br ${gradientClasses[gradient]}`,
      className
    )}>
      {(title || Icon) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {Icon && (
                <div className={cn(
                  "p-2 rounded-lg",
                  gradient ? `bg-${gradient}-500/20` : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    gradient ? iconColorClasses[gradient] : "text-foreground"
                  )} />
                </div>
              )}
              <span>{title}</span>
              {badge && (
                <Badge variant={badgeVariant} className="ml-2 text-xs">
                  {badge}
                </Badge>
              )}
            </CardTitle>
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
              >
                {action.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : action.icon ? (
                  <action.icon className="h-4 w-4 mr-2" />
                ) : null}
                {action.label}
              </Button>
            )}
          </div>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !Icon && "pt-6")}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default CardV2;
