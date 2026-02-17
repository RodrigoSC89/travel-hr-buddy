/**
 * Pack History & Comparison - Compare evolution between audit packs
 */
import React, { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Calendar, Eye, History } from "lucide-react";
import type { EvidencePack } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  packs: EvidencePack[];
  onSelectPack: (packId: string) => void;
}

export const PackHistoryComparison = memo(({ packs, onSelectPack }: Props) => {
  const sortedPacks = useMemo(() =>
    [...packs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [packs]
  );

  const getTrend = (current: EvidencePack, previous?: EvidencePack) => {
    if (!previous) return null;
    const diff = current.overall_score - previous.overall_score;
    if (diff > 2) return { icon: TrendingUp, color: "text-green-500", label: `+${diff.toFixed(0)}%` };
    if (diff < -2) return { icon: TrendingDown, color: "text-destructive", label: `${diff.toFixed(0)}%` };
    return { icon: Minus, color: "text-muted-foreground", label: "Estável" };
  };

  if (packs.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico de Pacotes ({packs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          {sortedPacks.map((pack, idx) => {
            const previous = sortedPacks[idx + 1];
            const trend = getTrend(pack, previous);
            const scoreColor = pack.overall_score >= 80 ? "text-green-500" : pack.overall_score >= 50 ? "text-yellow-500" : "text-destructive";

            return (
              <div
                key={pack.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => onSelectPack(pack.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{pack.title}</p>
                    {idx === 0 && <Badge variant="default" className="text-[10px] h-4">Mais Recente</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pack.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{pack.total_elements} elem.</span>
                    <span>{pack.total_items} itens</span>
                    <span className="text-green-500">{pack.matched_items} ✓</span>
                    <span className="text-destructive">{pack.unmatched_items} ✗</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {trend && (
                    <span className={cn("flex items-center gap-1 text-xs font-medium", trend.color)}>
                      <trend.icon className="h-3 w-3" />
                      {trend.label}
                    </span>
                  )}
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", scoreColor)}>{pack.overall_score.toFixed(0)}%</p>
                    <Progress value={pack.overall_score} className="h-1 w-16" />
                  </div>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Eye className="h-3 w-3" /> Ver
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

PackHistoryComparison.displayName = "PackHistoryComparison";
