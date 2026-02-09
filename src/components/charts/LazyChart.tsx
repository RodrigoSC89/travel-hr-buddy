/**
 * LazyChart - Lazy-loaded Chart.js wrapper
 * PATCH 850.5 - Reduces initial bundle by ~200KB
 */
import React, { useEffect, useRef, useState, useMemo } from "react";
import { loadChartJS } from "@/lib/performance/heavy-libs-loader";
import { Skeleton } from "@/components/ui/skeleton";

type ChartType = "line" | "bar" | "doughnut" | "pie" | "radar" | "polarArea";

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  [key: string]: unknown;
}

interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

interface LazyChartProps {
  type: ChartType;
  data: ChartData;
  options?: Record<string, unknown>;
  className?: string;
  height?: number;
  width?: number;
}

export const LazyChart: React.FC<LazyChartProps> = ({
  type,
  data,
  options = {},
  className = "",
  height = 300,
  width,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Chart.js instance — stored as unknown since it's dynamically loaded
  const chartRef = useRef<{ destroy: () => void; update: (mode?: string) => void; data: unknown } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize data and options to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    let mounted = true;

    const initChart = async () => {
      if (!canvasRef.current) return;

      try {
        const ChartJS = await loadChartJS();
        
        if (!mounted) return;

        // Register required components
        const { Chart, registerables } = ChartJS;
        Chart.register(...registerables);

        // Destroy existing chart
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Create new chart — cast to controlled interface
        const instance = new Chart(canvasRef.current, {
          type,
          data: memoizedData as never,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...memoizedOptions,
          } as never,
        });

        chartRef.current = instance as unknown as typeof chartRef.current;
        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          setError("Erro ao carregar gráfico");
          setIsLoading(false);
        }
      }
    };

    initChart();

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [type, memoizedData, memoizedOptions]);

  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current && !isLoading) {
      chartRef.current.data = memoizedData;
      chartRef.current.update("none");
    }
  }, [memoizedData, isLoading]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}
        style={{ height, width }}
      >
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={isLoading ? "opacity-0" : "opacity-100 transition-opacity"}
      />
    </div>
  );
};

// Convenience components for specific chart types
export const LazyLineChart: React.FC<Omit<LazyChartProps, "type">> = (props) => (
  <LazyChart type="line" {...props} />
);

export const LazyBarChart: React.FC<Omit<LazyChartProps, "type">> = (props) => (
  <LazyChart type="bar" {...props} />
);

export const LazyDoughnutChart: React.FC<Omit<LazyChartProps, "type">> = (props) => (
  <LazyChart type="doughnut" {...props} />
);

export const LazyPieChart: React.FC<Omit<LazyChartProps, "type">> = (props) => (
  <LazyChart type="pie" {...props} />
);

export default LazyChart;
