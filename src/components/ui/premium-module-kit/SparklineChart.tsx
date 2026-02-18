/**
 * SparklineChart - Mini gráficos inline para KPI cards
 * Benchmark: Linear, Notion, GitHub Insights
 */

import React, { memo, useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "primary" | "success" | "warning" | "destructive" | "info";
  showArea?: boolean;
  strokeWidth?: number;
  className?: string;
  animated?: boolean;
}

const colorVars: Record<string, { stroke: string; fill: string }> = {
  primary: { stroke: "hsl(var(--primary))", fill: "hsl(var(--primary) / 0.15)" },
  success: { stroke: "hsl(var(--success))", fill: "hsl(var(--success) / 0.15)" },
  warning: { stroke: "hsl(var(--warning))", fill: "hsl(var(--warning) / 0.15)" },
  destructive: { stroke: "hsl(var(--destructive))", fill: "hsl(var(--destructive) / 0.15)" },
  info: { stroke: "hsl(var(--info))", fill: "hsl(var(--info) / 0.15)" },
};

export const SparklineChart = memo(({
  data,
  width = 120,
  height = 32,
  color = "primary",
  showArea = true,
  strokeWidth = 1.5,
  className = "",
  animated = true,
}: SparklineChartProps) => {
  const { linePath, areaPath } = useMemo(() => {
    if (!data.length) return { linePath: "", areaPath: "" };

    const padding = 2;
    const w = width - padding * 2;
    const h = height - padding * 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => ({
      x: padding + (i / (data.length - 1)) * w,
      y: padding + h - ((val - min) / range) * h,
    }));

    // Smooth cubic bezier path
    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      line += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const area = `${line} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { linePath: line, areaPath: area };
  }, [data, width, height]);

  const colors = colorVars[color] || colorVars.primary;

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={colors.fill}
          opacity={0.6}
        >
          {animated && (
            <animate
              attributeName="opacity"
              from="0"
              to="0.6"
              dur="0.8s"
              fill="freeze"
            />
          )}
        </path>
      )}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="1s"
            fill="freeze"
          />
        )}
      </path>
      {/* Dot no último ponto */}
      {data.length > 0 && (() => {
        const padding = 2;
        const w = width - padding * 2;
        const h = height - padding * 2;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const lastVal = data[data.length - 1];
        const x = padding + ((data.length - 1) / (data.length - 1)) * w;
        const y = padding + h - ((lastVal - min) / range) * h;
        return (
          <circle
            cx={x}
            cy={y}
            r={2.5}
            fill={colors.stroke}
          >
            {animated && (
              <animate
                attributeName="r"
                values="0;2.5;2;2.5"
                dur="1.2s"
                fill="freeze"
              />
            )}
          </circle>
        );
      })()}
    </svg>
  );
});

SparklineChart.displayName = "SparklineChart";
