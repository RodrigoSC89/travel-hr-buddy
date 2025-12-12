import { useMemo } from "react";;
import React, { useMemo } from "react";
import { useConnectionAdaptive } from "@/hooks/useConnectionAdaptive";
import { OptimizedSkeleton } from "@/components/unified/Skeletons.unified";

interface AdaptiveChartProps {
  children: React.ReactNode;
  dataPoints?: number;
  isLoading?: boolean;
  height?: number;
}

/**
 * Wrapper para gráficos que adapta a renderização baseado na conexão
 * - Conexão lenta: reduz pontos de dados, desabilita animações
 * - Conexão moderada: animações simplificadas
 * - Conexão rápida: experiência completa
 */
export const AdaptiveChart: React.FC<AdaptiveChartProps> = ({
  children,
  dataPoints = 0,
  isLoading = false,
  height = 300,
}) => {
  const { quality, recommendations } = useConnectionAdaptive();

  const shouldSimplify = useMemo(() => {
    return quality === "slow" || quality === "offline" || dataPoints > 100;
  }, [quality, dataPoints]);

  if (isLoading) {
    return (
      <div style={{ height }} className="w-full">
        <OptimizedSkeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  if (quality === "offline") {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center bg-muted/30 rounded-lg border border-border/50"
      >
        <p className="text-muted-foreground text-sm">
          Gráfico indisponível offline
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`w-full transition-opacity ${shouldSimplify ? "chart-simplified" : ""}`}
      style={{ 
        height,
        "--chart-animation-duration": recommendations.enableAnimations ? "300ms" : "0ms"
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

/**
 * Hook para otimizar dados de gráficos baseado na conexão
 */
export function useAdaptiveChartData<T>(data: T[], maxPoints?: number): T[] {
  const { quality } = useConnectionAdaptive();

  return useMemo(() => {
    if (!data || data.length === 0) return data;

    let targetPoints: number;
    
    switch (quality) {
    case "slow":
      targetPoints = maxPoints ? Math.min(maxPoints, 20) : 20;
      break;
    case "moderate":
      targetPoints = maxPoints ? Math.min(maxPoints, 50) : 50;
      break;
    default:
      targetPoints = maxPoints || data.length;
    }

    if (data.length <= targetPoints) return data;

    // Amostragem uniforme para reduzir pontos
    const step = Math.ceil(data.length / targetPoints);
    return data.filter((_, index) => index % step === 0);
  }, [data, quality, maxPoints]);
}
