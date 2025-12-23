/**
 * Responsive Container Component - Uses named imports
 */
import type { ReactNode, FC } from "react";
import { cn } from "@/lib/utils";
import { getContainerStyles, mobileClasses, spacing } from "@/styles/mobile-ui-kit";

interface ResponsiveContainerProps {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  noPadding?: boolean;
  fullHeight?: boolean;
  safeArea?: boolean;
}

export const ResponsiveContainer: FC<ResponsiveContainerProps> = ({
  children,
  size = "xl",
  className,
  noPadding = false,
  fullHeight = false,
  safeArea = false,
}) => {
  const containerStyles = getContainerStyles(size);
  
  return (
    <div
      className={cn(
        "responsive-container",
        fullHeight && "h-full",
        !noPadding && mobileClasses.responsivePadding,
        safeArea && [
          mobileClasses.safeAreaTop,
          mobileClasses.safeAreaBottom,
          mobileClasses.safeAreaLeft,
          mobileClasses.safeAreaRight,
        ],
        className
      )}
      style={{
        ...(!noPadding ? {} : containerStyles),
      }}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: keyof typeof spacing;
  className?: string;
}

export const ResponsiveGrid: FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className,
}) => {
  const gridCols = {
    xs: columns.xs || 1,
    sm: columns.sm || columns.xs || 1,
    md: columns.md || columns.sm || columns.xs || 1,
    lg: columns.lg || columns.md || columns.sm || columns.xs || 1,
    xl: columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1,
  };

  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${gridCols.xs}`,
        `sm:grid-cols-${gridCols.sm}`,
        `md:grid-cols-${gridCols.md}`,
        `lg:grid-cols-${gridCols.lg}`,
        `xl:grid-cols-${gridCols.xl}`,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: ReactNode;
  direction?: "vertical" | "horizontal" | "responsive";
  gap?: keyof typeof spacing;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
}

export const ResponsiveStack: FC<ResponsiveStackProps> = ({
  children,
  direction = "vertical",
  gap = 4,
  align = "stretch",
  justify = "start",
  className,
}) => {
  const directionClasses = {
    vertical: "flex flex-col",
    horizontal: "flex flex-row",
    responsive: mobileClasses.stackOnMobile,
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
