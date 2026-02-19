/**
 * CIIRatingDashboard - IMO CII Rating with EU ETS Exposure
 * Calls calculate-cii edge function
 * Surpasses RightShip/DNV Navigator: auto-calculated from bunker+voyage data
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, AlertTriangle, TrendingDown } from "lucide-react";

interface CIIData {
  current_cii: number;
  required_cii: number;
  rating: "A" | "B" | "C" | "D" | "E";
  co2_emitted_mt: number;
  co2_budget_mt: number;
  reduction_needed_percent: number;
  eu_ets_exposure_eur: number;
  recommendations: string[];
}

const RATING_COLORS: Record<string, string> = {
  A: "text-success bg-success/10 border-success/30",
  B: "text-success bg-success/10 border-success/30",
  C: "text-warning bg-warning/10 border-warning/30",
  D: "text-warning bg-warning/10 border-warning/30",
  E: "text-destructive bg-destructive/10 border-destructive/30",
};

interface CIIRatingDashboardProps {
  vesselId: string;
  vesselName?: string;
}

export function CIIRatingDashboard({ vesselId, vesselName }: CIIRatingDashboardProps) {
  const { data: cii, isLoading } = useQuery({
    queryKey: ["cii-rating", vesselId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("calculate-cii", {
        body: { vesselId },
      });
      if (error) {
        // Edge function 404 = vessel not found, return null gracefully
        console.warn("[CII] Edge function error:", error.message);
        return null;
      }
      if (data?.error) {
        console.warn("[CII] Vessel not found or no data:", data.error);
        return null;
      }
      return data as CIIData;
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!vesselId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!cii) return null;

  const ratingClass = RATING_COLORS[cii.rating] ?? RATING_COLORS.C;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Leaf className="h-4 w-4 text-success" />
          CII Rating — {vesselName || "Vessel"}
          <Badge variant="outline" className="text-[10px] ml-auto">IMO DCS</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating Badge */}
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-black w-16 h-16 rounded-xl flex items-center justify-center border-2 ${ratingClass}`}>
            {cii.rating}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex gap-4 text-sm">
              <span>CII Atual: <strong>{cii.current_cii?.toFixed(4)}</strong></span>
              <span className="text-muted-foreground">Req: {cii.required_cii?.toFixed(4)}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span>CO₂: <strong>{cii.co2_emitted_mt?.toFixed(0)}t</strong></span>
              <span className="text-muted-foreground">Budget: {cii.co2_budget_mt?.toFixed(0)}t</span>
            </div>
            {cii.eu_ets_exposure_eur > 0 && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                EU ETS Exposure: €{cii.eu_ets_exposure_eur?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Reduction needed */}
        {cii.reduction_needed_percent > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <TrendingDown className="h-4 w-4 text-warning shrink-0" />
            <p className="text-xs text-warning">
              Reduzir <strong>{cii.reduction_needed_percent?.toFixed(1)}%</strong> para atingir Rating C
            </p>
          </div>
        )}

        {/* AI Recommendations */}
        {cii.recommendations?.length > 0 && (
          <div className="space-y-1">
            {cii.recommendations.map((r, i) => (
              <p key={`cii-rec-${i}`} className="text-xs text-muted-foreground flex items-start gap-1">
                <span className="text-primary mt-0.5">🤖</span> {r}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
