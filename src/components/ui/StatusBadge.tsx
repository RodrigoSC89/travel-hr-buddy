import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusDot, getPriorityColor, getVesselStatusColor } from "@/lib/status-utils";

export interface StatusBadgeProps {
  status: string;
  type?: "default" | "priority" | "vessel";
  className?: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

/**
 * Unified StatusBadge component with semantic colors
 * Consolidates StatusBadge from enhanced-status-components.tsx
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = "default", 
  className,
  variant = "secondary"
}) => {
  const getColorClass = () => {
    switch (type) {
    case "priority":
      return getPriorityColor(status);
    case "vessel":
      return getVesselStatusColor(status);
    default:
      return getStatusColor(status);
    }
  };

  return (
    <Badge 
      className={cn(getColorClass(), className)}
      variant={variant}
    >
      {status}
    </Badge>
  );
};

export interface StatusIndicatorProps {
  status: string;
  label?: string;
  showDot?: boolean;
  className?: string;
  type?: "default" | "priority" | "vessel";
}

/**
 * StatusIndicator with optional dot visualization
 * Consolidates StatusIndicator from enhanced-status-components.tsx
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showDot = true,
  className,
  type = "default"
}) => {
  const getDotColor = () => {
    switch (type) {
    case "priority":
      return getPriorityColor(status);
    case "vessel":
      return getVesselStatusColor(status);
    default:
      return getStatusDot(status);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showDot && (
        <div className={cn("w-2 h-2 rounded-full", getDotColor())} />
      )}
      <span className="text-sm font-medium">
        {label || status}
      </span>
    </div>
  );
};
