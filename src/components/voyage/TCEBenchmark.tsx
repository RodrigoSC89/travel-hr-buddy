/**
 * TCEBenchmark - Market TCE Percentile Analysis
 * Calls get-market-tce-benchmark edge function
 * Exclusive: No competitor has integrated market benchmarking
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface BenchmarkData {
  vessel_type: string;
  our_tce: number;
  market_avg: number;
  market_high: number;
  market_low: number;
  percentile: number;
  vs_market_percent: number;
  top_quartile: number;
  index_source: string;
}

interface TCEBenchmarkProps {
  vesselType: string;
  ourTce: number;
}

export function TCEBenchmark({ vesselType, ourTce }: TCEBenchmarkProps) {
  const { data: bm, isLoading } = useQuery({
    queryKey: ["tce-benchmark", vesselType, ourTce],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-market-tce-benchmark", {
        body: { vesselType, ourTce },
      });
      if (error) throw error;
      return data as BenchmarkData;
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!vesselType && ourTce > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!bm) return null;

  const isAboveAvg = (bm.vs_market_percent ?? 0) >= 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          TCE Benchmark — {vesselType}
          <Badge variant="outline" className="text-[10px] ml-auto">{bm.index_source}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{bm.percentile}°</p>
            <p className="text-xs text-muted-foreground">Percentil</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm">
              Nosso TCE: <span className="font-bold">${ourTce.toLocaleString()}/d</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Média mercado: <span className="font-medium">${bm.market_avg?.toLocaleString()}/d</span>
            </p>
            <p className={`text-sm font-bold flex items-center gap-1 justify-end ${isAboveAvg ? "text-success" : "text-destructive"}`}>
              {isAboveAvg ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isAboveAvg ? "+" : ""}{bm.vs_market_percent?.toFixed(1)}% vs mercado
            </p>
          </div>
        </div>

        {/* Visual bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-primary/40 rounded-full"
            style={{ left: "0%", width: `${Math.min(100, bm.percentile)}%` }}
          />
          <div
            className="absolute h-full w-1 bg-primary rounded-full"
            style={{ left: `${Math.min(98, bm.percentile)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>${bm.market_low?.toLocaleString()}</span>
          <span>Top 25%: ${bm.top_quartile?.toLocaleString()}</span>
          <span>${bm.market_high?.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
