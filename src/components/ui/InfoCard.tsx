import type { ReactNode, FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export interface InfoCardProps {
  title: string;
  description?: string;
  status?: string;
  children?: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

/**
 * Unified InfoCard component with proper contrast and variant styling
 */
export const InfoCard: FC<InfoCardProps> = ({
  title,
  description,
  status,
  children,
  variant = "default",
  className
}) => {
  const getVariantClasses = () => {
    switch (variant) {
    case "success":
      return "border-success/50 bg-success/5";
    case "warning":
      return "border-warning/50 bg-warning/5";
    case "error":
      return "border-destructive/50 bg-destructive/5";
    case "info":
      return "border-info/50 bg-info/5";
    default:
      return "border-border bg-card";
    }
  };

  return (
    <Card className={cn(getVariantClasses(), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {status && <StatusBadge status={status} />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default InfoCard;
