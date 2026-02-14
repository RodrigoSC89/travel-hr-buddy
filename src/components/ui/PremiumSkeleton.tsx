/**
 * Premium Skeleton Loading - Deep Ocean shimmer effect
 */
import React from "react";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "chart" | "table-row";
  count?: number;
}

const SkeletonBase: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-lg bg-muted/50",
      "before:absolute before:inset-0 before:-translate-x-full",
      "before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent",
      className
    )}
  />
);

export const PremiumSkeleton: React.FC<PremiumSkeletonProps> = ({
  className,
  variant = "text",
  count = 1,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((i) => (
          <div key={i} className="rounded-xl border border-border/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <SkeletonBase className="h-4 w-1/3" />
                <SkeletonBase className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonBase className="h-20 w-full" />
            <div className="flex gap-2">
              <SkeletonBase className="h-8 w-20 rounded-md" />
              <SkeletonBase className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    const heights = [60, 80, 45, 90, 55, 75, 40, 85];
    return (
      <div className={cn("rounded-xl border border-border/50 p-6", className)}>
        <SkeletonBase className="h-5 w-1/4 mb-4" />
        <div className="flex items-end gap-2 h-40">
          {heights.map((h, i) => (
            <SkeletonBase
              key={i}
              className={`flex-1 rounded-t-md h-[${h}%]`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
            <SkeletonBase className="h-8 w-8 rounded-full" />
            <SkeletonBase className="h-4 flex-1" />
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={cn("flex gap-2", className)}>
        {items.map((i) => (
          <SkeletonBase key={i} className="h-10 w-10 rounded-full" />
        ))}
      </div>
    );
  }

  // Default: text lines
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((i) => (
        <SkeletonBase
          key={i}
          className={cn("h-4", i === count - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
};
