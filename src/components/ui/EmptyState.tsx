import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Unified EmptyState component for displaying empty or no-data states
 * Consolidates empty-state.tsx and EmptyState from enhanced-status-components.tsx
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
}) => {
  const Icon = typeof icon === "function" ? icon : null;

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        {Icon && (
          <div className="mb-4 p-3 rounded-full bg-muted">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="default" aria-label={actionLabel}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 shadow-soft">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold transition-colors"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
