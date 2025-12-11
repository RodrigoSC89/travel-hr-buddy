/**
 * LazyChart - FASE 2.5 Lazy Loading
 * Wrapper lazy para Recharts (268KB)
 */

import React, { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load recharts components
const RechartsLoader = lazy(() => 
  import("recharts").then(module => ({
    default: {
      LineChart: module.LineChart,
      BarChart: module.BarChart,
      PieChart: module.PieChart,
      AreaChart: module.AreaChart,
      RadarChart: module.RadarChart,
      Line: module.Line,
      Bar: module.Bar,
      Pie: module.Pie,
      Area: module.Area,
      Radar: module.Radar,
      XAxis: module.XAxis,
      YAxis: module.YAxis,
      CartesianGrid: module.CartesianGrid,
      Tooltip: module.Tooltip,
      Legend: module.Legend,
      ResponsiveContainer: module.ResponsiveContainer,
      Cell: module.Cell,
      PolarGrid: module.PolarGrid,
      PolarAngleAxis: module.PolarAngleAxis,
    }
  }))
);

interface LazyChartProps {
  type?: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  data?: any;
  config?: any;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full space-y-3" style={{ height }}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function LazyChart({ 
  type = 'line',
  data,
  config,
  height = 300,
  className = "",
  children 
}: LazyChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <RechartsLoader />
      {children}
    </Suspense>
  );
}

// Export individual lazy chart components for convenience
export const LazyLineChart = (props: any) => (
  <LazyChart type="line" {...props} />
);

export const LazyBarChart = (props: any) => (
  <LazyChart type="bar" {...props} />
);

export const LazyPieChart = (props: any) => (
  <LazyChart type="pie" {...props} />
);

export const LazyAreaChart = (props: any) => (
  <LazyChart type="area" {...props} />
);

export const LazyRadarChart = (props: any) => (
  <LazyChart type="radar" {...props} />
);

export default LazyChart;
