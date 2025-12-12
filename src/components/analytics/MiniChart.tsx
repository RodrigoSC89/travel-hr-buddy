/**
import { useMemo } from "react";;
 * Mini Chart Component
 * Compact sparkline-style chart for inline metrics
 */

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  type?: "line" | "bar";
  color?: string;
  height?: number;
  width?: number;
  className?: string;
  showTrend?: boolean;
}

export const MiniChart = memo(function MiniChart({
  data,
  type = "line",
  color = "hsl(var(--primary))",
  height = 24,
  width = 80,
  className,
  showTrend = false
}: MiniChartProps) {
  const { path, trend, min, max } = useMemo(() => {
    if (data.length < 2) return { path: "", trend: 0, min: 0, max: 0 };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate trend
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;

    // Generate SVG path
    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    if (type === "line") {
      const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * effectiveWidth;
        const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
        return `${x},${y}`;
      });
      return { 
        path: `M${points.join(" L")}`, 
        trend, 
        min, 
        max 
      };
    }

    // Bar chart
    const barWidth = effectiveWidth / data.length - 1;
    const bars = data.map((value, index) => {
      const x = padding + index * (barWidth + 1);
      const barHeight = ((value - min) / range) * effectiveHeight;
      const y = padding + effectiveHeight - barHeight;
      return `M${x},${padding + effectiveHeight} L${x},${y} L${x + barWidth},${y} L${x + barWidth},${padding + effectiveHeight}`;
    });
    return { 
      path: bars.join(" "), 
      trend, 
      min, 
      max 
    });
  }, [data, type, width, height]);

  const trendColor = trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <path
          d={path}
          fill={type === "bar" ? color : "none"}
          stroke={type === "line" ? color : "none"}
          strokeWidth={type === "line" ? 1.5 : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={type === "bar" ? 0.6 : 1}
        />
        {type === "line" && data.length > 0 && (
          <circle
            cx={width - 2}
            cy={2 + (height - 4) - ((data[data.length - 1] - min) / (max - min || 1)) * (height - 4)}
            r={2}
            fill={color}
          />
        )}
      </svg>
      {showTrend && (
        <span className={cn("text-xs font-medium", trendColor)}>
          {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
        </span>
      )}
    </div>
  );
});

export default MiniChart;
