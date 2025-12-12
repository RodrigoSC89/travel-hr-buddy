import { memo } from 'react';
/**
 * ComponentLoader - FASE A.4
 * 
 * Loading state para componentes individuais
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const ComponentLoader = memo(function({
  message,
  size = "md",
  className,
}: ComponentLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
});
