/**
 * Optimized Dashboard Layout Grid
 * PATCH 625 - Performance-optimized responsive layout
 */

import { memo, memo, ReactNode, useMemo } from "react";

interface LayoutGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const LayoutGrid = memo(function({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 4 } 
}: LayoutGridProps) {
  const gridClasses = [
    "grid",
    "gap-4",
    // Mobile
    `grid-cols-${columns.mobile || 1}`,
    // Tablet
    columns.tablet && `md:grid-cols-${columns.tablet}`,
    // Desktop
    columns.desktop && `lg:grid-cols-${columns.desktop}`,
    // Performance optimizations
    "will-change-auto",
    // Prevent layout shift
    "min-h-[120px]",
  ].filter(Boolean).join(" ");

  return (
    <div className={gridClasses} style={{ 
      // Ensure minimum dimensions to prevent CLS
      minHeight: "min-content",
      contentVisibility: "auto", // Only render visible items
    }}>
      {children}
    </div>
  );
});
